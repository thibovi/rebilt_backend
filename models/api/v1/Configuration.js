const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, required: true },
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }], // Dit maakt het een ObjectId
  isColor: { type: Boolean, required: true },
});

const Configuration = mongoose.model("Configuration", configurationSchema);
module.exports = Configuration;
