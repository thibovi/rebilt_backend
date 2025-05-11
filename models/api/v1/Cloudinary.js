const mongoose = require("mongoose");

const cloudinarySchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    name: { type: String, required: true, trim: true }, // Naam van het model
    modelFile: { type: String, required: true }, // URL of pad naar het geüploade modelbestand
  },
  { timestamps: true }
); // Automatisch createdAt en updatedAt toevoegen

const Cloudinary = mongoose.model("Cloudinary", cloudinarySchema);
module.exports = Cloudinary;
