import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AdminManageItems from "./AdminManageItem";
import AdminManageCategories from "./AdminManageCategories";
import AdminManageCashiers from "./AdminManageCashiers";
import DefaultLayout from "../components/DefaultLayout";

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("items");

  return (
    <DefaultLayout>
      <Layout>
        <Sider collapsible>
          <div className="logo">Admin Panel</div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["items"]}
            onClick={({ key }) => setSelectedSection(key)}
          >
            <Menu.Item key="items" icon={<UnorderedListOutlined />}>
              Manage Items
            </Menu.Item>
            <Menu.Item key="categories" icon={<AppstoreOutlined />}>
              Manage Categories
            </Menu.Item>
            <Menu.Item key="cashiers" icon={<UserOutlined />}>
              Manage Cashiers
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          <Header style={{ background: "#fff", padding: 10, textAlign: "center" }}>
            <h2>Admin Dashboard</h2>
          </Header>
          <Content style={{ margin: "16px", padding: "20px", background: "#fff", minHeight: "80vh" }}>
            {selectedSection === "items" && <AdminManageItems />}
            {selectedSection === "categories" && <AdminManageCategories />}
            {selectedSection === "cashiers" && <AdminManageCashiers />}
          </Content>
        </Layout>
      </Layout>
    </DefaultLayout>
  );
};

export default AdminDashboard;
