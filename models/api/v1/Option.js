const mongoose = require("mongoose");

// Schema voor een optie
const OptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Naam van de optie (bijv. 'Blauw', 'L', etc.)
  type: { type: String, required: true }, // Type van de optie (bijv. 'kleur', 'maat')
  price: { type: Number, default: 0 }, // Optioneel, de prijs die aan de optie is gekoppeld
  textureUrl: { type: String }, // <-- Texture URL veld
});

const Option = mongoose.model("Option", OptionSchema);
module.exports = Option;
