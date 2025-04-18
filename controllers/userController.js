const mongoose = require("mongoose"); 
const User = require("../models/userModel");
const Bill = require("../models/billsModel");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");
// - Login User
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("- Login Attempt:", email, password);

    const user = await User.findOne({ email }).select("+password");
    console.log("- User Found:", user);
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("- Login Successful for:", user.role);

    // - Send user object in response
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("- Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const generateQrLoginUrl = async (req, res) => {
  try {
    const loginUrl = `http://localhost:3000/customer-login`; // - Change as per frontend
    res.json({ qrUrl: loginUrl });
  } catch (error) {
    console.error("- Error generating QR Code URL:", error);
    res.status(500).json({ message: "Failed to generate QR Code URL" });
  }
};
// - Google Authentication Handler
const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });
// - Google Authentication Callback Handler
const googleAuthCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      console.error("- Google Auth Error:", err);
      return res.redirect("http://localhost:3000/customer-auth?error=GoogleAuthFailed");
    }
    if (!user) {
      console.warn("- Google Auth Failed: No user found");
      return res.redirect("http://localhost:3000/customer-auth?error=GoogleAuthFailed");
    }
    // - Ensure user is saved in DB
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      const newUser = new User({
        name: user.name,
        email: user.email,
        role: "customer",
        isVerified: true, 
      });
      await newUser.save();
      console.log("- New Google User Saved:", newUser);
    }
    req.login(user, (err) => {
      if (err) {
        console.error("- Error logging in user:", err);
        return res.redirect("http://localhost:3000/customer-auth?error=GoogleAuthFailed");
      }
      return res.redirect(`http://localhost:3000/customer-auth?googleSuccess=true&userId=${user._id}`);
    });
  })(req, res, next);
};
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("- Invalid User ID format:", id);
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    const user = await User.findById(id).select("name mobile role"); // Fetch only necessary fields
    console.log("- Fetching User with ID:", id);
    if (!user || user.role !== "customer") { // Ensure the user is a customer
      console.log("- Customer not found for ID:", id);
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("- Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error });
  }
};

const registerController = async (req, res) => {
  try {
    console.log("- Received Registration Data:", req.body); // - Log incoming data

    const { name, email, mobile, birthdate, password, role } = req.body;

    if (!name || !email || !mobile || !birthdate || !password || !role) {
      console.log("- Missing required fields!"); // - Log missing fields
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({
      name,
      email,
      mobile,
      birthdate,
      password,
      role, // Ensure role is set correctly
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("- Error registering user:", error);
    res.status(500).json({ message: "Registration failed", error });
  }
};





// - Get All Cashiers
const getCashiers = async (req, res) => {
  try {
    console.log("- Fetching all cashiers"); // Debugging log
    const cashiers = await User.find({ role: "cashier" });
    console.log(`- Found ${cashiers.length} cashiers`, cashiers); // Log fetched cashiers
    res.status(200).json(cashiers);
  } catch (error) {
    console.error("- Error fetching cashiers:", error.message); // Add error message logging
    res.status(500).json({ message: "Error fetching cashiers", error });
  }
};

// - Update Cashier Details
const updateCashier = async (req, res) => {
  try {
    const cashier = await User.findById(req.params.id);
    if (!cashier) return res.status(404).json({ message: "Cashier not found" });

    cashier.name = req.body.name;
    cashier.email = req.body.email;
    cashier.mobile = req.body.mobile;
    cashier.role = req.body.role;

    await cashier.save();
    res.status(200).json({ message: "Cashier updated successfully", cashier });
  } catch (error) {
    console.error("Error updating cashier:", error);
    res.status(500).json({ message: "Error updating cashier", error });
  }
};

// - Delete Cashier
const deleteCashier = async (req, res) => {
  try {
    const cashier = await User.findById(req.params.id);
    if (!cashier) return res.status(404).json({ message: "Cashier not found" });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Cashier deleted successfully!" });
  } catch (error) {
    console.error("Error deleting cashier:", error);
    res.status(500).json({ message: "Error deleting cashier", error });
  }
};



// - Get All Customers
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("name mobile loyaltyPoints");
    res.status(200).json(customers);
  } catch (error) {
    console.error("- Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers", error });
  }
};

const getPastOrders = async (req, res) => {
  try {
    const { customerId } = req.params; // - Get customerId from params

    if (!customerId || customerId === "undefined") {
      console.error("- Invalid Customer ID:", customerId);
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    console.log(`- Fetching Orders for Customer ID: ${customerId}`); // - Debugging

    const orders = await Bill.find({ customer: customerId })
    .populate("items.item", "name")
    .select("_id createdAt totalAmount paymentMethod");

  res.status(200).json(orders);
  } catch (error) {
    console.error("- Error fetching customer orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
}

const getLoyaltyPoints = async (req, res) => {
  try {
    const customerId = req.params.id;
    console.log(`- Fetching loyalty points for Customer ID: ${customerId}`);

    // - Ensure customerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.log("- Invalid ObjectId Format:", customerId);
      return res.status(400).json({ message: "Invalid customer ID format" });
    }

    // - Convert ID to ObjectId and query MongoDB
    const customer = await User.findById(customerId);

    console.log("- Found Customer:", customer);

    if (!customer) {
      console.log("- Customer NOT FOUND!");
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ loyaltyPoints: customer.loyaltyPoints });
  } catch (error) {
    console.error("- Error fetching loyalty points:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginController,
  registerController,
  getCashiers,
  updateCashier,
  deleteCashier,
  getCustomers,
  getPastOrders,
  getLoyaltyPoints,
  generateQrLoginUrl,
  googleAuth,
  googleAuthCallback,
  getUserById
};
