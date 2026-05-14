const pool = require("../config/db");

const getDashboardSummary = async (req, res) => {
  const { branchId } = req.params;

  try {
    const summaryResult = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM branches WHERE is_deleted = false)::int AS total_branches,
        (SELECT COUNT(*) FROM counters WHERE branch_id = $1 AND is_deleted = false)::int AS total_counters,
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
      WHERE branch_id = $1
      `,
      [branchId]
    );

    const hourlyResult = await pool.query(
  `
  SELECT
    EXTRACT(HOUR FROM created_at)::int AS hour,
    COUNT(*)::int AS tokens
  FROM tokens
  WHERE branch_id = $1
  GROUP BY hour
  ORDER BY hour ASC
  `,
  [branchId]
);

   const serviceResult = await pool.query(
  `
  SELECT
    LOWER(TRIM(s.name)) AS name,
    COUNT(t.id)::int AS value
  FROM services s
  LEFT JOIN tokens t
    ON t.service_id = s.id
    AND t.branch_id = $1
  WHERE s.branch_id = $1
    AND s.is_deleted = false
  GROUP BY LOWER(TRIM(s.name))
  ORDER BY value DESC
  `,
  [branchId]
);

    return res.json({
      summary: summaryResult.rows[0],
      lineData: hourlyResult.rows,
      barData: hourlyResult.rows,
      pieData: serviceResult.rows,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};