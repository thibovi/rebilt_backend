const mongoose = require("mongoose");

const ConfigurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ["Text", "Number", "Boolean", "Dropdown"],
  },
  options: { type: [String], default: [] },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
    required: false,
    default: null,
  }, // PartnerId is nu optioneel en heeft een default van null
});

const Configuration = mongoose.model("Configuration", ConfigurationSchema);
module.exports = Configuration;
