import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, message } from "antd";
import axios from "axios";
import "../styles/InvoiceStyles.css";

const ReceiptPage = () => {
  const { billId } = useParams(); // -Get Bill ID from URL
  const navigate = useNavigate(); // -For revert back button
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) {
        message.error("Invalid bill ID. Unable to fetch receipt.");
        return;
      }

      try {
        console.log(`-Fetching bill with ID: ${billId}`);
        const { data } = await axios.get(`http://localhost:8080/api/bills/${billId}`);
        console.log("-Bill Fetched:", data);

        // Ensure customerName is set correctly
        if (!data.customerName && data.customer) {
          try {
            const customerResponse = await axios.get(`http://localhost:8080/api/users/customers/${data.customer}`);
            data.customerName = customerResponse.data?.name || "Guest";
          } catch (error) {
            console.warn("- Customer not found, defaulting to Guest");
            data.customerName = "Guest"; // Fallback to Guest if customer is not found
          }
        }

        setBill(data);
      } catch (error) {
        console.error("- Error fetching bill:", error);
        message.error("Error fetching receipt. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  useEffect(() => {
    if (bill && bill._id !== "N/A" && bill.items?.length > 0) {
      console.log("🖨 Printing Receipt...");
      setTimeout(() => window.print(), 1000);
    } else if (bill && bill._id === "N/A") {
      message.warning("Receipt data is incomplete. Unable to print.");
    }
  }, [bill]);

  // Add a function to explicitly trigger receipt generation after transaction completion
  const handleTransactionComplete = (billId) => {
    message.success("Transaction completed!");
    setTimeout(() => {
      navigate(`/receipt/${billId}`); // Redirect to the receipt page
    }, 500); // Delay to ensure the message is visible
  };

  if (loading) return <Spin size="large" className="loading-spinner" />;

  return (
    <div className="receipt-container">
      <h2 className="receipt-header">🧾 Receipt</h2>

      <div className="receipt-info">
        <span><strong>Bill ID:</strong> {bill?._id || "N/A"}</span>
        <span><strong>Date:</strong> {bill?.createdAt ? new Date(bill.createdAt).toLocaleString() : "N/A"}</span>
      </div>
      <div className="receipt-info">
        <span><strong>Cashier:</strong> {bill?.cashierName || "Unknown"}</span> {/* Use cashierName */}
        <span><strong>Customer:</strong> {bill?.customerName || "Guest"}</span>
      </div>

      <table className="receipt-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Original Price</th>
            <th>Discounted Price</th>
            <th>Subtotal</th>
            <th>Loyalty Points</th>
          </tr>
        </thead>
        <tbody>
          {bill?.items?.map((item, index) => (
            <tr key={index}>
              <td>{item?.itemName || "Unknown Item"}</td>
              <td>{item?.quantity || 0}</td>
              <td><span>&#8377;</span>{(item?.originalPrice || 0).toFixed(2)}</td> {/* Display original price */}
              <td><span>&#8377;</span>{(item?.discountedPrice || 0).toFixed(2)}</td> {/* Display discounted price */}
              <td><span>&#8377;</span>{(item?.subtotal || 0).toFixed(2)}</td> {/* Display subtotal */}
              <td>{item?.loyaltyPoints || 0} pts</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-section">
        <strong>Total: <span>&#8377;</span>{bill?.totalAmount?.toFixed(2) || "0.00"}</strong> {/* Display correct total */}
      </div>
      {bill?.eventTitle && (
        <p>
          <strong>Event Applied:</strong> {bill.eventTitle} ({bill.eventDiscount}% Discount)
        </p>
      )}
      <div className="total-section">
        <strong>Total After Discount: <span>&#8377;</span>{bill?.totalAmount?.toFixed(2) || "0.00"}</strong>
      </div>
      <p><strong>Payment Method:</strong> {bill?.paymentMethod || "N/A"}</p>
      <p>
        <strong>Loyalty Points Earned:</strong>{" "}
        {bill?.items?.reduce((sum, item) => sum + (item?.loyaltyPoints || 0), 0)} pts
      </p> {/* Calculate total loyalty points */}
      <p>
        <strong>Loyalty Points Used:</strong>{" "}
        {bill?.paymentMethod === "loyalty points" ? bill?.totalAmount : 0}
      </p>

      <div className="button-container">
        <Button type="primary" onClick={() => window.print()}>🖨 Print Again</Button>
            <Button danger onClick={() => {
      const user = JSON.parse(localStorage.getItem("auth"));
      const redirectPath = user?.role === "customer" ? "/customer" : "/cashier";
      navigate(redirectPath);
    }}>
      🔙 Revert Back
    </Button>

      </div>
    </div>
  );
};

export default ReceiptPage;
