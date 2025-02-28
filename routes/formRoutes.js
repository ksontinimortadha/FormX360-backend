const express = require("express");
const router = express.Router();
const {
  createForm,
  getFormById,
  updateForm,
  deleteForm,
  getCompanyForms,
} = require("../controllers/formController");
const authenticateUser = require("../middlewares/authenticateUser");

// Create a new form for a company
router.post("/:companyId/forms", authenticateUser, createForm);

// Get all forms for a company
router.get("/:companyId/forms", getCompanyForms);

// Get a single form by ID
router.get("/:id", getFormById);

// Update a form by ID
router.put("/:id", updateForm);

// Delete a form by ID
router.delete("/:id", deleteForm);

module.exports = router;
