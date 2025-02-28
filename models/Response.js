const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  form_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for anonymous responses
  submitted_at: { type: Date, default: Date.now },
  responses: [
    {
      field_id: { type: String, required: true }, // Reference to the form field
      value: { type: mongoose.Schema.Types.Mixed, required: true }, // Mixed type to support text, numbers, etc.
    },
  ],
});

module.exports = mongoose.model("Response", responseSchema);
