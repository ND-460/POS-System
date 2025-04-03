const express = require("express");
const router = express.Router();
const Bill = require("../models/billsModel");
const { completeTransaction } = require("../controllers/billsController");
router.post("/", async (req, res) => {
  try {
    const { cashier, items, totalAmount, paymentMethod } = req.body;

    const bill = await Bill.create({
      cashier,
      items,
      totalAmount,
      paymentMethod,
      taxAmount: totalAmount * 0.1, // Example tax calculation
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("cashier", "name").populate("items.item", "name");
    if (!bill) return res.status(404).json({ message: "Receipt not found" });

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/complete", completeTransaction);

router.get("/:billId", async (req, res) => {
  try {
    console.log(`-Fetching Bill ID: ${req.params.billId}`);
    const bill = await Bill.findById(req.params.billId)
      .populate("cashier", "name")
      .populate("customer", "name")
      .populate("items.item", "name");
    
    if (!bill) {
      console.log("- Bill not found");
      return res.status(404).json({ message: "Bill not found" });
    }

    console.log("-Sending Bill Data:", bill);
    res.json(bill);
  } catch (error) {
    console.error("- Error fetching bill:", error);
    res.status(500).json({ message: "Failed to fetch bill" });
  }
});

module.exports = router;
