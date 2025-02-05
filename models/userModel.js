const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    birthdate: { type: Date, required: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "cashier", "admin"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false }, // QR verification
    loyaltyPoints: { type: Number, default: 0 },
    pastOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
    specialDiscounts: [{ type: String }], // Example: ["Birthday Discount"]
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);