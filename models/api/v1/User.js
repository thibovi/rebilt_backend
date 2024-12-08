const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
  },
  role: {
    type: String,
    enum: ["customer", "partner_admin", "partner_owner", "platform_admin"],
    required: true,
    default: "customer",
  },
  company: { type: String, required: false },
  activeUnactive: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  bio: { type: String, default: "" },
  resetCode: Number,
  resetCodeExpiration: Date,
});

// Voeg de plugin toe voor wachtwoordbeheer
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

// Methode om het wachtwoord te verifiëren
userSchema.methods.isValidPassword = async function (password) {
  return await this.authenticate(password); // Gebruik de authenticate functie van passport-local-mongoose
};

const User = mongoose.model("User", userSchema);

module.exports = User;
