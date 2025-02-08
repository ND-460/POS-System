const express = require("express");
const router = express.Router();
const { loginController, registerController, getCashiers, updateCashier, deleteCashier, getCustomers } = require("../controllers/userController");

// - Login Route
router.post("/login", loginController);

// - Register Route
router.post("/register", registerController);

// - Get All Cashiers
router.get("/cashiers", getCashiers);

// - Update Cashier Details
router.put("/cashiers/:id", updateCashier);

// - Delete Cashier
router.delete("/cashiers/:id", deleteCashier);

// - Get All Customers
router.get("/customers", getCustomers);

module.exports = router;
