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
    required: false,
  },
  metaDescription: {
    type: String,
    required: false,
  },
  urlHandle: {
    type: String,
    required: false,
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
  selectedFilters: [
    {
      filterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Filter",
        required: true,
      },
      selectedOptions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Option" },
      ],
    },
  ],
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
  layers: [
    {
      name: { type: String, required: false }, // bijv. "zool"
      configurationIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Configuration",
        },
      ],
    },
  ],
  thumbnail: {
    type: String,
    required: false, // Thumbnail image URL
  },
  arVisualizationType: {
    type: String,
    enum: ["space", "body", "face", "hands"],
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
