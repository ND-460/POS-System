const Bill = require("../models/billsModel");
const Item = require("../models/itemModel");
const User = require("../models/userModel"); // -Ensure User model is imported

exports.completeTransaction = async (req, res) => {
  try {
    console.log("- Received Transaction Data:", req.body);

    let { customer, cashier, items, totalAmount, paymentMethod, taxAmount } = req.body;

    if (!cashier || !items || !totalAmount || !paymentMethod) {
      console.log("- Missing required fields!");
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!customer || customer === "guest") {
      customer = null; // Allow guest transactions
    }

    if (!taxAmount) {
      taxAmount = 0;
    }

    // Fetch cashier name
    const cashierData = await User.findById(cashier).select("name");
    const cashierName = cashierData ? cashierData.name : "Unknown";

    // Prepare items with itemName
    const itemsWithNames = [];
    let totalLoyaltyPoints = 0;
    let discountedTotalAmount = 0;

    for (const transactionItem of items) {
      const item = await Item.findById(transactionItem.item);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Validate quantity
      if (isNaN(transactionItem.quantity) || transactionItem.quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for item: ${item.name}` });
      }

      if (item.stock < transactionItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }

      item.stock -= transactionItem.quantity; // Subtract quantity from stock
      await item.save();

      const originalPrice = item.price * transactionItem.quantity; // Calculate original price
      const discountedPrice = originalPrice * (item.discount || 0) / 100; // Calculate discounted price
      const subtotal = originalPrice - discountedPrice; // Calculate subtotal
      const itemLoyaltyPoints = item.loyaltyPoints * transactionItem.quantity;

      discountedTotalAmount += subtotal; // Add subtotal to total amount
      totalLoyaltyPoints += itemLoyaltyPoints;

      itemsWithNames.push({
        item: transactionItem.item,
        itemName: item.name,
        quantity: transactionItem.quantity,
        price: item.price,
        originalPrice,
        discountedPrice,
        subtotal,
        loyaltyPoints: itemLoyaltyPoints,
      });
    }

    // Handle payment with loyalty points
    let remainingAmount = discountedTotalAmount;
    let loyaltyPointsUsed = 0;

    if (customer) {
      const customerData = await User.findById(customer).select("name loyaltyPoints");
      if (customerData) {
        if (paymentMethod === "loyalty points") {
          if (customerData.loyaltyPoints >= remainingAmount) {
            loyaltyPointsUsed = remainingAmount;
            customerData.loyaltyPoints -= remainingAmount;
            remainingAmount = 0;
          } else {
            loyaltyPointsUsed = customerData.loyaltyPoints;
            remainingAmount -= customerData.loyaltyPoints;
            customerData.loyaltyPoints = 0;
          }
        }

        if (remainingAmount > 0) {
          customerData.loyaltyPoints += Math.floor(totalLoyaltyPoints); // Add earned loyalty points
        }

        await customerData.save();
      }
    }

    // Create new bill
    const bill = new Bill({
      customer,
      cashier,
      cashierName,
      items: itemsWithNames,
      totalAmount: discountedTotalAmount,
      paymentMethod: remainingAmount > 0 ? "mixed" : "loyalty points", // Mixed payment if loyalty points are insufficient
      taxAmount,
      loyaltyPointsUsed,
    });
    await bill.save();

    console.log("-Transaction Successful:", bill);

    return res.status(201).json({
      message: "Transaction completed successfully!",
      bill: {
        _id: bill._id,
        createdAt: bill.createdAt,
        customerName: customer ? customerData.name : "Guest",
        cashier,
        cashierName,
        items: itemsWithNames,
        totalAmount: discountedTotalAmount,
        paymentMethod: remainingAmount > 0 ? "mixed" : "loyalty points",
        loyaltyPointsUsed,
      },
    });
  } catch (error) {
    console.error("- Backend Error:", error);
    res.status(500).json({ message: "Transaction failed", error });
  }
};
