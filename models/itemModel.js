const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  barcode: { type: String, unique: true, required: true },
  discount: { type: Number, default: 0 }, // Discount in percentage
  lowStockAlert: { type: Number, default: 5 }, // Alert when stock falls below this
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);