const { sub } = require("@tensorflow/tfjs");
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  categoryIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  subType: {
    type: String,
    required: false,
  },
  productSelectedType: {
    type: String,
    required: false,
    enum: ["2D", "3D"],
    default: "2D",
  },
  productCode: {
    type: String,
    required: false,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: false,
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  pageTitle: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  urlHandle: {
    type: String,
    required: true,
  },
  publishedInactive: {
    type: String,
    enum: ["published", "inactive"],
    default: "published",
    required: true,
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
  arVisualizationType: {
    type: String,
    enum: ["space", "body", "face", "hands"],
    default: "space",
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }, // Add lastUpdated field
});

ProductSchema.pre("save", function (next) {
  this.lastUpdated = new Date(); // Update lastUpdated bij elke save
  next();
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
