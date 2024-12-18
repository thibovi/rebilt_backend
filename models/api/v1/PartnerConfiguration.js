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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Option",
    },
  ],
});

const PartnerConfiguration = mongoose.model(
  "PartnerConfiguration",
  PartnerConfigurationSchema
);

module.exports = PartnerConfiguration;
