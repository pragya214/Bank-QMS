const pool = require("../config/db");
const getQueueSettings = async () => {
  const result = await pool.query(
    `SELECT 
       estimated_wait_per_token,
       display_next_count
     FROM app_settings
     ORDER BY created_at ASC
     LIMIT 1`
  );

  return {
    estimatedWaitPerToken:
      result.rows[0]?.estimated_wait_per_token !== undefined
        ? Number(result.rows[0].estimated_wait_per_token)
        : 5,

    displayNextCount:
      result.rows[0]?.display_next_count !== undefined
        ? Number(result.rows[0].display_next_count)
        : 5,
  };
};

const emitQueueUpdate = (req, payload) => {
  const io = req.app.get("io");

  if (io) {
    io.emit("queueUpdated", payload);
  }
};

const joinQueue = async (req, res) => {
  const { name, phone, branch_id, service_id } = req.body || {};

  try {
    if (!phone || !branch_id || !service_id) {
      return res.status(400).json({
        message: "phone, branch_id and service_id are required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits",
      });
    }

    let customerResult = await pool.query(
      "SELECT * FROM customers WHERE phone = $1",
      [phone]
    );

    let customer;

    if (customerResult.rows.length > 0) {
      customer = customerResult.rows[0];
    } else {
      const newCustomerResult = await pool.query(
        "INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING *",
        [name || null, phone]
      );
      customer = newCustomerResult.rows[0];
    }

    const lastTokenResult = await pool.query(
      `SELECT token_number
       FROM tokens
       WHERE branch_id = $1
       ORDER BY token_number DESC
       LIMIT 1`,
      [branch_id]
    );

    const nextTokenNumber =
      lastTokenResult.rows.length > 0
        ? lastTokenResult.rows[0].token_number + 1
        : 1;

    const tokenResult = await pool.query(
      `INSERT INTO tokens (token_number, branch_id, service_id, customer_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nextTokenNumber, branch_id, service_id, customer.id, "waiting"]
    );

    emitQueueUpdate(req, {
      action: "join",
      token: tokenResult.rows[0],
      branch_id,
    });

    return res.status(201).json({
      message: "Queue joined successfully",
      token: tokenResult.rows[0],
      customer,
    });
  } catch (error) {
    console.error("Join queue error:", error.message);
    return res.status(500).json({
      message: "Failed to join queue",
      error: error.message,
    });
  }
};

const getQueueStatus = async (req, res) => {
  const { tokenId } = req.params;

  try {
    const tokenResult = await pool.query(
      `SELECT 
        t.*,
        s.name AS service_name,
        s.avg_service_time,
        b.name AS branch_name,
        c.name AS customer_name,
        c.phone AS customer_phone
       FROM tokens t
       JOIN services s ON t.service_id = s.id
       LEFT JOIN branches b ON t.branch_id = b.id
       LEFT JOIN customers c ON t.customer_id = c.id
       WHERE t.id = $1`,
      [tokenId]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const token = tokenResult.rows[0];

    if (token.status !== "waiting") {
      return res.json({
        message: "Queue status fetched successfully",
        token,
        queue_position: 0,
        people_ahead: 0,
        estimated_wait_minutes: 0,
      });
    }

    const peopleAheadResult = await pool.query(
      `SELECT COUNT(*)::int AS people_ahead
       FROM tokens
       WHERE branch_id = $1
         AND service_id = $2
         AND status = 'waiting'
         AND created_at < $3`,
      [token.branch_id, token.service_id, token.created_at]
    );

    const peopleAhead = Number(peopleAheadResult.rows[0]?.people_ahead || 0);
    const queuePosition = peopleAhead + 1;
    const estimatedWait = peopleAhead * (token.avg_service_time || 5);

    return res.json({
      message: "Queue status fetched successfully",
      token,
      queue_position: queuePosition,
      people_ahead: peopleAhead,
      estimated_wait_minutes: estimatedWait,
    });
  } catch (error) {
    console.error("Get queue status error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch queue status",
      error: error.message,
    });
  }
};

const getCustomerTokenStatus = async (req, res) => {
  const { phone, tokenNumber } = req.query;

  try {
    if (!phone || !tokenNumber) {
      return res.status(400).json({
        message: "phone and tokenNumber are required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Enter valid 10 digit mobile number",
      });
    }

    const tokenResult = await pool.query(
      `
      SELECT 
        t.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        s.name AS service_name,
        s.avg_service_time,
        b.name AS branch_name,
        co.name AS counter_name
      FROM tokens t
      JOIN customers c ON t.customer_id = c.id
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN branches b ON t.branch_id = b.id
      LEFT JOIN counters co ON t.counter_id = co.id
      WHERE c.phone = $1
        AND t.token_number::text = $2
      ORDER BY t.created_at DESC
      LIMIT 1
      `,
      [phone, String(tokenNumber)]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const token = tokenResult.rows[0];

    if (token.status !== "waiting") {
      return res.json({
        message: "Customer token status fetched successfully",
        token,
        people_ahead: 0,
        queue_position: 0,
        estimated_wait_minutes: 0,
      });
    }

    const aheadResult = await pool.query(
      `
      SELECT COUNT(*)::int AS people_ahead
      FROM tokens
      WHERE branch_id = $1
        AND service_id = $2
        AND status = 'waiting'
        AND created_at < $3
      `,
      [token.branch_id, token.service_id, token.created_at]
    );

    const peopleAhead = Number(
      aheadResult.rows[0]?.people_ahead || 0
    );

    // Queue settings
    const queueSettings = await getQueueSettings();

    // Estimated wait time
    const estimatedWait =
      peopleAhead *
      (
        token.avg_service_time ||
        queueSettings.estimatedWaitPerToken ||
        5
      );

    return res.json({
      message: "Customer token status fetched successfully",
      token,
      people_ahead: peopleAhead,
      queue_position: peopleAhead + 1,
      estimated_wait_minutes: estimatedWait,
    });

  } catch (error) {
    console.error(
      "Customer token status error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to fetch customer token status",
      error: error.message,
    });
  }
};

const callNextToken = async (req, res) => {
  const { branch_id, counter_id } = req.body || {};

  try {
    if (!branch_id || !counter_id) {
      return res.status(400).json({
        message: "branch_id and counter_id are required",
      });
    }

    const counterResult = await pool.query(
      `SELECT * FROM counters
       WHERE id = $1
         AND branch_id = $2
         AND is_deleted = false`,
      [counter_id, branch_id]
    );

    if (counterResult.rows.length === 0) {
      return res.status(404).json({
        message: "Counter not found for selected branch",
      });
    }

    const counter = counterResult.rows[0];

    if (counter.status !== "active") {
      return res.status(400).json({
        message: "Selected counter is inactive",
      });
    }

    const existingServing = await pool.query(
      `SELECT *
       FROM tokens
       WHERE branch_id = $1
         AND counter_id = $2
         AND status = 'serving'
       ORDER BY called_at DESC
       LIMIT 1`,
      [branch_id, counter_id]
    );

    if (existingServing.rows.length > 0) {
      return res.status(400).json({
        message:
          "This counter already has a serving token. Complete or mark no-show first.",
        token: existingServing.rows[0],
      });
    }

    const nextTokenResult = await pool.query(
      `SELECT *
       FROM tokens
       WHERE branch_id = $1
         AND status = 'waiting'
       ORDER BY created_at ASC
       LIMIT 1`,
      [branch_id]
    );

    if (nextTokenResult.rows.length === 0) {
      return res.status(404).json({
        message: "No waiting token found",
      });
    }

    const nextToken = nextTokenResult.rows[0];

    const updatedTokenResult = await pool.query(
      `UPDATE tokens
       SET status = 'serving',
           counter_id = $1,
           called_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [counter_id, nextToken.id]
    );

    emitQueueUpdate(req, {
      action: "call-next",
      token: updatedTokenResult.rows[0],
      branch_id,
      counter_id,
    });

    return res.json({
      message: "Next token called successfully",
      token: updatedTokenResult.rows[0],
    });
  } catch (error) {
    console.error("Call next token error:", error.message);
    return res.status(500).json({
      message: "Failed to call next token",
      error: error.message,
    });
  }
};

const completeToken = async (req, res) => {
  const { token_id } = req.body || {};

  try {
    if (!token_id) {
      return res.status(400).json({
        message: "token_id is required",
      });
    }

    const tokenResult = await pool.query(`SELECT * FROM tokens WHERE id = $1`, [
      token_id,
    ]);

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const token = tokenResult.rows[0];

    if (token.status !== "serving") {
      return res.status(400).json({
        message: "Only serving token can be completed",
      });
    }

    const updatedTokenResult = await pool.query(
      `UPDATE tokens
       SET status = 'completed',
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [token_id]
    );

    emitQueueUpdate(req, {
      action: "complete",
      token: updatedTokenResult.rows[0],
      branch_id: updatedTokenResult.rows[0].branch_id,
      counter_id: updatedTokenResult.rows[0].counter_id,
    });

    return res.json({
      message: "Token completed successfully",
      token: updatedTokenResult.rows[0],
    });
  } catch (error) {
    console.error("Complete token error:", error.message);
    return res.status(500).json({
      message: "Failed to complete token",
      error: error.message,
    });
  }
};

const markNoShow = async (req, res) => {
  const { token_id } = req.body || {};

  try {
    if (!token_id) {
      return res.status(400).json({
        message: "token_id is required",
      });
    }

    const tokenResult = await pool.query(`SELECT * FROM tokens WHERE id = $1`, [
      token_id,
    ]);

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const token = tokenResult.rows[0];

    if (token.status !== "serving") {
      return res.status(400).json({
        message: "Only serving token can be marked as no-show",
      });
    }

    const updatedTokenResult = await pool.query(
      `UPDATE tokens
       SET status = 'no_show',
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [token_id]
    );

    emitQueueUpdate(req, {
      action: "no-show",
      token: updatedTokenResult.rows[0],
      branch_id: updatedTokenResult.rows[0].branch_id,
      counter_id: updatedTokenResult.rows[0].counter_id,
    });

    return res.json({
      message: "Token marked as no-show",
      token: updatedTokenResult.rows[0],
    });
  } catch (error) {
    console.error("No show error:", error.message);
    return res.status(500).json({
      message: "Failed to mark no-show",
      error: error.message,
    });
  }
};

const getCurrentServingToken = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        t.*,
        c.name AS counter_name,
        s.name AS service_name,
        cu.name AS customer_name,
        cu.phone AS customer_phone
       FROM tokens t
       LEFT JOIN counters c ON t.counter_id = c.id
       LEFT JOIN services s ON t.service_id = s.id
       LEFT JOIN customers cu ON t.customer_id = cu.id
       WHERE t.branch_id = $1
         AND t.status = 'serving'
       ORDER BY t.called_at DESC
       LIMIT 1`,
      [branchId]
    );

    return res.json({
      message: result.rows.length
        ? "Current serving token fetched successfully"
        : "No token is currently serving",
      token: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Get current serving token error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch current serving token",
      error: error.message,
    });
  }
};

const getDisplayBoardData = async (req, res) => {
  const { branchId } = req.params;

  try {
    const currentResult = await pool.query(
      `SELECT 
        t.*,
        s.name AS service_name,
        c.name AS counter_name
       FROM tokens t
       LEFT JOIN services s ON t.service_id = s.id
       LEFT JOIN counters c ON t.counter_id = c.id
       WHERE t.branch_id = $1
         AND t.status = 'serving'
       ORDER BY t.called_at DESC
       LIMIT 1`,
      [branchId]
    );

    const nextResult = await pool.query(
      `SELECT 
        t.*,
        s.name AS service_name
       FROM tokens t
       LEFT JOIN services s ON t.service_id = s.id
       WHERE t.branch_id = $1
         AND t.status = 'waiting'
       ORDER BY t.created_at ASC
       LIMIT 2`,
      [branchId]
    );

    return res.json({
      current: currentResult.rows[0] || null,
      nextTokens: nextResult.rows || [],
    });
  } catch (error) {
    console.error("Display board error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch display board data",
      error: error.message,
    });
  }
};

const getDisplayData = async (req, res) => {
  const { branchId } = req.params;

  try {
    const currentResult = await pool.query(
      `SELECT 
        t.*,
        s.name AS service_name,
        c.name AS counter_name
      FROM tokens t
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN counters c ON t.counter_id = c.id
      WHERE t.branch_id = $1
        AND t.status = 'serving'
      ORDER BY t.called_at DESC
      LIMIT 1`,
      [branchId]
    );

    const nextResult = await pool.query(
      `SELECT 
        t.*,
        s.name AS service_name
      FROM tokens t
      LEFT JOIN services s ON t.service_id = s.id
      WHERE t.branch_id = $1
        AND t.status = 'waiting'
      ORDER BY t.created_at ASC
      LIMIT 5`,
      [branchId]
    );

    return res.json({
      current: currentResult.rows[0] || null,
      nextTokens: nextResult.rows,
    });
  } catch (error) {
    console.error("Display board error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch display data",
      error: error.message,
    });
  }
};

module.exports = {
  joinQueue,
  getQueueStatus,
  callNextToken,
  completeToken,
  markNoShow,
  getCurrentServingToken,
  getDisplayBoardData,
  getCustomerTokenStatus,
  getDisplayData,
};