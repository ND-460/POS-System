import React, { useEffect, useState } from "react";
import { Table, Select, Card, Typography, Layout, Menu, Row, Col, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;
const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const customerId = JSON.parse(localStorage.getItem("auth"))?.user?._id; // Get logged-in user ID

  useEffect(() => {
    fetchOrders();
    fetchLoyaltyPoints();
  }, []);

  // -Fetch Customer's Past Orders
  const fetchOrders = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("auth"));
      const customerId = storedUser?._id; // - Ensure we get customer ID

      if (!customerId) {
        console.error("- Customer ID is missing!");
        message.error("Failed to load orders. Please login again.");
        return;
      }

      console.log(`- Fetching orders for Customer ID: ${customerId}`); // - Debugging

      const { data } = await axios.get(
        `api/users/${customerId}/orders`
      );
      setOrders(data);
    } catch (error) {
      console.error("- Error fetching orders:", error);
      message.error("Failed to load orders");
    }
  };

  // -Fetch Loyalty Points
  const fetchLoyaltyPoints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("auth"));

      if (!user || !user._id) {
        console.error("- No customer ID found in localStorage");
        return;
      }

      console.log(`- Fetching loyalty points for: ${user._id}`);

      const { data } = await axios.get(
        `api/users/${user._id}/loyalty-points`
      );

      setLoyaltyPoints(data.loyaltyPoints);
    } catch (error) {
      console.error("- Error fetching loyalty points:", error);
    }
  };

  // -Handle Sorting
  const handleSort = (value) => {
    setSortOption(value);
    let sortedOrders = [...orders];

    if (value === "newest") {
      sortedOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (value === "oldest") {
      sortedOrders.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (value === "high-to-low") {
      sortedOrders.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (value === "low-to-high") {
      sortedOrders.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    setOrders(sortedOrders);
  };

  // -Handle Filtering
  const handleFilter = (value) => {
    setPaymentFilter(value);
  };

  // -Filtered and Sorted Orders
  const displayedOrders = orders.filter(
    (order) =>
      (paymentFilter === "all" || order.paymentMethod === paymentFilter) &&
      (order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.includes(searchTerm))
  );

  const handleLogout = () => {
    dispatch({ type: "LOGOUT_USER" });
    localStorage.removeItem("auth");
    navigate("/customer-auth");
  };

  const handleHomeNavigation = () => {
    navigate("/customer");
  };

  return (
    <Layout>
      <Sider theme="dark" breakpoint="md" collapsedWidth="0">
        <div className="logo">Customer Panel</div>
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
        <Content style={{ margin: "16px", padding: "20px", background: "#fff", minHeight: "80vh" }}>
          <Title level={2} className="dashboard-header">Customer Dashboard</Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card title="Loyalty Points" className="loyalty-card">
                <Text strong>{loyaltyPoints} Points</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={16}>
              <div className="filters">
                <Select value={sortOption} onChange={handleSort} style={{ width: "100%", marginBottom: "10px" }}>
                  <Option value="newest">Sort: Newest First</Option>
                  <Option value="oldest">Sort: Oldest First</Option>
                  <Option value="high-to-low">Sort: High to Low Amount</Option>
                  <Option value="low-to-high">Sort: Low to High Amount</Option>
                </Select>
                <Select value={paymentFilter} onChange={handleFilter} style={{ width: "100%" }}>
                  <Option value="all">Filter: All Payments</Option>
                  <Option value="cash">Cash</Option>
                  <Option value="cheque">Cheque</Option>
                  <Option value="loyalty points">Loyalty Points</Option>
                  <Option value="UPI">UPI</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <Table
            dataSource={displayedOrders}
            columns={[
              {
                title: "Date",
                dataIndex: "createdAt",
                render: (date) => new Date(date).toLocaleString(),
                responsive: ["xs", "sm", "md", "lg"],
              },
              {
                title: "Total Amount",
                dataIndex: "totalAmount",
                render: (amount) => <span>&#8377;{amount.toFixed(2)}</span>,
                responsive: ["xs", "sm", "md", "lg"],
              },
              { 
                title: "Payment Method", 
                dataIndex: "paymentMethod",
                responsive: ["sm", "md", "lg"],
              },
              {
                title: "Receipt",
                dataIndex: "_id",
                render: (billId) => <Link to={`/receipt/${billId}`}>🧾 View Receipt</Link>,
                responsive: ["xs", "sm", "md", "lg"],
              },
            ]}
            rowKey="_id"
            scroll={{ x: 600 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomerDashboard;
