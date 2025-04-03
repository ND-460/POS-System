import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import required components
import axios from "axios";

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

const CategorySalesChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const fetchCategorySalesData = async () => {
    try {
      const response = await axios.get("/api/reports/category-sales");
      const data = response.data;

      const labels = data.map((item) => item.category);
      const values = data.map((item) => item.value);

      setChartData({
        labels,
        datasets: [
          {
            label: "Most Sold Categories",
            data: values,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
            hoverBackgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching category sales data:", error);
    }
  };

  useEffect(() => {
    fetchCategorySalesData();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Most Sold Categories</h3>
      <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default CategorySalesChart;
