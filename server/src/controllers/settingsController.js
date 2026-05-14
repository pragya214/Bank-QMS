const pool = require("../config/db");

const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM app_settings
       ORDER BY created_at ASC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    return res.json({
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("Get settings error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  const {
    organization_name,
    display_title,
    welcome_message,
    token_prefix,
    estimated_wait_per_token,
    display_next_count,
    auto_refresh_seconds,
    turn_soon_threshold,
    sound_enabled,
    browser_notification_enabled,
    daily_token_reset,
  } = req.body || {};

  try {
    const existing = await pool.query(
      `SELECT id FROM app_settings ORDER BY created_at ASC LIMIT 1`
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: "Settings not found",
      });
    }

    const id = existing.rows[0].id;

    const result = await pool.query(
      `UPDATE app_settings
       SET organization_name = $1,
           display_title = $2,
           welcome_message = $3,
           token_prefix = $4,
           estimated_wait_per_token = $5,
           display_next_count = $6,
           auto_refresh_seconds = $7,
           turn_soon_threshold = $8,
           sound_enabled = $9,
           browser_notification_enabled = $10,
           daily_token_reset = $11,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        organization_name || "Bank Queue",
        display_title || "Queue Display Board",
        welcome_message || "Welcome to Bank QMS",
        token_prefix || "A",
        Number(estimated_wait_per_token || 5),
        Number(display_next_count || 5),
        Number(auto_refresh_seconds || 5),
        Number(turn_soon_threshold || 2),
        Boolean(sound_enabled),
        Boolean(browser_notification_enabled),
        Boolean(daily_token_reset),
        id,
      ]
    );

    return res.json({
      message: "Settings updated successfully",
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("Update settings error:", error.message);
    return res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};