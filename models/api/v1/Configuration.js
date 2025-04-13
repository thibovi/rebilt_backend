const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, required: true },
  isColor: { type: Boolean, required: true },
  options: [
    {
      optionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option", // Verwijst naar de Option collectie
        required: true,
      },
    },
  ],
});

const Configuration = mongoose.model("Configuration", configurationSchema);
module.exports = Configuration;
