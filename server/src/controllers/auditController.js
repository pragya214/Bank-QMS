const pool = require("../config/db");

const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 200`
    );

    return res.json({
      logs: result.rows,
    });
  } catch (error) {
    console.error("Get audit logs error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

module.exports = {
  getAuditLogs,
};