const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    customerName: { type: String, default: "Guest" },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cashierName: { type: String, required: true },
    items: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: true }, 
        itemDiscount: { type: Number, default: 0 }, 
        eventDiscount: { type: Number, default: 0 },
        itemDiscountAmount: { type: Number, default: 0 }, 
        eventDiscountAmount: { type: Number, default: 0 }, 
        subtotal: { type: Number, required: true }, 
        loyaltyPoints: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    paymentMethod: { 
      type: String, 
      enum: ["cash", "cheque", "loyalty points", "UPI"], 
      required: true 
    },
    event: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
      title: { type: String },
      discount: { type: Number }
    },
    loyaltyPointsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
