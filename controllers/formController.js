const Form = require("../models/Form");
const Company = require("../models/Company");

// Create a new form for a specific company
exports.createForm = async (req, res) => {
  const { companyId } = req.params;
  const { title, description } = req.body;
  const userId = req.user.id; // Get user ID from authenticated user (from the middleware)

  console.log("Authenticated user ID:", userId);

  try {
    // Check if the company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found." });
    }

    // Check if the form with the same title already exists
    const existingForm = await Form.findOne({ title });
    if (existingForm) {
      return res
        .status(400)
        .json({ error: "Form with this title already exists." });
    }

    // Create the new form with the user_id field
    const newForm = new Form({
      user_id: userId,
      title,
      description,
      fields: [],
      field_order: [],
    });

    // Save the new form to the database
    await newForm.save();

    // Add the new form to the company's forms array
    company.forms.push(newForm._id);
    await company.save();

    // Respond with the newly created form ID
    res.status(201).json({
      message: "Form created successfully!",
      formId: newForm._id,
      form: newForm, // Optionally return the form details
    });
  } catch (error) {
    console.error("Error creating form:", error.message);
    res.status(500).json({
      error: "Error creating form. Please try again.",
    });
  }
};

// Get All Forms for a Company
exports.getCompanyForms = async (req, res) => {
  const { companyId } = req.params; // Fix parameter name

  try {
    // Ensure company exists
    const company = await Company.findById(companyId).populate("forms");

    if (!company) {
      console.log("Company not found");
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company.forms);
  } catch (err) {
    console.error("Error fetching company forms:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a Single Form
exports.getFormById = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the form by ID in the database
    const form = await Form.findById(id);

    // If form not found, return 404 error
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // If form found, return 200 with form data
    res.status(200).json({
      success: true,
      message: "Form retrieved successfully",
      form,
    });
  } catch (err) {
    // Return 500 error for server-side issues
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Update a Form
exports.updateForm = async (req, res) => {
  const { id } = req.params;
  const { title, description, field_order = [], fields = [], values } = req.body;

  try {
    // Log to verify all received data
    console.log("Received update request for form:", {
      id,
      title,
      description,
      field_order,
      fields,
      values,
    });

    if (!Array.isArray(fields)) {
      return res
        .status(400)
        .json({ message: "Invalid fields format. Expected an array." });
    }

    // Validate and ensure all fields contain a 'type'
    fields.forEach((field, index) => {
      if (!field.type) {
        console.warn(`Missing type for field at index ${index}`, field);
      }

      // Ensure options are properly handled for 'checkbox-group', 'radio-group', and 'select'
      if (["checkbox-group", "radio-group", "select"].includes(field.type)) {
        field.options = field.options || []; // Ensure options exist

        field.options = field.options.map((option) => ({
          label: option.label || option, // Use provided label or default to option value
          value: option.value || option, // Use provided value or default
          selected: option.selected ?? false, // Ensure selected is explicitly set
        }));
      }

      // Handle field validation rules, ensuring they are only set when relevant
      if (field.validation_rules) {
        field.validation_rules = {
          ...field.validation_rules,
          min_length: field.validation_rules.min_length ?? undefined,
          max_length: field.validation_rules.max_length ?? undefined,
          min_value: field.validation_rules.min_value ?? undefined,
          max_value: field.validation_rules.max_value ?? undefined,
          min_date: field.validation_rules.min_date ?? undefined,
          max_date: field.validation_rules.max_date ?? undefined,
        };
      }
    });

    // Log the updated fields to verify correct structure
    console.log("Updated fields:", fields);

    // Find and update the form, ensuring arrays are replaced properly
    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { title, description, field_order, fields, values },
      { new: true } // Return updated form & validate fields
    );

    // Handle form not found scenario
    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Send success response
    res.status(200).json({
      message: "Form updated successfully",
      form: updatedForm,
    });
  } catch (err) {
    // Handle server errors
    console.error("Error updating form:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a Form
exports.deleteForm = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedForm = await Form.findByIdAndDelete(id);
    if (!deletedForm)
      return res.status(404).json({ message: "Form not found" });

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
