import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";
import { sendOTPEmail } from "../utils/sendEmail.js";


// =========================
// SIGNUP
// =========================

export const signup = async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  let user;

  try {
    // Check required fields
    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // Check password
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser?.emailVerified) {
      return res.status(400).json({
        error: "User already registered",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate 6 digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP expires after 10 minutes
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Reuse an unverified account so a failed email delivery can be retried.
    user = existingUser || new User({ email });
    user.fullname = fullname;
    user.password = hashPassword;
    user.emailVerified = false;
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;
    await user.save();

    // Send OTP to user's email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      if (!existingUser) {
        await User.deleteOne({ _id: user._id });
      }
      throw emailError;
    }

    // IMPORTANT:
    // Do NOT create JWT here.
    // User must verify email first.

    res.status(201).json({
      message: "OTP sent to your email",
      email: user.email,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    res.status(503).json({
      error: "Unable to send OTP email. Check the server email configuration.",
    });
  }
};


// =========================
// VERIFY EMAIL
// =========================

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check fields
    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return res.status(400).json({
        error: "Email already verified",
      });
    }

    // OTP doesn't exist
    if (!user.emailVerificationOTP) {
      return res.status(400).json({
        error: "OTP not found. Please request a new OTP.",
      });
    }

    // Check OTP expiry
    if (
      !user.emailVerificationOTPExpires ||
      user.emailVerificationOTPExpires < new Date()
    ) {
      return res.status(400).json({
        error: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check OTP
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // Mark email verified
    user.emailVerified = true;

    // Remove OTP
    user.emailVerificationOTP = null;

    // Remove expiry
    user.emailVerificationOTPExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verify Email Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


// =========================
// RESEND OTP
// =========================

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Already verified
    if (user.emailVerified) {
      return res.status(400).json({
        error: "Email already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // New expiry
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Save OTP
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;

    await user.save();

    // Send email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "New OTP sent to your email",
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);

    res.status(500).json({
      error: "Failed to resend OTP",
    });
  }
};


// =========================
// LOGIN
// =========================

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    // IMPORTANT:
    // Check email verification before login
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    // Create JWT cookie
    createTokenAndSaveCookie(user._id, res);

    res.status(200).json({
      message: "Login successful",

      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


// =========================
// LOGOUT
// =========================

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
};


// =========================
// GET ALL USERS
// =========================

export const allUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.user._id,
      },
    }).select("-password");

    res.status(200).json(users);

  } catch (error) {
    console.error("All Users Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};