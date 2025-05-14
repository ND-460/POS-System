const mongoose = require("mongoose");
const User = require("../models/userModel");
const Bill = require("../models/billsModel");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");
const sendEmail = require("../config/mailer");
const Event = require("../models/eventModel");
const bcrypt = require("bcryptjs");
const Category = require("../models/categoryModel"); 
const Item = require("../models/itemModel"); 

// - Login User
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("- Login Attempt:", email, password);

    const user = await User.findOne({ email }).select("+password");
    console.log("- User Found:", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let isMatch = false;

    // Check if the password matches the hashed version
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for non-hashed passwords
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("- Login Successful for:", user.role);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "1h" }
    );

    // - Send user object and token in response
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("- Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const generateQrLoginUrl = async (req, res) => {
  try {
    const loginUrl = `${process.env.FRONTEND_URL}/customer-login`; 
    res.json({ qrUrl: loginUrl });
  } catch (error) {
    console.error("- Error generating QR Code URL:", error);
    res.status(500).json({ message: "Failed to generate QR Code URL" });
  }
};
// - Google Authentication Handler
const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});
// - Google Authentication Callback Handler
const googleAuthCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      console.error("- Google Auth Error:", err);
      return res.redirect(
        `${process.env.FRONTEND_URL}/customer-auth?error=GoogleAuthFailed` // Ensure this matches your frontend route
      );
    }
    if (!user) {
      console.warn("- Google Auth Failed: No user found");
      return res.redirect(
        `${process.env.FRONTEND_URL}/customer-auth?error=GoogleAuthFailed` // Ensure this matches your frontend route
      );
    }
    req.login(user, (err) => {
      if (err) {
        console.error("- Error logging in user:", err);
        return res.redirect(
          `${process.env.FRONTEND_URL}/customer-auth?error=GoogleAuthFailed` // Ensure this matches your frontend route
        );
      }
      console.log("- Redirecting to frontend with user ID:", user._id);
      return res.redirect(
        `${process.env.FRONTEND_URL}/customer-auth?googleSuccess=true&userId=${user._id}` // Ensure this matches your frontend route
      );
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
    if (!user || user.role !== "customer") {
      // Ensure the user is a customer
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

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const newUser = new User({
      name,
      email,
      mobile,
      birthdate,
      password: hashedPassword, // Save hashed password
      role, // Ensure role is set correctly
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully!", user: newUser });
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
    const customers = await User.find({ role: "customer" }).select(
      "name mobile loyaltyPoints"
    );
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
};

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

const sendMsg = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    console.log("- Sending message to:", email);
    sendEmail({
      email,
      subject,
      message,
    });
    console.log("- Message sent successfully to:", email);
  } catch (error) {
    console.error("- Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, discount, date, categories, items } = req.body;

    if (!title || !description || !discount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEvent = new Event({ title, description, discount, date, categories, items });
    await newEvent.save();

    // Fetch all customers
    const customers = await User.find({ role: "customer" });

    // Fetch item names from IDs
    const itemDocs = await Item.find({ _id: { $in: items } }).select("name");
    const itemNames = itemDocs.map(item => item.name).join(", ");

    // Fetch category names from IDs
    const categoryDocs = await Category.find({ _id: { $in: categories } }).select("name");
    const categoryNames = categoryDocs.map(category => category.name).join(", ");

    // Format date into a simpler format (e.g., YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Send emails asynchronously
    (async () => {
      const emailPromises = customers.map((customer) =>
        sendEmail({
          email: customer.email,
          subject: `New Event: ${title}`,
          message: `Hello ${customer.name},\n\nWe are excited to announce a new event: ${title} with a discount of ${discount}% on the following items: ${itemNames}.\n\nCategories: ${categoryNames}\n\nEvent Date: ${formattedDate}\n\nDetails:\n${description}\n\nDon't miss out on this offer!\n\nBest regards,\nYour Team`,
        })
      );
      try {
        await Promise.all(emailPromises);
        console.log("Emails sent successfully to all customers.");
      } catch (error) {
        console.error("Error sending emails to customers:", error);
      }
    })();

    res.status(201).json({ message: "Event created successfully!", event: newEvent });
  } catch (error) {
    console.error("- Error creating event:", error);
    res.status(500).json({ message: "Error creating event", error });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("items", "name");
    res.status(200).json(events);
  } catch (error) {
    console.error("- Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event updated successfully!", event: updatedEvent });
  } catch (error) {
    console.error("- Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error });
  }
};

const applyBirthdayDiscount = async (req, res) => {
  try {
    const birthdayCustomers = await User.getBirthdayCustomers();
    const discount = 20; // Default birthday discount percentage

    for (const customer of birthdayCustomers) {
      // Add the discount to the customer's special discounts
      customer.specialDiscounts.push(`Birthday Discount: ${discount}%`);
      await customer.save();

      // Send an email notification
      await sendEmail({
        email: customer.email,
        subject: "Happy Birthday! 🎉",
        message: `Dear ${customer.name},\n\nHappy Birthday! As a token of our appreciation, we're giving you a special ${discount}% discount today. Enjoy your day!\n\nBest regards,\nYour POS Team`,
      });
    }

    res.status(200).json({
      message: `${birthdayCustomers.length} customers received the birthday discount.`,
    });
  } catch (error) {
    console.error("- Error applying birthday discount:", error);
    res.status(500).json({ message: "Error applying birthday discount", error });
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
  getUserById,
  sendMsg,
  createEvent,
  getEvents,
  updateEvent,
  applyBirthdayDiscount,
};
