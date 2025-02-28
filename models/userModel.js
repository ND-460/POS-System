const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: false, unique: true },
    birthdate: { type: Date, required: false },
    password: { type: String, required: false, select: false },
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