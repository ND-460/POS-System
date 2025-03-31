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
        discount: { type: Number, default: 0 }, // Discount percentage
        loyaltyPoints: { type: Number, default: 0 }, // Points earned for this item
        originalPrice: { type: Number, required: true }, // Store original price
        discountedPrice: { type: Number, required: true }, // Store discounted price
        subtotal: { type: Number, required: true }, // Store subtotal
      },
    ],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cash", "cheque", "loyalty points", "UPI"], required: true },
    loyaltyPointsUsed: { type: Number, default: 0 }, // Track loyalty points used
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
