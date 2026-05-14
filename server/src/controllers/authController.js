const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (user) => {
  return jwt.sign(
    {
       userId: user.id,
      name: user.name,
      phone: user.phone_no,
      role: user.role || "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const sendOtp = async (req, res) => {
  const { phone_no } = req.body || {};

  try {
    if (!phone_no) {
      return res.status(400).json({
        message: "phone_no is required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone_no)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `
      INSERT INTO otps (phone_no, otp, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (phone_no)
      DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at
      `,
      [phone_no, otp, expiresAt]
    );

    return res.json({
      message: "OTP sent successfully",
      otp, // testing only
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  const { phone_no, otp, name, role } = req.body || {};

  try {
    if (!phone_no || !otp) {
      return res.status(400).json({
        message: "phone_no and otp are required",
      });
    }

    const otpResult = await pool.query(
      `SELECT * FROM otps WHERE phone_no = $1`,
      [phone_no]
    );

    if (otpResult.rows.length === 0) {
      return res.status(404).json({
        message: "OTP not found. Please request a new OTP.",
      });
    }

    const otpRow = otpResult.rows[0];

    if (otpRow.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date(otpRow.expires_at) < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    let userResult = await pool.query(
      `SELECT * FROM users WHERE phone_no = $1 LIMIT 1`,
      [phone_no]
    );

    let user;
    let isNewUser = false;

    if (userResult.rows.length === 0) {
      const newUserResult = await pool.query(
        `
        INSERT INTO users (phone_no, name, role, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *
        `,
      [phone_no, name || null, role || "admin"]
      );

      user = newUserResult.rows[0];
      isNewUser = true;
    } else {
      user = userResult.rows[0];
    }

    await pool.query(`DELETE FROM otps WHERE phone_no = $1`, [phone_no]);

    const token = generateToken(user);

    return res.json({
      message: isNewUser ? "Registration successful" : "Login successful",
      token,
      user,
      isNewUser,
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    return res.status(500).json({
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, profile_photo_url, remove_photo } = req.body;

  try {
    console.log("UPDATE PROFILE BODY:", {
      name,
      hasPhoto: !!profile_photo_url,
      photoLength: profile_photo_url?.length || 0,
      remove_photo,
    });

    const currentUserResult = await pool.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = currentUserResult.rows[0];

    let finalPhoto = currentUser.profile_photo_url;

    if (remove_photo === true) {
      finalPhoto = null;
    } else if (profile_photo_url && profile_photo_url.startsWith("data:image/")) {
      finalPhoto = profile_photo_url;
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           profile_photo_url = $2
       WHERE id = $3
       RETURNING *`,
      [name || null, finalPhoto, userId]
    );

    return res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
};

