import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import CustomerAuth from "./pages/CustomerAuth"; // New Customer Login/Register Page
import AdminDashboard from "./pages/AdminDashboard";
import CashierTransaction from "./pages/CashierTransaction";
import CustomerDashboard from "./pages/CustomerDashboard";
import ReceiptPage from "./pages/ReceiptPage";
import CustomerHome from "./pages/CustomerHome";

const App = () => {
  const storedUser = JSON.parse(localStorage.getItem("auth")); // - Get user from localStorage
const user = useSelector((state) => state.auth.user) || storedUser; // - Fallback to localStorage user

return (
  <Router>
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/qr-login" element={<CustomerAuth />} />
      <Route path="/customer-auth" element={<CustomerAuth />} />
      <Route path="/receipt/:billId" element={<ReceiptPage />} />

      {user ? (
        <>
          <Route path="/" element={<Navigate to={user.role === "admin" ? "/admin" : user.role === "customer" ? "/customer" : "/cashier"} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/cashier" element={<CashierTransaction />} />
          <Route path="/customer" element={<CustomerDashboard />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/customer-auth" />} />
      )}
    </Routes>
  </Router>
);


};

export default App;
