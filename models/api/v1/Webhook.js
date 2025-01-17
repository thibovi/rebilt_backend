const mongoose = require("mongoose");

// Definieer het schema voor de Webhook
const WebhookSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // Het type van het evenement (bijv. payment_intent.succeeded)
  eventData: { type: mongoose.Schema.Types.Mixed, required: true }, // Gegevens van het event (kan verschillende velden bevatten)
  receivedAt: { type: Date, default: Date.now }, // Tijdstip van ontvangst van de webhook
});

// Maak het model
const Webhook = mongoose.model("Webhook", WebhookSchema);

module.exports = Webhook;
