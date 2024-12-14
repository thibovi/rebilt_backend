const mongoose = require("mongoose");

const ConfigurationSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    required: true,
    enum: ["dropdown", "color", "text", "number", "checkbox"],
  },
  options: {
    type: [String],
    required: function () {
      return this.fieldType === "dropdown" || this.fieldType === "checkbox";
    },
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
});

const Configuration = mongoose.model("Configuration", ConfigurationSchema);
module.exports = Configuration;
