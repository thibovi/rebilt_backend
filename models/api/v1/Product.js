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
  productPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true, // Ensures that a category is always selected
  },
  subType: {
    type: String,
    required: true,
    validate: {
      validator: async function (value) {
        if (!this.category) {
          return false; // If there's no category, validation fails
        }

        // Fetch category from the database
        const category = await mongoose
          .model("Category")
          .findById(this.category);

        if (!category) {
          throw new Error("Category not found");
        }

        // Validate if subType exists within the category's subTypes
        if (!category.subTypes.includes(value)) {
          throw new Error(
            `${value} is not a valid subtype for the selected category`
          );
        }

        return true;
      },
      message: (props) =>
        `${props.value} is not a valid subtype for the selected category`,
    },
  },
  description: {
    type: String,
    required: false,
  },
  brand: {
    type: String,
    required: false,
  },
  images: {
    type: [String],
    required: false,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Partner",
  },
  configurations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Configuration",
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
