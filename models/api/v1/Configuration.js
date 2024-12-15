const mongoose = require("mongoose");

const ConfigurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ["Text", "Number", "Boolean", "Dropdown"],
  },
  options: { type: [String], default: [] },
  isRequired: { type: Boolean, default: false },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
});

const Configuration = mongoose.model("Configuration", ConfigurationSchema);
module.exports = Configuration;
