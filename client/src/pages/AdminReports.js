import React, { useEffect, useState } from "react";
import { Table, DatePicker, Button, Space } from "antd";
import axios from "axios";
import moment from "moment";
import CategorySalesChart from "../components/CategorySalesChart"; // Import the pie chart component
import MostSoldItemsChart from "../components/MostSoldItemsChart"; // Import the bar chart component
import MonthlyRevenueChart from "../components/MonthlyRevenueChart"; // Import the new chart component
import { render } from "react-dom";
import Barcode from "react-barcode"; // Import react-barcode

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
      const formattedData = response.data.map((item) => ({
        ...item,
        barcode: item.barcode || null, // Ensure barcode is included, set to null if missing
      }));
      console.log("Fetched Inventory Reports:", formattedData); // Log the fetched data for debugging
      setInventoryReports(formattedData);
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
        console.log("Rendering Last Updated:", text); 
        return text ? moment(text).format("YYYY-MM-DD HH:mm") : "Never";
      },
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      render: (text) => {
        console.log("Rendering Barcode:", text); 
        return text ? (
          <div>
            <Barcode value={text} width={1} height={50} fontSize={12} />
            {/* <div style={{ marginTop: "5px", fontSize: "12px", textAlign: "center" }}>{text}</div> */}
          </div>
        ) : "N/A";
      },
    },
  ];

  return (
    <div>
      <h2>Reports</h2>
      <Space
        style={{
          marginBottom: 16,
          flexWrap: "wrap", // Allow wrapping for responsiveness
          gap: "8px", // Add spacing between buttons
        }}
      >
        <Button
          type={activeReport === "sales" ? "primary" : "default"}
          onClick={() => setActiveReport("sales")}
        >
          Sales Transactions
        </Button>
        <Button
          type={activeReport === "inventory" ? "primary" : "default"}
          onClick={() => setActiveReport("inventory")}
        >
          Inventory Modification
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
          <Space
            style={{
              marginBottom: 16,
              flexWrap: "wrap", // Allow wrapping for responsiveness
              gap: "8px", // Add spacing between elements
            }}
          >
            <RangePicker
              style={{ flex: "1 1 auto", minWidth: "250px" }} // Adjust width for responsiveness
              onChange={(dates) => setDateRange(dates)}
            />
            <Button
              type="primary"
              onClick={() => fetchReports()}
              loading={loading}
              style={{ flex: "0 0 auto" }} // Prevent button from stretching
            >
              Refresh
            </Button>
          </Space>
          <Table
            dataSource={reports}
            columns={[
              { title: "Date", dataIndex: "createdAt", render: (text) => moment(text).format("YYYY-MM-DD") },
              { title: "Cashier", dataIndex: "cashierName" },
              { title: "Customer", dataIndex: "customerName", render: (text) => text || "Guest" },
              { title: "Total Amount", dataIndex: "totalAmount", render: (amount) => `₹${amount.toFixed(2)}` },
              { title: "Payment Method", dataIndex: "paymentMethod" },
            ]}
            rowKey="_id"
            size="small"
            scroll={{ x: 600 }}
            loading={loading}
            style={{ marginTop: 16 }}
            onChange={(pagination, filters, sorter) => {
              fetchReports(pagination, filters, sorter);
            }}
          />
        </>
      )}
      {activeReport === "inventory" && (
        <div style={{ overflowX: "auto" }}> {/* Add horizontal scrolling */}
          <Table
            dataSource={inventoryReports}
            columns={inventoryColumns}
            rowKey="_id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }} // Enable horizontal scrolling for the table
            style={{ marginTop: 16 }}
          />
        </div>
      )}
      {activeReport === "charts" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // Allow wrapping for responsiveness
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div
              style={{
                flex: "1 1 100%",
                maxWidth: "100%",
                height: "400px",
                minWidth: "300px", // Ensure minimum width for smaller screens
              }}
            >
              <CategorySalesChart />
            </div>
            <div
              style={{
                flex: "1 1 100%",
                maxWidth: "100%",
                height: "400px",
                minWidth: "300px", // Ensure minimum width for smaller screens
              }}
            >
              <MostSoldItemsChart />
            </div>
          </div>
          <div
            style={{
              height: "400px",
              marginTop: "20px",
              minWidth: "300px", // Ensure minimum width for smaller screens
            }}
          >
            <MonthlyRevenueChart />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
