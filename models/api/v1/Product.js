const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: false,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: false,
  },
  brand: {
    type: String,
    required: false,
  },
  activeInactive: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Partner",
  },
  configurations: [
    {
      configurationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Configuration",
        required: true,
      },
      selectedOptions: [
        {
          optionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option",
            required: true,
          },
          images: [
            {
              type: String,
              required: false,
            },
          ],
        },
      ],
    },
  ],
  modelFile: {
    type: String,
    required: false, // 3D model file URL (if applicable)
  },
  thumbnail: {
    type: String,
    required: false, // Thumbnail image URL
  },
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
