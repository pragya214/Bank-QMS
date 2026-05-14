const pool = require("../config/db");

const getBranchesOverview = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.name,
        b.address,
        b.city,
        b.state,
        b.created_at,

        COALESCE(counter_stats.total_counters, 0) AS total_counters,
        COALESCE(token_stats.waiting_tokens, 0) AS waiting_tokens,
        COALESCE(token_stats.serving_tokens, 0) AS serving_tokens,
        COALESCE(token_stats.completed_today, 0) AS completed_today,
        COALESCE(token_stats.no_show_today, 0) AS no_show_today

      FROM branches b

      LEFT JOIN (
        SELECT
          branch_id,
          COUNT(*)::int AS total_counters
        FROM counters
        GROUP BY branch_id
      ) counter_stats
      ON b.id = counter_stats.branch_id

      LEFT JOIN (
        SELECT
          branch_id,
          COUNT(*) FILTER (WHERE status = 'waiting')::int AS waiting_tokens,
          COUNT(*) FILTER (WHERE status = 'serving')::int AS serving_tokens,
          COUNT(*) FILTER (
            WHERE status = 'completed'
              AND DATE(completed_at) = CURRENT_DATE
          )::int AS completed_today,
          COUNT(*) FILTER (
            WHERE status = 'no_show'
              AND DATE(completed_at) = CURRENT_DATE
          )::int AS no_show_today
        FROM tokens
        GROUP BY branch_id
      ) token_stats
      ON b.id = token_stats.branch_id

      ORDER BY b.created_at DESC
    `);

    return res.json({
      branches: result.rows,
    });
  } catch (error) {
    console.error("Get branches overview error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch branches overview",
      error: error.message,
    });
  }
};

module.exports = {
  getBranchesOverview,
};