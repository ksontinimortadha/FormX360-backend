const express = require("express");
const router = express.Router();
const {
  submitResponse,
  getFormResponses,
  getUserResponses,
} = require("../controllers/responseController");

// Submit a response
router.post("/", submitResponse);

// Get all responses for a form
router.get("/form/:form_id", getFormResponses);

// Get all responses submitted by a user
router.get("/user/:user_id", getUserResponses);

module.exports = router;
