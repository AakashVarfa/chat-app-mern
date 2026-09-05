import express from "express";

import {
  allUsers,
  login,
  logout,
  signup,
  verifyEmail,
  resendOTP,
} from "../controller/user.controller.js";

import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();


// =========================
// AUTH ROUTES
// =========================

router.post("/signup", signup);

router.post("/verify-email", verifyEmail);

router.post("/resend-otp", resendOTP);

router.post("/login", login);

router.post("/logout", logout);


// =========================
// PROTECTED ROUTES
// =========================

router.get("/allusers", secureRoute, allUsers);


export default router;