const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    fields: [
      {
        type: {
          type: String,
          required: true,
          enum: [
            "text",
            "textarea",
            "number",
            "checkbox-group",
            "radio-group",
            "button",
            "select",
            "date",
            "file",
            "header",
            "paragraph",
            "autocomplete",
            "hidden",
            "starRating",
          ],
        },
        subtype: { type: String }, // e.g., "password" for text fields
        label: { type: String, required: true },
        name: { type: String, required: true },
        placeholder: { type: String },
        className: { type: String }, // CSS classes for styling
        style: { type: String }, // Inline styles
        required: { type: Boolean, default: false },
        options: [
          {
            label: { type: String, required: true }, // The displayed label
            value: { type: String, required: true }, // The actual stored value
            selected: { type: Boolean, default: false }, // Whether the option is preselected
          },
        ],
        description: { type: String }, // Help text for the field
        access: { type: [String], default: ["all"] }, // e.g., ["admin", "user"]
        values: { type: mongoose.Schema.Types.Mixed }, // Default value (can be any type)
        multiple: { type: Boolean, default: false }, // Allows multiple selection
        inline: { type: Boolean, default: false }, // Inline options for radio/checkbox
        min_length: { type: Number },
        max_length: { type: Number },
        min: { type: mongoose.Schema.Types.Mixed },
        max: { type: mongoose.Schema.Types.Mixed },
        toggle: { type: Boolean },
        other: { type: Boolean },
        maxlength: { type: Number },
        rows: { type: Number },
        step: { type: Number },

        validation_rules: {
          regex: { type: String },
          regex_description: { type: String },
          min_length: { type: Number },
          max_length: { type: Number },
          min_value: { type: Number },
          max_value: { type: Number },
          min_date: { type: Date },
          max_date: { type: Date },
          allowed_types: { type: [String], default: [] }, // File type restrictions
          max_size: { type: Number }, // Max file size in KB
          min_selected: { type: Number }, // Min options selected
          max_selected: { type: Number }, // Max options selected
        },
        tooltip: { type: String }, // Tooltip text
        visibility_rules: { type: mongoose.Schema.Types.Mixed }, // Conditional visibility logic
        order: { type: Number, required: true }, // Position of the field
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Form", formSchema);
