import React, { useEffect, useState } from "react";
import { Table, InputNumber, Button } from "antd";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) setCart(savedCart);
  }, []);

  // Update cart in localStorage when modified
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Update item quantity
  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeItem(index);
    } else {
      const newCart = [...cart];
      newCart[index].quantity = quantity;
      setCart(newCart);
    }
  };

  // Remove item from cart
  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Cart Page</h2>

      <Table
        dataSource={cart}
        columns={[
          { title: "Item", dataIndex: "name" },
          { title: "Price", dataIndex: "price" },
          {
            title: "Quantity",
            render: (_, record, index) => (
              <InputNumber
                min={1}
                value={record.quantity}
                onChange={(value) => updateQuantity(index, value)}
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

      <h3>
        Total: $
        {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
      </h3>

      <Button type="primary" onClick={() => navigate("/cashier")}>
        Back to Cashier
      </Button>
    </div>
  );
};

export default CartPage;
