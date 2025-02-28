const Response = require("../models/Response");
const Form = require("../models/Form");

// Submit a New Response
const submitResponse = async (req, res) => {
  const { form_id, user_id, responses } = req.body;

  try {
    // Validate the form exists
    const form = await Form.findById(form_id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // Validate responses
    const validationErrors = [];
    form.fields.forEach((field) => {
      const userResponse = responses.find(
        (r) => r.field_id === field._id.toString()
      );

      // Check required fields
      if (field.is_required && (!userResponse || !userResponse.value)) {
        validationErrors.push(`Field '${field.label}' is required.`);
        return; // Skip further validation for this field
      }

      if (userResponse) {
        const value = userResponse.value;

        // Validation based on field type
        switch (field.field_type) {
          case "text":
          case "textarea":
            if (
              field.validation_rules?.regex &&
              !new RegExp(field.validation_rules.regex).test(value)
            ) {
              validationErrors.push(
                `Field '${field.label}' must match the format: ${
                  field.validation_rules.regex_description || "invalid format"
                }.`
              );
            }
            if (
              field.validation_rules?.min_length &&
              value.length < field.validation_rules.min_length
            ) {
              validationErrors.push(
                `Field '${field.label}' must have at least ${field.validation_rules.min_length} characters.`
              );
            }
            if (
              field.validation_rules?.max_length &&
              value.length > field.validation_rules.max_length
            ) {
              validationErrors.push(
                `Field '${field.label}' must not exceed ${field.validation_rules.max_length} characters.`
              );
            }
            break;

          case "number":
            if (isNaN(value)) {
              validationErrors.push(
                `Field '${field.label}' must be a valid number.`
              );
            }
            if (
              field.validation_rules?.min_value &&
              value < field.validation_rules.min_value
            ) {
              validationErrors.push(
                `Field '${field.label}' must be at least ${field.validation_rules.min_value}.`
              );
            }
            if (
              field.validation_rules?.max_value &&
              value > field.validation_rules.max_value
            ) {
              validationErrors.push(
                `Field '${field.label}' must not exceed ${field.validation_rules.max_value}.`
              );
            }
            break;

          case "dropdown":
          case "radio":
            if (!field.options.includes(value)) {
              validationErrors.push(
                `Field '${field.label}' must be one of the predefined options.`
              );
            }
            break;

          case "checkbox":
            if (!Array.isArray(value)) {
              validationErrors.push(`Field '${field.label}' must be an array.`);
            } else if (
              field.validation_rules?.max_selected &&
              value.length > field.validation_rules.max_selected
            ) {
              validationErrors.push(
                `Field '${field.label}' must not exceed ${field.validation_rules.max_selected} selections.`
              );
            } else if (
              field.validation_rules?.min_selected &&
              value.length < field.validation_rules.min_selected
            ) {
              validationErrors.push(
                `Field '${field.label}' must have at least ${field.validation_rules.min_selected} selections.`
              );
            } else if (value.some((v) => !field.options.includes(v))) {
              validationErrors.push(
                `Field '${field.label}' contains invalid options.`
              );
            }
            break;

          case "date":
            const dateValue = new Date(value);
            if (isNaN(dateValue)) {
              validationErrors.push(
                `Field '${field.label}' must be a valid date.`
              );
            }
            if (
              field.validation_rules?.min_date &&
              dateValue < new Date(field.validation_rules.min_date)
            ) {
              validationErrors.push(
                `Field '${field.label}' must not be before ${field.validation_rules.min_date}.`
              );
            }
            if (
              field.validation_rules?.max_date &&
              dateValue > new Date(field.validation_rules.max_date)
            ) {
              validationErrors.push(
                `Field '${field.label}' must not be after ${field.validation_rules.max_date}.`
              );
            }
            break;

          case "url":
            const urlRegex = /^(https?:\/\/)?([\w-]+)+([\w./?%&=]*)?$/;
            if (!urlRegex.test(value)) {
              validationErrors.push(
                `Field '${field.label}' must be a valid URL.`
              );
            }
            break;

          case "file":
            if (!field.validation_rules?.allowed_types.includes(value.type)) {
              validationErrors.push(
                `Field '${
                  field.label
                }' must be a file of type: ${field.validation_rules.allowed_types.join(
                  ", "
                )}.`
              );
            }
            if (value.size > field.validation_rules?.max_size * 1024 * 1024) {
              validationErrors.push(
                `Field '${field.label}' file size must not exceed ${field.validation_rules.max_size} MB.`
              );
            }
            break;

          default:
            validationErrors.push(
              `Field '${field.label}' has an unsupported field type: ${field.field_type}.`
            );
        }
      }
    });

    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Validation errors", errors: validationErrors });
    }

    // Save the response
    const newResponse = new Response({ form_id, user_id, responses });
    await newResponse.save();

    res
      .status(201)
      .json({
        message: "Response submitted successfully",
        response: newResponse,
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get Responses for a Form
const getFormResponses = async (req, res) => {
  const { form_id } = req.params;

  try {
    const responses = await Response.find({ form_id }).populate(
      "user_id",
      "name email"
    );
    res.status(200).json(responses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Responses Submitted by a User
const getUserResponses = async (req, res) => {
  const { user_id } = req.params;

  try {
    const responses = await Response.find({ user_id }).populate(
      "form_id",
      "title"
    );
    res.status(200).json(responses);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  submitResponse,
  getFormResponses,
  getUserResponses,
};