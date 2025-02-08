const User = require("../models/userModel");

// - Login User
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", email, password);

    const user = await User.findOne({ email }).select("+password");
    console.log("User Found:", user);

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("- Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// - Register New User (Cashier/Admin)
const registerController = async (req, res) => {
  try {
    const { name, email, mobile, role, password, birthdate } = req.body;

    // - Ensure all fields except birthdate are provided
    if (!name || !email || !mobile || !role || !password) {
      return res.status(400).json({ message: "All fields except birthdate are required" });
    }

    // - Set a default birthdate for non-customers (Cashier/Admin)
    const finalBirthdate = birthdate || new Date("2000-01-01"); 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ name, email, mobile, role, password, birthdate: finalBirthdate });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("- Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};


// - Get All Cashiers
const getCashiers = async (req, res) => {
  try {
    const cashiers = await User.find({ role: "cashier" });
    res.status(200).json(cashiers);
  } catch (error) {
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
    console.error(" Error deleting cashier:", error);
    res.status(500).json({ message: "Error deleting cashier", error });
  }
};


// - Get All Customers
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("name mobile");
    res.status(200).json(customers);
  } catch (error) {
    console.error("- Error fetching customers:", error);
    res.status(500).json({ message: "Failed to fetch customers", error });
  }
};

module.exports = {
  loginController,
  registerController,
  getCashiers,
  updateCashier,
  deleteCashier,
  getCustomers,
};
