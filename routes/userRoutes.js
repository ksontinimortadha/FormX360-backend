const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const router = express.Router();
const {
  registerUser,
  loginUser,
  resetPasswordRequest,
  resetPassword,
  verifyEmail,
  addUserToCompany,
  changePassword,
} = require("../controllers/userController");
const authenticateUser = require("../middlewares/authenticateUser");

// Using the imported functions directly
router.post("/register", registerUser);
router.post("/login", loginUser);

// Reset password
router.post("/reset-password-request", resetPasswordRequest);
router.post("/reset-password", resetPassword);
router.put("/change-password", authenticateUser, changePassword); 

// Email verification route
router.get("/verify-email", verifyEmail);

module.exports = router;
