const mongoose = require("mongoose");

// Schema voor configuraties
const ConfigurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true }, // Naam van het veld (bijv. 'Kleur')
  fieldType: {
    type: String,
    required: true,
    enum: ["Text", "Number", "Boolean", "Dropdown"], // Soorten velden
  },
  options: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Option",
    },
  ], // Verwijzing naar beschikbare opties (van de Option collectie)
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
    required: false,
    default: null, // PartnerId is optioneel
  },
});

const Configuration = mongoose.model("Configuration", ConfigurationSchema);
module.exports = Configuration;
