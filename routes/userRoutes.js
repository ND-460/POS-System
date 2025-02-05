const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", email, password);

    const user = await User.findOne({ email }).select("+password"); // -Force password retrieval
    console.log("User Found:", user);

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials (Password missing)" });
    }

    console.log("Stored Password in DB:", user.password);
    console.log("Entered Password:", password);

    if (user.password !== password) {
      console.log("Password mismatch!");
      return res.status(400).json({ message: "Invalid credentials (Incorrect password)" });
    }

    res.json({ user });
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// -Get All Cashiers
router.get("/cashiers", async (req, res) => {
  try {
    const cashiers = await User.find({ role: "cashier" });
    res.json(cashiers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cashiers", error });
  }
});

// -Delete Cashier
router.delete("/cashiers/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Cashier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cashier", error });
  }
});

router.put("/cashiers/:id", async (req, res) => {
  try {
    const cashier = await User.findById(req.params.id);
    if (!cashier) return res.status(404).json({ message: "Cashier not found" });

    cashier.name = req.body.name;
    cashier.email = req.body.email;
    cashier.mobile = req.body.mobile;
    cashier.role = req.body.role; // -Allow role update (cashier → admin)

    await cashier.save();
    res.json({ message: "Cashier updated successfully", cashier });
  } catch (error) {
    res.status(500).json({ message: "Error updating cashier", error });
  }
});

router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("name mobile");
    res.json(customers);
  } catch (error) {
    console.error("- Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});



module.exports = router;
