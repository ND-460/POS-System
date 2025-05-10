const express = require("express");
const router = express.Router();
const Item = require("../models/itemModel");
const {editItemController,deleteItemController, updateInventoryController,getLowStockItems} = require("../controllers/itemController")

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
    console.log("Incoming Request Body:", req.body); // Debugging log
    const { name, category, price, stock, barcode, discount, description, loyaltyPoints } = req.body;

    // Ensure barcode is unique
    const existingItem = await Item.findOne({ barcode });
    if (existingItem) return res.status(400).json({ message: "Barcode already exists" });

    const newItem = new Item({ name, category, price, stock, barcode, discount, description, loyaltyPoints });
    await newItem.save();

    console.log("Item Added:", newItem); // Debugging log
    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Error adding item:", error); // Debugging log for errors
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

// -Delete an item by ID
router.delete("/:id", deleteItemController);

// - Update an item by ID
router.put("/:id", editItemController);

// - Update inventory for an item by ID
router.put("/:id/inventory", updateInventoryController);

// - Get low stock items
router.get("/low-stock",getLowStockItems);



module.exports = router;
