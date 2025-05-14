const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    barcode: { type: String, unique: true, required: true },
    discount: { type: Number, default: 0 }, 
    lowStockAlert: { type: Number, default: 5 }, 
    loyaltyPoints: { type: Number, default: 0 }, 
    inventoryUpdated: { type: Date, default: null },
  },
  { timestamps: true }
);

itemSchema.pre("save", function (next) {
  console.log("Saving Item Document:", this); // Debugging log
  next();
});

module.exports = mongoose.model("Item", itemSchema);