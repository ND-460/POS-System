const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cashierName: { type: String, required: true }, // Store cashier name
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        itemName: { type: String, required: true }, // Store item name
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cash", "cheque", "loyalty points", "UPI"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
