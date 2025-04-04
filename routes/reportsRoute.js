const express = require("express");
const router = express.Router();
const Bill = require("../models/billsModel");
const Item = require("../models/itemModel");
const { getInventoryReport } = require("../controllers/reportsController");

router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, sortBy = "createdAt", order = "desc" } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const reports = await Bill.find(filter)
      .populate("cashier", "name")
      .populate("customer", "name")
      .sort({ [sortBy]: sortOrder }); // Ensure sorting is applied here

    const formattedReports = reports.map((bill) => ({
      _id: bill._id,
      createdAt: bill.createdAt,
      cashierName: bill.cashier?.name || "Unknown",
      customerName: bill.customer?.name || "Guest",
      totalAmount: bill.totalAmount,
      paymentMethod: bill.paymentMethod,
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

router.get("/inventory", getInventoryReport);

router.get("/category-sales", async (req, res) => {
  try {
    const categorySales = await Item.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: "$stock" }, // Replace with actual sales data if available
        },
      },
      {
        $project: {
          category: "$_id",
          value: 1,
          _id: 0,
        },
      },
    ]);
    res.json(categorySales);
  } catch (error) {
    console.error("Error fetching category sales data:", error);
    res.status(500).json({ message: "Failed to fetch category sales data" });
  }
});

router.get("/most-sold-items", async (req, res) => {
  try {
    const mostSoldItems = await Bill.aggregate([
      { $unwind: "$items" }, // Decompose the items array
      {
        $group: {
          _id: "$items.itemName",
          quantitySold: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          itemName: "$_id",
          quantitySold: 1,
          _id: 0,
        },
      },
      { $sort: { quantitySold: -1 } }, // Sort by quantity sold in descending order
      { $limit: 10 }, // Limit to top 10 most sold items
    ]);
    res.json(mostSoldItems);
  } catch (error) {
    console.error("Error fetching most sold items data:", error);
    res.status(500).json({ message: "Failed to fetch most sold items data" });
  }
});

router.get("/monthly-revenue", async (req, res) => {
  try {
    const monthlyRevenue = await Bill.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          revenue: { $sum: "$totalAmount" }, // Sum totalAmount for each month
        },
      },
      {
        $project: {
          month: "$_id",
          revenue: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } }, // Sort by month in ascending order
    ]);
    res.json(monthlyRevenue);
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    res.status(500).json({ message: "Failed to fetch monthly revenue data" });
  }
});

module.exports = router;
