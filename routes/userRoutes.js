const express = require("express");
const router = express.Router();
const passport = require("passport");
const { loginController, registerController, getCashiers, updateCashier, deleteCashier, getCustomers,getPastOrders,getLoyaltyPoints,generateQrLoginUrl,googleAuth,googleAuthCallback,getUserById } = require("../controllers/userController");

// - Get All Cashiers
router.get("/cashiers", getCashiers);

// - Update Cashier Details
router.put("/cashiers/:id", updateCashier);

// - Delete Cashier
router.delete("/cashiers/:id", deleteCashier);

// - Get All Customers
router.get("/customers", getCustomers);

// - Fetch Orders for a Customer
router.get("/:customerId/orders", getPastOrders);

// - Fetch Customer Loyalty Points
router.get("/:id/loyalty-points", getLoyaltyPoints);

router.get("/:id", getUserById);

// - Login Route
router.post("/login", loginController);

// - Register Route
router.post("/register", registerController);

// - Route to generate QR Code login URL
router.get("/qr-login-url", generateQrLoginUrl);

// - Google Authentication Route
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// - Google Auth Callback Route
router.get("/auth/google/callback", googleAuthCallback);

// - Get Customer by ID
router.get("/customers/:id", getUserById);

module.exports = router;
