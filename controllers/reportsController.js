const Item = require("../models/itemModel");

exports.getInventoryReport = async (req, res) => {
  try {
    const items = await Item.find().select("name stock inventoryUpdated barcode");
    const formattedItems = items.map((item) => ({
      ...item.toObject(),
      inventoryUpdated: item.inventoryUpdated
        ? new Date(item.inventoryUpdated).toISOString()
        : null,
      barcode: item.barcode || "N/A", // Ensure barcode is included
    }));
    console.log("Formatted inventory items:", formattedItems); // Log formatted items
    res.json(formattedItems);
  } catch (error) {
    console.error("Error fetching inventory reports:", error);
    res.status(500).json({ message: "Failed to fetch inventory reports" });
  }
};
