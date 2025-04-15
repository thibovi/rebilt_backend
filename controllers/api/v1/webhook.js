const Webhook = require("../../../models/api/v1/Webhook");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Stripe API-sleutel
const axios = require("axios");
const Partner = require("../../../models/api/v1/Partner"); // Zorg ervoor dat je een Partner-model hebt

const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction
  ? "https://rebilt-backend.onrender.com/api/v1"
  : "http://localhost:3000/api/v1";

// Webhook Create functie (voor verwerking van inkomende webhooks)
const create = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; // Geheime sleutel voor Stripe-webhook

  let event;

  try {
    // Verifieer de webhook-handtekening van Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Verkeerde handtekening of ongeldige webhook
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Verwerking van het event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object; // de payment_intent gegevens

      // Opslaan van het webhook event in de database
      try {
        const webhook = new Webhook({
          eventType: event.type,
          eventData: event.data.object, // Gegevens van de payment_intent
        });

        await webhook.save();

        // Maak de partner aan na succesvolle betaling
        const customerData = {
          name: paymentIntent.shipping.name, // Verkregen uit de betaling
          email: paymentIntent.receipt_email, // Verkregen uit de betaling
          phone: paymentIntent.shipping.phone, // Verkregen uit de betaling (indien aanwezig)
        };

        const partnerData = {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone, // Optioneel
        };

        // Maak de partner via je API
        const partner = new Partner(partnerData);
        await partner.save();
      } catch (error) {
        console.error("Fout bij het opslaan van de webhook gegevens:", error);
        return res
          .status(500)
          .send("Er is een probleem met het opslaan van de webhook gegevens.");
      }

      break;

    case "payment_intent.failed":
      const paymentFailed = event.data.object; // de payment_intent gegevens bij mislukking

      // Foutafhandelingslogica, bijvoorbeeld opslaan in database of een notificatie sturen
      try {
        const webhookFailed = new Webhook({
          eventType: event.type,
          eventData: event.data.object, // Gegevens van de mislukte betaling
        });

        await webhookFailed.save();
      } catch (error) {
        console.error("Fout bij het opslaan van de mislukte betaling:", error);
        return res
          .status(500)
          .send("Er is een probleem met het opslaan van de mislukte betaling.");
      }
      break;

    default:
      break;
  }

  // Stuur een succesvolle status terug naar Stripe
  res.json({ received: true });
};

module.exports = { create };
