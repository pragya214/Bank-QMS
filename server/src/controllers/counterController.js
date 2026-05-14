const createAuditLog = require("../utils/auditLogger");
const pool = require("../config/db");

/**
 * GET /api/counters/:branchId
 * Get counters by branch
 */
const getCountersByBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM counters
       WHERE branch_id = $1
         AND is_deleted = false
       ORDER BY created_at DESC`,
      [branchId]
    );

    return res.json({
      counters: result.rows,
    });
  } catch (error) {
    console.error("Get counters error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch counters",
      error: error.message,
    });
  }
};

/**
 * POST /api/counters
 * Create counter
 */
const createCounter = async (req, res) => {
  const { branch_id, name, status } = req.body;

  try {
    if (!branch_id || !name) {
      return res.status(400).json({
        message: "branch_id and name are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO counters (branch_id, name, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [branch_id, name, status || "active"]
    );

    await createAuditLog({
      user: req.user,
      action: "CREATE",
      entityType: "COUNTER",
      entityId: result.rows[0].id,
      description: `Counter created: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.status(201).json({
      message: "Counter created successfully",
      counter: result.rows[0],
    });
  } catch (error) {
    console.error("Create counter error:", error.message);
    return res.status(500).json({
      message: "Failed to create counter",
      error: error.message,
    });
  }
};

/**
 * PUT /api/counters/:id
 * Update counter
 */
const updateCounter = async (req, res) => {
  const { id } = req.params;
  const { branch_id, name, status } = req.body;

  try {
    if (!branch_id || !name) {
      return res.status(400).json({
        message: "branch_id and name are required",
      });
    }

    const result = await pool.query(
      `UPDATE counters
       SET branch_id = $1,
           name = $2,
           status = $3
       WHERE id = $4
         AND is_deleted = false
       RETURNING *`,
      [branch_id, name, status || "active", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Counter not found",
      });
    }

    await createAuditLog({
      user: req.user,
      action: "UPDATE",
      entityType: "COUNTER",
      entityId: result.rows[0].id,
      description: `Counter updated: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: "Counter updated successfully",
      counter: result.rows[0],
    });
  } catch (error) {
    console.error("Update counter error:", error.message);
    return res.status(500).json({
      message: "Failed to update counter",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/counters/:id/toggle-status
 * Toggle counter active/inactive
 */
const toggleCounterStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const currentResult = await pool.query(
      `SELECT *
       FROM counters
       WHERE id = $1
         AND is_deleted = false`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Counter not found",
      });
    }

    const currentCounter = currentResult.rows[0];
    const newStatus =
      currentCounter.status === "active" ? "inactive" : "active";

    const result = await pool.query(
      `UPDATE counters
       SET status = $1
       WHERE id = $2
         AND is_deleted = false
       RETURNING *`,
      [newStatus, id]
    );

    await createAuditLog({
      user: req.user,
      action: "TOGGLE_STATUS",
      entityType: "COUNTER",
      entityId: result.rows[0].id,
      description: `Counter status changed to ${newStatus}: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: `Counter marked as ${newStatus}`,
      counter: result.rows[0],
    });
  } catch (error) {
    console.error("Toggle counter status error:", error.message);
    return res.status(500).json({
      message: "Failed to toggle counter status",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/counters/:id
 * Soft delete counter
 */
const deleteCounter = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      `SELECT COUNT(*) FROM tokens WHERE counter_id = $1`,
      [id]
    );

    if (Number(check.rows[0].count || 0) > 0) {
      return res.status(400).json({
        message: "Cannot delete counter. Tokens are linked.",
      });
    }

    const result = await pool.query(
      `UPDATE counters
       SET is_deleted = true
       WHERE id = $1
         AND is_deleted = false
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Counter not found",
      });
    }

    await createAuditLog({
      user: req.user,
      action: "SOFT_DELETE",
      entityType: "COUNTER",
      entityId: result.rows[0].id,
      description: `Counter soft deleted: ${result.rows[0].name}`,
      metadata: result.rows[0],
    });

    return res.json({
      message: "Counter deleted successfully",
      counter: result.rows[0],
    });
  } catch (error) {
    console.error("Delete counter error:", error.message);
    return res.status(500).json({
      message: "Failed to delete counter",
      error: error.message,
    });
  }
};

module.exports = {
  getCountersByBranch,
  createCounter,
  updateCounter,
  toggleCounterStatus,
  deleteCounter,
};