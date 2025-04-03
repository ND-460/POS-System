import React, { useEffect, useState } from "react";
import { Table, DatePicker, Button, Space } from "antd";
import axios from "axios";
import moment from "moment";
import CategorySalesChart from "../components/CategorySalesChart"; // Import the pie chart component
import MostSoldItemsChart from "../components/MostSoldItemsChart"; // Import the bar chart component
import MonthlyRevenueChart from "../components/MonthlyRevenueChart"; // Import the new chart component

const { RangePicker } = DatePicker;

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [inventoryReports, setInventoryReports] = useState([]);
  const [activeReport, setActiveReport] = useState("sales"); // Track active report type

  const fetchReports = async (pagination, filters, sorter = {}) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/reports", {
        params: {
          startDate: dateRange[0] ? dateRange[0].toISOString() : null,
          endDate: dateRange[1] ? dateRange[1].toISOString() : null,
          sortBy: sorter.field || "createdAt",
          order: sorter.order === "ascend" ? "asc" : "desc",
        },
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/reports/inventory");
      setInventoryReports(response.data);
    } catch (error) {
      console.error("Error fetching inventory reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  useEffect(() => {
    fetchInventoryReports();
  }, []);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("YYYY-MM-DD"),
      sorter: true,
    },
    {
      title: "Cashier",
      dataIndex: "cashierName",
      key: "cashierName",
      sorter: true,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => text || "Guest",
      sorter: true,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `₹${amount.toFixed(2)}`,
      sorter: true,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      sorter: true,
    },
  ];

  const inventoryColumns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Last Updated",
      dataIndex: "inventoryUpdated",
      key: "inventoryUpdated",
      render: (text) => {
        console.log("Rendering Last Updated:", text); // Log the value being rendered
        return text ? moment(text).format("YYYY-MM-DD HH:mm") : "Never";
      },
    },
  ];

  return (
    <div>
      <h2>Reports</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type={activeReport === "sales" ? "primary" : "default"}
          onClick={() => setActiveReport("sales")}
        >
          Sales Report
        </Button>
        <Button
          type={activeReport === "inventory" ? "primary" : "default"}
          onClick={() => setActiveReport("inventory")}
        >
          Inventory Report
        </Button>
        <Button
          type={activeReport === "charts" ? "primary" : "default"}
          onClick={() => setActiveReport("charts")}
        >
          Charts
        </Button>
      </Space>
      {activeReport === "sales" && (
        <>
          <RangePicker
            style={{ marginBottom: 16 }}
            onChange={(dates) => setDateRange(dates)}
          />
          <Button
            type="primary"
            onClick={() => fetchReports()}
            loading={loading}
            style={{ marginLeft: 8 }}
          >
            Refresh
          </Button>
          <Table
            dataSource={reports}
            columns={columns}
            rowKey="_id"
            loading={loading}
            style={{ marginTop: 16 }}
            onChange={(pagination, filters, sorter) => {
              fetchReports(pagination, filters, sorter);
            }}
          />
        </>
      )}
      {activeReport === "inventory" && (
        <Table
          dataSource={inventoryReports}
          columns={inventoryColumns}
          rowKey="_id"
          loading={loading}
          style={{ marginTop: 16 }}
        />
      )}
      {activeReport === "charts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
            <div style={{ flex: 1, maxWidth: "45%", height: "400px" }}>
              <CategorySalesChart />
            </div>
            <div style={{ flex: 1, maxWidth: "45%", height: "400px" }}>
              <MostSoldItemsChart />
            </div>
          </div>
          <div style={{ height: "400px", marginTop: "20px" }}>
            <MonthlyRevenueChart />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
