import React, { useEffect, useState } from "react";
import { Table, DatePicker, Button, Space } from "antd";
import axios from "axios";
import moment from "moment";
import CategorySalesChart from "../components/CategorySalesChart"; // Import the pie chart component
import MostSoldItemsChart from "../components/MostSoldItemsChart"; // Import the bar chart component
import MonthlyRevenueChart from "../components/MonthlyRevenueChart"; // Import the new chart component
import Barcode from "react-barcode"; // Import react-barcode
import "jspdf-autotable"; // Import autotable plugin for tables
import html2pdf from "html2pdf.js"; // Import html2pdf.js
import html2canvas from "html2canvas"; // Import html2canvas
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
        ) : (
          "N/A"
        );
      },
    },
  ];

  const downloadExcel = async () => {
    const ExcelJS = (await import("exceljs")).default; // Dynamically import exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reports");

    if (activeReport === "sales") {
      worksheet.columns = [
        { header: "Date", key: "createdAt", width: 15 },
        { header: "Cashier", key: "cashierName", width: 20 },
        { header: "Customer", key: "customerName", width: 20 },
        { header: "Total Amount", key: "totalAmount", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 20 },
      ];
      reports.forEach((report) => {
        worksheet.addRow({
          createdAt: moment(report.createdAt).format("YYYY-MM-DD"),
          cashierName: report.cashierName,
          customerName: report.customerName || "Guest",
          totalAmount: `₹${report.totalAmount.toFixed(2)}`,
          paymentMethod: report.paymentMethod,
        });
      });
    } else if (activeReport === "inventory") {
      worksheet.columns = [
        { header: "Item Name", key: "name", width: 20 },
        { header: "Stock", key: "stock", width: 10 },
        { header: "Last Updated", key: "inventoryUpdated", width: 20 },
        { header: "Barcode", key: "barcode", width: 20 },
      ];
      inventoryReports.forEach((item) => {
        worksheet.addRow({
          name: item.name,
          stock: item.stock,
          inventoryUpdated: item.inventoryUpdated
            ? moment(item.inventoryUpdated).format("YYYY-MM-DD HH:mm")
            : "Never",
          barcode: item.barcode || "N/A",
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeReport}-report.xlsx`;
    link.click();
  };

  const downloadPDF = () => {
    const element = document.createElement("div");
    const title =
      activeReport === "sales"
        ? "Sales Transactions Report"
        : "Inventory Modification Report";

    // Add a styled title
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-family: Arial, sans-serif; color: #333;">${title}</h2>
      </div>
    `;

    // Add a styled table
    if (activeReport === "sales") {
      const table = `
        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; color: #333;">
          <thead>
            <tr style="background-color: #f2f2f2; text-align: left;">
              <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Cashier</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Customer</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Total Amount</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            ${reports
              .map(
                (report) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${moment(
                  report.createdAt
                ).format("YYYY-MM-DD")}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  report.cashierName
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  report.customerName || "Guest"
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd;">₹${report.totalAmount.toFixed(
                  2
                )}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  report.paymentMethod
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
      element.innerHTML += table;
    } else if (activeReport === "inventory") {
      const table = `
        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; color: #333;">
          <thead>
            <tr style="background-color: #f2f2f2; text-align: left;">
              <th style="padding: 8px; border: 1px solid #ddd;">Item Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Stock</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Last Updated</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Barcode</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryReports
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  item.name
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  item.stock
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  item.inventoryUpdated
                    ? moment(item.inventoryUpdated).format("YYYY-MM-DD HH:mm")
                    : "Never"
                }</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${
                  item.barcode || "N/A"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
      element.innerHTML += table;
    }

    const options = {
      margin: 1,
      filename: `${activeReport}-report.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  const downloadChartsPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-family: Arial, sans-serif; color: #333;">Charts Report</h2>
      </div>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;"> <!-- Use flex-wrap for layout -->
      </div>
    `;

    const charts = [
      { id: "category-sales-chart", title: "Category Sales Chart" },
      { id: "most-sold-items-chart", title: "Most Sold Items Chart" },
      {
        id: "monthly-revenue-chart",
        title: "Monthly Revenue Chart",
        pageBreak: true,
      }, // Add pageBreak flag for the last chart
    ];

    const flexContainer = element.querySelector("div:last-child"); // Select the flex container for charts

    const promises = charts.map((chart) => {
      const chartElement = document.getElementById(chart.id);
      if (chartElement) {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Add a delay of 3000ms
            html2canvas(chartElement).then((canvas) => {
              const imgData = canvas.toDataURL("image/png");
              const chartDiv = document.createElement("div");
              chartDiv.style.textAlign = "center";
              chartDiv.style.flex = "1 1 100%"; // Ensure charts fit within one page
              chartDiv.style.maxWidth = "100%";
              chartDiv.style.marginBottom = "20px";
              chartDiv.innerHTML = `
                <h3 style="font-family: Arial, sans-serif; color: #333; margin-bottom: 10px;">${chart.title}</h3>
                <img src="${imgData}" style="width: 100%; max-width: 600px;" /> <!-- Increase max-width for larger images -->
              `;
              if (chart.pageBreak) {
                chartDiv.style.pageBreakBefore = "always"; // Add page break for the last chart
              }
              flexContainer.appendChild(chartDiv);
              resolve();
            });
          }, 3000); // Delay of 3000ms
        });
      }
      return Promise.resolve();
    });

    Promise.all(promises).then(() => {
      const options = {
        margin: 0.5,
        filename: "charts-report.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().set(options).from(element).save();
    });
  };

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
        {activeReport !== "charts" && (
          <>
            <Button onClick={downloadExcel}>Download Excel</Button>
            <Button onClick={downloadPDF}>Download PDF</Button>
          </>
        )}
        {activeReport === "charts" && (
          <>
            <Button onClick={downloadChartsPDF}>Download Charts PDF</Button>
          </>
        )}
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
              {
                title: "Date",
                dataIndex: "createdAt",
                render: (text) => moment(text).format("YYYY-MM-DD"),
              },
              { title: "Cashier", dataIndex: "cashierName" },
              {
                title: "Customer",
                dataIndex: "customerName",
                render: (text) => text || "Guest",
              },
              {
                title: "Total Amount",
                dataIndex: "totalAmount",
                render: (amount) => `₹${amount.toFixed(2)}`,
              },
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
        <div style={{ overflowX: "auto" }}>
          {" "}
          {/* Add horizontal scrolling */}
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
            alignItems: "center", // Center align the entire chart section
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // Allow wrapping for responsiveness
              justifyContent: "center", // Center align charts in the row
              gap: "20px",
              width: "100%", // Ensure full width for proper alignment
            }}
          >
            <div
              id="category-sales-chart"
              style={{
                flex: "1 1 45%", // Adjust width for better alignment
                maxWidth: "45%",
                height: "400px",
                minWidth: "300px", // Ensure minimum width for smaller screens
              }}
            >
              <CategorySalesChart />
            </div>
            <div
              id="most-sold-items-chart"
              style={{
                flex: "1 1 45%", // Adjust width for better alignment
                maxWidth: "45%",
                height: "400px",
                minWidth: "300px", // Ensure minimum width for smaller screens
              }}
            >
              <MostSoldItemsChart />
            </div>
          </div>
          <div
            id="monthly-revenue-chart"
            style={{
              width: "90%", // Center align and limit width for the larger chart
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
