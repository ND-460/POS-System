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
        originalPrice: { type: Number, required: true }, // Original price before discounts
        itemDiscount: { type: Number, default: 0 }, // Item's base discount percentage
        eventDiscount: { type: Number, default: 0 }, // Event discount percentage
        itemDiscountAmount: { type: Number, default: 0 }, // Amount saved from item discount
        eventDiscountAmount: { type: Number, default: 0 }, // Amount saved from event discount
        subtotal: { type: Number, required: true }, // Final price after all discounts
        loyaltyPoints: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    paymentMethod: { 
      type: String, 
      enum: ["cash", "cheque", "loyalty points", "UPI"], // Removed "mixed"
      required: true 
    },
    event: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
      title: { type: String },
      discount: { type: Number }
    },
    loyaltyPointsUsed: { type: Number, default: 0 }, // Track loyalty points used
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
