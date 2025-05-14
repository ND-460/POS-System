import React, { useState, useEffect } from "react";
import { Layout, Table, Button, Input, Select, Menu, message } from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

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
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventDiscount, setEventDiscount] = useState(0);

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
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/customers`);
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

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
        const today = moment();
        const active = data.find((event) => moment(event.date).isSame(today, "day"));
        if (active) {
          setActiveEvent(active);
          setEventDiscount(active.discount);
        } else {
          setActiveEvent(null);
          setEventDiscount(0);
        }
      } catch (error) {
        console.error("Error fetching active events:", error);
      }
    };

    fetchActiveEvent();
  }, []);

  const scanBarcode = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/barcode/${barcode}`);
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

  const calculateTotalWithDiscount = () => {
    const baseTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (activeEvent) {
      const discountTotal = cart.reduce((sum, item) => {
        if (
          activeEvent.items.some(eventItem => eventItem === item._id) || 
          activeEvent.categories.some(eventCategory => eventCategory === item.category)
        ) {
          return sum + (item.price * item.quantity * activeEvent.discount) / 100;
        }
        return sum;
      }, 0);

      return baseTotal - discountTotal;
    }

    return baseTotal;
  };

  const completeTransaction = async () => {
    if (cart.length === 0) {
      message.error("Cart is empty!");
      return;
    }

    setLoading(true);

    try {
      const cashier = JSON.parse(localStorage.getItem("auth"))?.user?._id;
      if (!cashier) {
        throw new Error("Cashier ID is missing");
      }

      const transaction = {
        customer: customer || null,
        cashier,
        items: cart.map(({ _id, quantity }) => ({
          item: _id,
          quantity,
        })),
        totalAmount: calculateTotalWithDiscount(),
        paymentMethod,
        taxAmount: calculateTotalWithDiscount() * 0.1, // Example tax calculation
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/bills/complete`, transaction);

      if (response.status === 201) {
        message.success("Transaction completed!");
        setCart([]);
        localStorage.removeItem("cart");
        navigate(`/receipt/${response.data.billId}`);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("- Transaction Error:", error);
      message.error(error.response?.data?.message || "Transaction failed!");
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
        {/* <Header style={{ background: "#fff", padding: 10, textAlign: "center" }}>
          <h2>Welcome, {user?.name || "Cashier"}</h2>
        </Header> */}
        <Content style={{ margin: "16px", padding: "20px", background: "#fff", minHeight: "80vh" }}>
          <h2>Cashier Transaction</h2>
          {activeEvent && (
            <div style={{ marginBottom: "10px", color: "green" }}>
              <strong>Active Event:</strong> {activeEvent.title} - {activeEvent.discount}% Discount
            </div>
          )}
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

          <h3>Total: <span>&#8377;</span>{calculateTotalWithDiscount().toFixed(2)}</h3>
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
