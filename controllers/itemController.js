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
    const { id } = req.params; //  Get ID from URL params
    console.log(` Updating Item ID: ${id}`);

    const updatedItem = await itemModel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedItem) {
      console.log(" Item not found!");
      return res.status(404).json({ message: "Item not found" });
    }

    console.log(" Item updated successfully:", updatedItem);
    res.status(200).json({ message: "Item updated successfully!", item: updatedItem });
  } catch (error) {
    console.error(" Error updating item:", error);
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


module.exports = {
  getItemController,
  addItemController,
  editItemController,
  deleteItemController,
};
