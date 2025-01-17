const Checkout = require("../../../models/api/v1/Checkout");
const axios = require("axios");
const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction
  ? "https://rebilt-backend.onrender.com/api/v1"
  : "http://localhost:3000/api/v1";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Stripe API-sleutel

const create = async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod } = req.body;

    // Valideer verplichte velden
    if (!customer || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        message: "Alle verplichte velden moeten ingevuld zijn.",
      });
    }

    // Maak een nieuwe checkout in de database
    const checkout = new Checkout({
      customer,
      items,
      totalAmount,
      paymentMethod,
    });

    // Sla de checkout op in de database
    const savedCheckout = await checkout.save();

    // Gebruik Stripe om een nieuwe checkout sessie te creëren
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "eur", // Pas de valuta aan
          product_data: {
            name: item.productId,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`, // Gebruik omgevingsvariabele
      cancel_url: `${process.env.CANCEL_URL}`, // Gebruik omgevingsvariabele
    });

    // Teruggeven van de checkout sessie URL
    return res.status(201).json({
      message: "Checkout succesvol aangemaakt.",
      checkout: savedCheckout,
      url: session.url, // De URL van de Stripe checkout sessie
    });
  } catch (error) {
    console.error("Fout bij het aanmaken van de checkout:", error);
    res.status(500).json({
      message: "Fout bij het aanmaken van de checkout.",
      error: error.message,
    });
  }
};

// List all Configurations
const index = async (req, res) => {
  try {
    const checkouts = await Checkout.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Checkouts opgehaald.", data: checkouts });
  } catch (error) {
    res.status(500).json({
      message: "Fout bij het ophalen van de checkouts.",
      error: error.message,
    });
  }
};

// Show a specific Configuration by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;
    const checkout = await Checkout.findById(id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout niet gevonden." });
    }

    res.status(200).json({ message: "Checkout opgehaald.", data: checkout });
  } catch (error) {
    res.status(500).json({
      message: "Fout bij het ophalen van de checkout.",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCheckout = await Checkout.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedCheckout) {
      return res.status(404).json({ message: "Checkout niet gevonden." });
    }

    res.status(200).json({
      message: "Checkout succesvol geüpdatet.",
      data: updatedCheckout,
    });
  } catch (error) {
    res.status(500).json({
      message: "Fout bij het updaten van de checkout.",
      error: error.message,
    });
  }
};

// Delete Configuration
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCheckout = await Checkout.findByIdAndDelete(id);

    if (!deletedCheckout) {
      return res.status(404).json({ message: "Checkout niet gevonden." });
    }

    res.status(200).json({
      message: "Checkout succesvol verwijderd.",
      data: deletedCheckout,
    });
  } catch (error) {
    res.status(500).json({
      message: "Fout bij het verwijderen van de checkout.",
      error: error.message,
    });
  }
};

module.exports = { create, index, show, update, destroy };
