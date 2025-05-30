const mongoose = require("mongoose");

const filterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Partner",
  },
  options: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Filter", filterSchema);
