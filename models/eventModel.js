const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    discount: { type: Number, required: true },
    date: { type: Date, required: true },
    categories: [{ type: String }], // Array of category names
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }], // Array of item IDs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
