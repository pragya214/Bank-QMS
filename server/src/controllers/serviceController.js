const createAuditLog = require("../utils/auditLogger");
const pool = require("../config/db");

const getServicesByBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM services
       WHERE branch_id = $1
         AND is_deleted = false
       ORDER BY name ASC`,
      [branchId]
    );

    return res.json({
      services: result.rows,
    });
  } catch (error) {
    console.error("Get services error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

const createService = async (req, res) => {
  const { branch_id, name, avg_service_time } = req.body;

  try {
    if (!branch_id || !name) {
      return res.status(400).json({
        message: "branch_id and name are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO services (branch_id, name, avg_service_time)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [branch_id, name, avg_service_time || 5]
    );

    await createAuditLog({
      user: req.user,
      action: "CREATE",
      entityType: "SERVICE",
      entityId: result.rows[0].id,
      description: `Service created: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.status(201).json({
      message: "Service created successfully",
      service: result.rows[0],
    });
  } catch (error) {
    console.error("Create service error:", error.message);
    return res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;
  const { branch_id, name, avg_service_time } = req.body;

  try {
    if (!branch_id || !name) {
      return res.status(400).json({
        message: "branch_id and name are required",
      });
    }

    const result = await pool.query(
      `UPDATE services
       SET branch_id = $1,
           name = $2,
           avg_service_time = $3
       WHERE id = $4
         AND is_deleted = false
       RETURNING *`,
      [branch_id, name, avg_service_time || 5, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    await createAuditLog({
      user: req.user,
      action: "UPDATE",
      entityType: "SERVICE",
      entityId: result.rows[0].id,
      description: `Service updated: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: "Service updated successfully",
      service: result.rows[0],
    });
  } catch (error) {
    console.error("Update service error:", error.message);
    return res.status(500).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      `SELECT COUNT(*) FROM tokens WHERE service_id = $1`,
      [id]
    );

    if (Number(check.rows[0].count || 0) > 0) {
      return res.status(400).json({
        message: "Cannot delete service. Tokens are linked.",
      });
    }

    const result = await pool.query(
      `UPDATE services
       SET is_deleted = true
       WHERE id = $1
         AND is_deleted = false
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    await createAuditLog({
      user: req.user,
      action: "SOFT_DELETE",
      entityType: "SERVICE",
      entityId: result.rows[0].id,
      description: `Service soft deleted: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: "Service deleted successfully",
      service: result.rows[0],
    });
  } catch (error) {
    console.error("Delete service error:", error.message);
    return res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

module.exports = {
  getServicesByBranch,
  createService,
  updateService,
  deleteService,
};