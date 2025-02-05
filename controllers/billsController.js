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
      customer = null; // -Allow guest transactions
    }

    if (!taxAmount) {
      taxAmount = 0;
    }

    // -Update item stock
    for (const transactionItem of items) {
      const item = await Item.findById(transactionItem.item);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      if (item.stock < transactionItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
      item.stock -= transactionItem.quantity;
      await item.save();
    }

    // -Fetch customer name if exists
    let customerName = "Guest";
    if (customer) {
      const customerData = await User.findById(customer).select("name");
      if (customerData) {
        customerName = customerData.name;
      }
    }

    // -Create new bill
    const bill = new Bill({
      customer,
      cashier,
      items,
      totalAmount,
      paymentMethod,
      taxAmount,
    });
    await bill.save();

    console.log("-Transaction Successful:", bill);

    return res.status(201).json({
      message: "Transaction completed successfully!",
      bill: {
        _id: bill._id,
        createdAt: bill.createdAt,
        customerName, // -Ensure customer name is included in response
        cashier,
        items,
        totalAmount,
        paymentMethod,
      },
    });
  } catch (error) {
    console.error("- Backend Error:", error);
    res.status(500).json({ message: "Transaction failed", error });
  }
};
