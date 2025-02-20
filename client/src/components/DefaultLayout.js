import React from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
  CopyOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

const { Header, Sider, Content } = Layout;

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Get logged-in user

  const handleLogout = () => {
    dispatch({ type: "LOGOUT_USER" }); // -Clear Redux State
    localStorage.removeItem("auth"); // -Clear Local Storage
    navigate("/login"); // -Redirect to Login
  };
  console.log("DefaultLayout Loaded");

  return (
    <Layout>
      <Sider theme="dark">
        <div className="logo">
          <h1 className="text-center text-light font-weight-bold mt-4">POS</h1>
        </div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="/" icon={<HomeOutlined />} onClick={() => navigate("/")}>
            Home
          </Menu.Item>
          {/* {user?.role === "admin" && (
            <Menu.Item key="/admin" icon={<UnorderedListOutlined />} onClick={() => navigate("/admin")}>
              Admin Dashboard
            </Menu.Item>
          )}
          {user?.role === "cashier" && (
            <Menu.Item key="/cashier" icon={<CopyOutlined />} onClick={() => navigate("/cashier")}>
              Cashier Transactions
            </Menu.Item>
          )} */}
          {/* <Menu.Item key="/customers" icon={<UserOutlined />} onClick={() => navigate("/customers")}>
            Customers
          </Menu.Item> */}
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 10, textAlign: "center" }}>
          <h2>Welcome, {user?.name || "User"}</h2>
        </Header>
        <Content style={{ margin: "16px", padding: "20px", background: "#fff", minHeight: "80vh" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
