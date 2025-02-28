const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Add a new company
exports.addCompany = async (req, res) => {
  const { name, description, industry, userId } = req.body;

  try {
    const existingCompany = await Company.findOne({ name });
    if (existingCompany)
      return res.status(400).json({ error: "Company already exists." });

    const newCompany = new Company({
      name,
      description,
      industry,
      users: [userId],
    });

    await newCompany.save();
    res
      .status(201)
      .json({ message: "Company created successfully!", company: newCompany });
  } catch (error) {
    console.error("Error creating company:", error.message);
    res
      .status(500)
      .json({ error: "Error creating company. Please try again." });
  }
};

// Edit a company
exports.editCompany = async (req, res) => {
  const { companyId } = req.params;
  const { name, description, industry } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Company not found." });

    if (name) {
      const nameExists = await Company.findOne({ name });
      if (nameExists && nameExists._id.toString() !== companyId) {
        return res.status(400).json({ error: "Company name already exists." });
      }
      company.name = name;
    }

    company.description = description || company.description;
    company.industry = industry || company.industry;

    await company.save();
    res.status(200).json({ message: "Company updated successfully!", company });
  } catch (error) {
    console.error("Error updating company:", error.message);
    res
      .status(500)
      .json({ error: "Error updating company. Please try again." });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findByIdAndDelete(companyId);
    if (!company) return res.status(404).json({ error: "Company not found." });

    res.status(200).json({ message: "Company deleted successfully!" });
  } catch (error) {
    console.error("Error deleting company:", error.message);
    res
      .status(500)
      .json({ error: "Error deleting company. Please try again." });
  }
};

// Get company details
exports.getCompanyDetails = async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId).populate(
      "users",
      "firstName lastName email role"
    );
    if (!company) return res.status(404).json({ error: "Company not found." });

    res.status(200).json({ company });
  } catch (error) {
    console.error("Error fetching company details:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching company details. Please try again." });
  }
};

// Get all users of a company
exports.getUsers = async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId).populate("users");
    if (!company) return res.status(404).json({ error: "Company not found." });

    res.json({ users: company.users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users. Please try again." });
  }
};

// Get a single user from a company
exports.getUser = async (req, res) => {
  const { companyId, userId } = req.params;

  try {
    const company = await Company.findById(companyId).populate("users");
    if (!company) return res.status(404).json({ error: "Company not found." });

    const user = company.users.find((user) => user._id.toString() === userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Error fetching user details. Please try again." });
  }
};

// Add a user to a company
exports.addUserToCompany = async (req, res) => {
  const { companyId } = req.params;
  const { firstName, lastName, email, role, password } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword,
      isVerified: true,
    });

    await newUser.save();
    company.users.push(newUser._id);
    await company.save();

    res
      .status(201)
      .json({ message: "User added successfully!", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Error adding user. Please try again." });
  }
};

// Edit a user
exports.editUser = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, role, password } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user. Please try again." });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user. Please try again." });
  }
};
