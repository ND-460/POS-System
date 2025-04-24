import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined, 
  AlertOutlined,
  MessageOutlined
} from "@ant-design/icons";
import AdminManageItems from "./AdminManageItem";
import AdminManageCategories from "./AdminManageCategories";
import AdminManageCashiers from "./AdminManageCashiers";
import AdminReports from "./AdminReports";
import AdminLowStockAlert from "./AdminLowStockAlert";  
import AdminEventAlert from "./AdminEventAlert";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("items");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT_USER" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const handleHomeNavigation = () => {
    if (user?.role === "admin") {
      setSelectedSection("items"); // Default section for admin
    } else if (user?.role === "cashier") {
      navigate("/cashier"); // Redirect to cashier dashboard
    } else {
      navigate("/login"); // Redirect to login if role is undefined
    }
  };

  return (
    <Layout>
      <Sider collapsible>
        <div className="logo">Admin Panel</div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["items"]}
          onClick={({ key }) => {
            if (key === "home") {
              handleHomeNavigation();
            } else {
              setSelectedSection(key);
            }
          }}
        >
          {/* <Menu.Item key="home" icon={<HomeOutlined />}>
            Home
          </Menu.Item> */}
          <Menu.Item key="items" icon={<UnorderedListOutlined />}>
            Manage Items
          </Menu.Item>
          <Menu.Item key="categories" icon={<AppstoreOutlined />}>
            Manage Categories
          </Menu.Item>
          <Menu.Item key="cashiers" icon={<UserOutlined />}>
            Manage Cashiers
          </Menu.Item>
          <Menu.Item key="reports" icon={<AppstoreOutlined />}>
            Reports
          </Menu.Item>
          <Menu.Item key="lowstock" icon={<AlertOutlined />}>
            Low Stock Alerts
          </Menu.Item>
          <Menu.Item key="EventsMessage" icon={<MessageOutlined />}>
            Message
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      {/* <Layout> */}
        {/* <Header style={{ background: "#fff", padding: 10, textAlign: "center" }}>
          <h2>Welcome, {user?.name || "Admin"}</h2>
        </Header> */}
        <Content style={{ margin: "16px", padding: "20px", background: "#fff", minHeight: "80vh" }}>
          {selectedSection === "items" && <AdminManageItems />}
          {selectedSection === "categories" && <AdminManageCategories />}
          {selectedSection === "cashiers" && <AdminManageCashiers />}
          {selectedSection === "reports" && <AdminReports />}
          {selectedSection === "lowstock" && <AdminLowStockAlert />}
          {selectedSection === "EventsMessage" && <AdminEventAlert />}
        </Content>
      {/* </Layout> */}
    </Layout>
  );
};

export default AdminDashboard;
