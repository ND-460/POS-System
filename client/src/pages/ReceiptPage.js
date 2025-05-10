import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, message } from "antd";
import axios from "axios";
import "../styles/InvoiceStyles.css";

const ReceiptPage = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) {
        message.error("Invalid bill ID. Unable to fetch receipt.");
        return;
      }

      try {
        console.log(`- Fetching bill with ID: ${billId}`);
        const { data } = await axios.get(`/api/bills/${billId}`);
        if (!data || !data.items || data.items.length === 0) {
          throw new Error("Incomplete bill data");
        }
        console.log("- Bill Fetched:", data);

        // Ensure customerName is set correctly
        if (!data.customerName && data.customer) {
          data.customerName = data.customer.name || "Guest";
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

  if (loading) return <Spin size="large" className="loading-spinner" />;

  // Calculate total savings from both item and event discounts
  const totalSavings = bill?.items?.reduce((sum, item) => {
    const itemDiscountAmount = (item.originalPrice * (item.price.discount || 0)) / 100;
    const eventDiscountAmount = bill.event ? (item.originalPrice * bill.event.discount) / 100 : 0;
    return sum + itemDiscountAmount + eventDiscountAmount;
  }, 0) || 0;

  return (
    <div className="receipt-container">
      <h2 className="receipt-header">🧾 Receipt</h2>

      {/* Header Information */}
      <div className="receipt-info">
        <span><strong>Bill ID:</strong> {bill?._id || "N/A"}</span>
        <span><strong>Date:</strong> {bill?.createdAt ? new Date(bill.createdAt).toLocaleString() : "N/A"}</span>
      </div>
      <div className="receipt-info">
        <span><strong>Cashier:</strong> {bill?.cashierName || "Unknown"}</span>
        <span><strong>Customer:</strong> {bill?.customerName || "Guest"}</span>
      </div>

      {/* Event Information */}
      {bill?.event && (
        <div className="event-info">
          <h3>🎉 Special Event: {bill.event.title}</h3>
          <p>Event Discount: {bill.event.discount}% on eligible items</p>
        </div>
      )}

      {/* Items Table */}
      <table className="receipt-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price/Unit</th>
            <th>Original</th>
            <th>Item Discount</th>
            <th>Event Discount</th>
            <th>Final Price</th>
          </tr>
        </thead>
        <tbody>
          {bill?.items?.map((item, index) => {
            const originalPrice = item.price * item.quantity;
            const itemDiscount = item.itemDiscount || 0; // Ensure item discount is not null
            const eventDiscount = item.eventDiscount || 0; // Ensure event discount is not null

            const itemDiscountAmount = (originalPrice * itemDiscount) / 100; // Correct item discount calculation
            const priceAfterItemDiscount = originalPrice - itemDiscountAmount; // Price after applying item discount
            const eventDiscountAmount = (priceAfterItemDiscount * eventDiscount) / 100; // Apply event discount after item discount
            const finalPrice = priceAfterItemDiscount - eventDiscountAmount;

            return (
              <tr key={index}>
                <td>{item?.itemName || "Unknown Item"}</td>
                <td>{item?.quantity || 0}</td>
                <td>₹{(item?.price || 0).toFixed(2)}</td>
                <td>₹{originalPrice.toFixed(2)}</td>
                <td className={itemDiscount > 0 ? "discount-cell" : ""}>
                  {itemDiscount > 0 ? (
                    <>
                      {itemDiscount}%
                      <br />
                      <span className="savings-amount">-₹{itemDiscountAmount.toFixed(2)}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={eventDiscount > 0 ? "discount-cell" : ""}>
                  {eventDiscount > 0 ? (
                    <>
                      {eventDiscount}%
                      <br />
                      <span className="savings-amount">-₹{eventDiscountAmount.toFixed(2)}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td>₹{finalPrice.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="receipt-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{bill?.totalAmount?.toFixed(2) || "0.00"}</span>
        </div>
        {bill?.taxAmount > 0 && (
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{bill?.taxAmount?.toFixed(2)}</span>
          </div>
        )}
        {totalSavings > 0 && (
          <div className="summary-row savings">
            <span>Total Savings:</span>
            <span>₹{totalSavings.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Final Total:</span>
          <span>₹{((bill?.totalAmount || 0) + (bill?.taxAmount || 0)).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Information */}
      <div className="payment-info">
        <p><strong>Payment Method:</strong> {bill?.paymentMethod || "N/A"}</p>
        {bill?.loyaltyPointsUsed > 0 && (
          <p><strong>Loyalty Points Used:</strong> {bill.loyaltyPointsUsed}</p>
        )}
        <p>
          <strong>Loyalty Points Earned:</strong>{" "}
          {bill?.items?.reduce((sum, item) => sum + (item?.loyaltyPoints || 0), 0)} pts
        </p>
      </div>

      {/* Action Buttons */}
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
