const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  industry: { type: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  forms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Form" }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Company", companySchema);
