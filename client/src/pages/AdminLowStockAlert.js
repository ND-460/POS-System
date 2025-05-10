import React, { useEffect, useState } from "react";
import { Table, Alert } from "antd";
import axios from "axios";

const AdminLowStockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get("/api/items/low-stock");
        setLowStockItems(response.data);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockItems();
  }, []);

  const columns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Low Stock Alert Threshold",
      dataIndex: "lowStockAlert",
      key: "lowStockAlert",
    },
  ];

  return (
    <div>
      <h2>Low Stock Alert</h2>
      <Alert
        message="The following items are low in stock. Please restock them soon."
        type="warning"
        showIcon
        style={{ marginBottom: "20px" }}
      />
      <Table
        dataSource={lowStockItems}
        columns={[
          { title: "Item Name", dataIndex: "name" },
          { title: "Category", dataIndex: "category" },
          { title: "Stock", dataIndex: "stock" },
          { title: "Low Stock Alert Threshold", dataIndex: "lowStockAlert" },
        ]}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 600 }}
        size="small"
      />
    </div>
  );
};

export default AdminLowStockAlert;