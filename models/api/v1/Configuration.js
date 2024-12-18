const mongoose = require("mongoose");

// Schema voor configuraties
const ConfigurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true }, // Naam van het veld (bijv. 'Kleur')
  fieldType: {
    type: String,
    required: true,
    enum: ["Text", "Number", "Boolean", "Dropdown", "Color"], // Soorten velden, nu inclusief 'Color' voor kleurkeuzes
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
  isColor: { type: Boolean, default: false }, // Is dit een kleuroptie? Voeg toe voor kleuranticipatie
});

const Configuration = mongoose.model("Configuration", ConfigurationSchema);
module.exports = Configuration;
