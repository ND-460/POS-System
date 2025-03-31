import React, { useState, useEffect } from "react";
import { Table, Button, Input, Select, message } from "antd";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const CashierTransaction = () => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState(""); // -Customer field
  const [customersList, setCustomersList] = useState([]); // -List of customers
  const [loading, setLoading] = useState(false); // -Added loading state

  const navigate = useNavigate(); // -Initialize navigation

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) {
      setCart(savedCart);
    }
  }, []);

  // Fetch customers for selection
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/users/customers");
        setCustomersList(data);
      } catch (error) {
        console.error("- Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  // Save cart to localStorage whenever cart updates
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setTotal(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cart]);

  // Scan barcode to fetch item
  const scanBarcode = async () => {
    try {
      const { data } = await axios.get(`http://localhost:8080/api/items/barcode/${barcode}`);

      const existingItem = cart.find((item) => item._id === data._id);
      if (existingItem) {
        existingItem.quantity += 1;
        setCart([...cart]);
      } else {
        setCart([...cart, { ...data, quantity: 1 }]);
      }

      setBarcode("");
    } catch (error) {
      message.error("Item not found");
    }
  };

  // Update item quantity
  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      return removeItem(index);
    }
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
  };

  // Remove item from cart
  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Fetch receipt after transaction
  const fetchReceipt = async (billId) => {
    try {
      console.log(`- Fetching receipt for Bill ID: ${billId}`);
      const { data } = await axios.get(`http://localhost:8080/api/bills/${billId}`);

      console.log("-Receipt Data:", data);
      navigate(`/receipt/${billId}`); // -Redirect to receipt page
    } catch (error) {
      console.error("- Error fetching receipt:", error.response?.data || error.message);
      message.error("Error fetching receipt.");
    }
  };

  // Complete transaction
  const completeTransaction = async () => {
    if (cart.length === 0) {
      message.error("Cart is empty!");
      return;
    }

    // Validate quantities in the cart
    for (const item of cart) {
      if (isNaN(item.quantity) || item.quantity <= 0) {
        message.error(`Invalid quantity for item: ${item.name}`);
        return;
      }
    }

    setLoading(true);

    try {
      const cashier = JSON.parse(localStorage.getItem("auth"))?.user?._id;
      const cashierName = JSON.parse(localStorage.getItem("auth"))?.user?.name || "Unknown";
      const selectedCustomer = customersList.find((cust) => cust._id === customer);

      const transaction = {
        customer: customer || null,
        customerName: selectedCustomer ? selectedCustomer.name : "Guest",
        cashier,
        cashierName,
        items: cart.map(({ _id, name, quantity, price, discount, loyaltyPoints }) => ({
          item: _id,
          itemName: name,
          quantity,
          price,
          discount,
          loyaltyPoints, // Include loyalty points
        })),
        totalAmount: total,
        taxAmount: 0,
        paymentMethod,
      };

      console.log("📤 Sending Transaction Data:", transaction);

      const response = await axios.post("http://localhost:8080/api/bills/complete", transaction);

      if (response.status === 201 && response.data.bill?._id) {
        message.success("Transaction completed!");
        setCart([]);
        localStorage.removeItem("cart");

        console.log(`🔄 Fetching receipt for Bill ID: ${response.data.bill._id}`);
        await fetchReceipt(response.data.bill._id);
      } else {
        message.error("Transaction completed, but receipt not found.");
      }
    } catch (error) {
      console.error("- Transaction Error:", error.response?.data || error.message);
      message.error("Transaction failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <h2>Cashier Transaction</h2>

      {/* -Customer Selection */}
      <Select
        showSearch
        allowClear
        placeholder="Select Customer (Optional)"
        value={customer}
        onChange={setCustomer}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        {customersList.map((cust) => (
          <Option key={cust._id} value={cust._id}>
            {cust.name} ({cust.mobile})
          </Option>
        ))}
      </Select>

      <Input
        placeholder="Scan Barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onPressEnter={scanBarcode}
      />

      <Table
        dataSource={cart}
        columns={[
          { title: "Item", dataIndex: "name" },
          { title: "Price", dataIndex: "price" },
          {
            title: "Quantity",
            render: (_, record, index) => (
              <Input
                type="number"
                value={record.quantity}
                min={1}
                onChange={(e) => updateQuantity(index, Number(e.target.value))}
                style={{ width: "60px" }}
              />
            ),
          },
          {
            title: "Action",
            render: (_, record, index) => (
              <Button type="danger" onClick={() => removeItem(index)}>
                Remove
              </Button>
            ),
          },
        ]}
        rowKey="_id"
      />

      <h3>Total: ${total.toFixed(2)}</h3>
      <Select value={paymentMethod} onChange={setPaymentMethod} style={{ marginBottom: "10px" }}>
        <Option value="cash">Cash</Option>
        {/* <Option value="cheque">Cheque</Option> */}
        <Option value="loyalty points">Loyalty Points</Option>
        <Option value="UPI">UPI</Option>
      </Select>

      <Button type="primary" onClick={completeTransaction} loading={loading}>
        Complete Transaction
      </Button>
    </DefaultLayout>
  );
};

export default CashierTransaction;
