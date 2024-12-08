const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    default: {},
  },
  contact_email: {
    type: String,
    // Maak contact_email optioneel en accepteer null of een leeg veld
    required: false,
    validate: {
      validator: function (v) {
        // E-mail validatie enkel als er een waarde is (laat null of leeg toe)
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Ongeldig e-mailadres!",
    },
  },
  contact_phone: {
    type: String,
    required: false,
  },
  package: {
    type: String,
    enum: ["standard", "pro"],
    default: "standard",
    required: true,
  },
});

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
