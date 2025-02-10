import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CashierTransaction from "./pages/CashierTransaction";
// import CartPage from "./pages/CartPage";
import ReceiptPage from "./pages/ReceiptPage";



const App = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        {/* <Route path="/cart" element={<CartPage />} /> */}
        <Route path="/receipt/:billId" element={<ReceiptPage />} />
        {user ? (
          <>
            <Route path="/" element={<Navigate to={user.role === "admin" ? "/admin" : "/cashier"} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cashier" element={<CashierTransaction />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
