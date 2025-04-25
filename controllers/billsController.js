const Bill = require("../models/billsModel");
const Item = require("../models/itemModel");
const User = require("../models/userModel");
const Event = require("../models/eventModel");

exports.completeTransaction = async (req, res) => {
  try {
    console.log("- Received Transaction Data:", req.body);

    let { customer, cashier, items, totalAmount, paymentMethod, taxAmount } = req.body;

    if (!cashier || !items || !totalAmount || !paymentMethod) {
      console.log("- Missing required fields!");
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!taxAmount) {
      taxAmount = 0;
    }

    // Fetch cashier name
    const cashierData = await User.findById(cashier).select("name");
    const cashierName = cashierData ? cashierData.name : "Unknown";

    let customerData = null;
    if (customer) {
      customerData = await User.findById(customer).select("name loyaltyPoints");
    }

    // Fetch all active events for today
    const today = new Date();
    const activeEvents = await Event.find({
      date: { $gte: new Date(today.setHours(0, 0, 0, 0)), $lte: new Date(today.setHours(23, 59, 59, 999)) },
    });

    // Prepare items with itemName and calculate discounts
    const itemsWithNames = [];
    let totalLoyaltyPoints = 0;
    let discountedTotalAmount = 0;

    for (const transactionItem of items) {
      const item = await Item.findById(transactionItem.item);
      if (!item) {
        return res.status(404).json({ message: `Item not found: ${transactionItem.item}` });
      }

      // Validate quantity
      if (isNaN(transactionItem.quantity) || transactionItem.quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for item: ${item.name}` });
      }

      if (item.stock < transactionItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${item.stock}`,
        });
      }

      item.stock -= transactionItem.quantity; // Subtract quantity from stock
      await item.save();

      const originalPrice = item.price * transactionItem.quantity; // Calculate original price
      const itemDiscount = item.discount || 0; // Fetch item discount from Item model
      let eventDiscount = 0;

      // Check for applicable event discounts
      for (const activeEvent of activeEvents) {
        // Check if the item or its category is eligible for the event discount
        if (activeEvent.items.some(eventItem => eventItem.equals(item._id)) || 
            activeEvent.categories.some(eventCategory => eventCategory.equals(item.category))) {
          eventDiscount = activeEvent.discount; // Fetch event discount from Event model
        }
      }

      const itemDiscountAmount = originalPrice * (itemDiscount / 100); // Correct item discount calculation
      const priceAfterItemDiscount = originalPrice - itemDiscountAmount; // Price after applying item discount
      const eventDiscountAmount = priceAfterItemDiscount * (eventDiscount / 100); // Apply event discount after item discount
      const subtotal = priceAfterItemDiscount - eventDiscountAmount; // Calculate subtotal

      const itemLoyaltyPoints = Math.floor(item.loyaltyPoints * transactionItem.quantity);
      discountedTotalAmount += subtotal; // Add subtotal to total amount
      totalLoyaltyPoints += itemLoyaltyPoints;

      itemsWithNames.push({
        item: item._id,
        itemName: item.name,
        quantity: transactionItem.quantity,
        price: item.price,
        originalPrice,
        itemDiscount, // Store item discount
        eventDiscount, // Store event discount
        discountedPrice: subtotal, // Store the final discounted price
        subtotal,
        loyaltyPoints: itemLoyaltyPoints,
      });
    }

    // Handle payment with loyalty points
    let remainingAmount = discountedTotalAmount;
    let loyaltyPointsUsed = 0;
    if (paymentMethod === "loyalty points") {
      if (customerData) {
        if (customerData.loyaltyPoints >= discountedTotalAmount) {
          loyaltyPointsUsed = discountedTotalAmount;
          customerData.loyaltyPoints -= discountedTotalAmount;
          remainingAmount = 0;
          await customerData.save();
        } else {
          return res.status(400).json({
            message: "Loyalty points are not adequate, try another payment method.",
          });
        }
      } else {
        return res.status(400).json({ message: "Loyalty points payment requires a registered customer." });
      }
    } else if (paymentMethod === "cash" || paymentMethod === "UPI" || paymentMethod === "cheque") {
      remainingAmount = 0;
    } else {
      return res.status(400).json({ message: "Invalid payment method. Please choose a valid payment method." });
    }

    if (remainingAmount > 0) {
      return res.status(400).json({
        message: "Payment could not be completed. Please choose another payment method.",
      });
    }

    // Add loyalty points for the customer if applicable
    if (customerData) {
      customerData.loyaltyPoints += Math.floor(totalLoyaltyPoints);
      await customerData.save();
    }

    // Create new bill
    const bill = new Bill({
      customer,
      cashier,
      cashierName,
      items: itemsWithNames,
      totalAmount: discountedTotalAmount,
      paymentMethod,
      taxAmount,
      loyaltyPointsUsed,
    });
    await bill.save();

    console.log("-Transaction Successful:", bill);
    return res.status(201).json({
      message: "Transaction completed successfully!",
      billId: bill._id,
      bill: {
        _id: bill._id,
        createdAt: bill.createdAt,
        customerName: customerData ? customerData.name : "Guest",
        cashier,
        cashierName,
        items: itemsWithNames,
        totalAmount: discountedTotalAmount,
        paymentMethod,
        loyaltyPointsUsed,
      },
    });
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ message: "Transaction failed", error: error.message });
  }
};
