const express = require("express");
const router = express.Router();
const Item = require("../models/itemModel");

router.get("/barcode/:barcode", async (req, res) => {
  try {
    const item = await Item.findOne({ barcode: req.params.barcode });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



// -Add new item
router.post("/add", async (req, res) => {
  try {
    const { name, category, price, stock, barcode, discount, description } = req.body;

    // Ensure barcode is unique
    const existingItem = await Item.findOne({ barcode });
    if (existingItem) return res.status(400).json({ message: "Barcode already exists" });

    const newItem = new Item({ name, category, price, stock, barcode, discount, description });
    await newItem.save();

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error });
  }
});

// -Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

module.exports = router;


module.exports = router;
