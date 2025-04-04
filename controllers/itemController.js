const itemModel = require("../models/itemModel");
// get items
const getItemController = async (req, res) => {
  try {
    const items = await itemModel.find();
    res.status(200).send(items);
  } catch (error) {
    console.log(error);
  }
};
//add items
const addItemController = async (req, res) => {
  try {
    const newItem = new itemModel(req.body);
    await newItem.save();
    res.status(201).send("Item Created Successfully!");
  } catch (error) {
    res.status(400).send("error", error);
    console.log(error);
  }
};
//update item
const editItemController = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL params
    console.log(`Updating Item ID: ${id}`);

    // Include inventoryUpdated if it's part of the request body
    const updatedData = { ...req.body };
    if (req.body.stock) {
      updatedData.inventoryUpdated = new Date(); // Update inventoryUpdated if stock is modified
    }
    const updatedItem = await itemModel.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedItem) {
      console.log("Item not found!");
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("Item updated successfully:", updatedItem);
    res.status(200).json({ message: "Item updated successfully!", item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating item", error });
  }
};
//delete item
const deleteItemController = async (req, res) => {
  try {
    const { id } = req.params; //  Get ID from URL params

    console.log(` Attempting to delete Item ID: ${id}`);
    const item = await itemModel.findById(id);

    if (!item) {
      console.log(" Item not found!");
      return res.status(404).json({ message: "Item not found" });
    }

    await itemModel.findByIdAndDelete(id);
    console.log(" Item deleted successfully!");
    res.status(200).json({ message: "Item deleted successfully!" });
  } catch (error) {
    console.error(" Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item", error });
  }
};
//update inventory
const updateInventoryController = async (req, res) => {
  try {
    const { id } = req.params; // Get item ID from URL params
    const { quantity } = req.body; // Get quantity to add to inventory

    console.log(`Updating inventory for Item ID: ${id}`);

    const item = await itemModel.findById(id);
    if (!item) {
      console.log("Item not found!");
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    item.stock += quantity; // Add quantity to stock
    item.inventoryUpdated = new Date(); // Update last inventory update timestamp
    console.log("Setting inventoryUpdated to:", item.inventoryUpdated);

    await item.save();
    console.log("Saved item with updated inventory:", item);

    res.status(200).json({ message: "Inventory updated successfully!", item });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Error updating inventory", error });
  }
};
module.exports = {
  getItemController,
  addItemController,
  editItemController,
  deleteItemController,
  updateInventoryController,
};
