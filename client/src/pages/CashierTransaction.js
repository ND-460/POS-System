import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Input, Select, Menu, message } from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;
const { Header, Sider, Content } = Layout;

const CashierTransaction = () => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState("");
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT_USER" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const handleHomeNavigation = () => {
    navigate("/cashier");
  };

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) {
      setCart(savedCart);
    }
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/users/customers");
        setCustomersList(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setTotal(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cart]);

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

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      return removeItem(index);
    }
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const completeTransaction = async () => {
    if (cart.length === 0) {
      message.error("Cart is empty!");
      return;
    }

    setLoading(true);

    try {
      const cashier = JSON.parse(localStorage.getItem("auth"))?.user?._id;
      const transaction = {
        customer: customer || null,
        cashier,
        items: cart.map(({ _id, quantity, price }) => ({
          item: _id,
          quantity,
          price,
        })),
        totalAmount: total,
        paymentMethod,
      };

      const response = await axios.post("http://localhost:8080/api/bills/complete", transaction);

      if (response.status === 201) {
        message.success("Transaction completed!");
        setCart([]);
        localStorage.removeItem("cart");

        // Navigate to the receipt page with the generated bill ID
        navigate(`/receipt/${response.data.billId}`);
      } else {
        message.error("Transaction failed!");
      }
    } catch (error) {
      message.error("Transaction failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Sider theme="dark">
        <div className="logo">Cashier Panel</div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="home" icon={<HomeOutlined />} onClick={handleHomeNavigation}>
            Home
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 10, textAlign: "center" }}>
          <h2>Welcome, {user?.name || "Cashier"}</h2>
        </Header>
        <Content style={{ margin: "16px", padding: "20px", background: "#fff", minHeight: "80vh" }}>
          <h2>Cashier Transaction</h2>
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
            <Option value="loyalty points">Loyalty Points</Option>
            <Option value="UPI">UPI</Option>
          </Select>

          <Button type="primary" onClick={completeTransaction} loading={loading}>
            Complete Transaction
          </Button>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CashierTransaction;
