const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, required: true },
  options: [
    {
      optionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
      images: [
        {
          url: { type: String, required: true },
          altText: { type: String, required: false },
        },
      ],
    },
  ],
  isColor: { type: Boolean, required: true },
});

const Configuration = mongoose.model("Configuration", configurationSchema);
module.exports = Configuration;
