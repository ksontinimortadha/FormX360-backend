const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Company = require("../models/Company");

// Utility function to send emails
const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465, // Ensure this is correct for your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Send verification email
exports.sendVerificationEmail = async (user, res) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const verificationLink = `${process.env.FRONTEND_URL}/users/verify-email?token=${token}`;

  try {
    await sendEmail(
      user.email,
      "Email Verification",
      `Hi ${user.firstName},\n\nPlease verify your email by clicking the link below:\n\n${verificationLink}`
    );
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Error sending verification email." });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token has expired" });
    }
    res.status(500).json({ error: "An error occurred during verification" });
  }
};

// User registration
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    await exports.sendVerificationEmail(newUser, res);

    res.status(201).json({
      message:
        "Registration successful! Please check your email for a verification link.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user." });
  }
};

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Account not found, please create one to login." });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Retrieve the company the user is part of by user ID
    const company = await Company.findOne({ users: user._id });

    if (!company) {
      return res.status(400).json({ message: "User is not associated with any company." });
    }

    // Create the JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respond with user data and the company ID
    res.json({
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        companyId: company._id,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Password reset request
exports.resetPasswordRequest = async (req, res) => {
  const { token, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${user.email}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `Click the link to reset your password: ${resetLink}`
    );

    res.status(200).json({
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ error: "JWT token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Error during password reset:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid or missing token." });
    }

    res.status(500).json({ error: "An error occurred." });
  }
};

// Change Password 
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Get user ID from the authenticated token

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save the updated user
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ error: "An error occurred while changing the password" });
  }
};


 