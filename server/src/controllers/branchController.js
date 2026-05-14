const createAuditLog = require("../utils/auditLogger");
const pool = require("../config/db");

const getBranches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM branches
       WHERE is_deleted = false
       ORDER BY name ASC`
    );

    res.json({
      branches: result.rows,
    });
  } catch (error) {
    console.error("Get branches error:", error.message);
    res.status(500).json({
      message: "Failed to fetch branches",
      error: error.message,
    });
  }
};

const createBranch = async (req, res) => {
  const { name, address, city, state } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        message: "Branch name is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO branches (name, address, city, state)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, address || null, city || null, state || null]
    );

    await createAuditLog({
      user: req.user,
      action: "CREATE",
      entityType: "BRANCH",
      entityId: result.rows[0].id,
      description: `Branch created: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.status(201).json({
      message: "Branch created successfully",
      branch: result.rows[0],
    });
  } catch (error) {
    console.error("Create branch error:", error.message);
    return res.status(500).json({
      message: "Failed to create branch",
      error: error.message,
    });
  }
};

const updateBranch = async (req, res) => {
  const { id } = req.params;
  const { name, address, city, state } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        message: "Branch name is required",
      });
    }

    const result = await pool.query(
      `UPDATE branches
       SET name = $1,
           address = $2,
           city = $3,
           state = $4
       WHERE id = $5
         AND is_deleted = false
       RETURNING *`,
      [name, address || null, city || null, state || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    await createAuditLog({
      user: req.user,
      action: "UPDATE",
      entityType: "BRANCH",
      entityId: result.rows[0].id,
      description: `Branch updated: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: "Branch updated successfully",
      branch: result.rows[0],
    });
  } catch (error) {
    console.error("Update branch error:", error.message);
    return res.status(500).json({
      message: "Failed to update branch",
      error: error.message,
    });
  }
};

const deleteBranch = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM services WHERE branch_id = $1 AND is_deleted = false) AS service_count,
        (SELECT COUNT(*) FROM counters WHERE branch_id = $1 AND is_deleted = false) AS counter_count`,
      [id]
    );

    const serviceCount = Number(check.rows[0].service_count || 0);
    const counterCount = Number(check.rows[0].counter_count || 0);

    if (serviceCount > 0 || counterCount > 0) {
      return res.status(400).json({
        message: `Cannot delete branch. It has ${serviceCount} services and ${counterCount} counters.`,
      });
    }

    const result = await pool.query(
      `UPDATE branches
       SET is_deleted = true
       WHERE id = $1
         AND is_deleted = false
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    await createAuditLog({
      user: req.user,
      action: "SOFT_DELETE",
      entityType: "BRANCH",
      entityId: result.rows[0].id,
      description: `Branch soft deleted: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: "Branch deleted successfully",
      branch: result.rows[0],
    });
  } catch (error) {
    console.error("Delete branch error:", error.message);
    return res.status(500).json({
      message: "Failed to delete branch",
      error: error.message,
    });
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};