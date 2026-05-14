const pool = require("../config/db");

const createAuditLog = async ({
  user = null,
  action,
  entityType,
  entityId = null,
  description = "",
  metadata = {},
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs
       (user_id, user_name, user_phone, user_role, action, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user?.userId || null,
        user?.name || null,
        user?.phone || null,
        user?.role || null,
        action,
        entityType,
        entityId,
        description,
        metadata,
      ]
    );
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = createAuditLog;