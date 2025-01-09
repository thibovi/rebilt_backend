const mongoose = require("mongoose");

const PartnerConfigurationSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
    required: true,
  },
  configurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Configuration",
    required: true,
  },
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
});

const PartnerConfiguration = mongoose.model(
  "PartnerConfiguration",
  PartnerConfigurationSchema
);

module.exports = PartnerConfiguration;
