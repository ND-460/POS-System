import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import axios from "axios";

// Register the required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MonthlyRevenueChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const fetchMonthlyRevenueData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/monthly-revenue`);
      const data = response.data;

      const labels = data.map((item) => item.month);
      const values = data.map((item) => item.revenue);

      setChartData({
        labels,
        datasets: [
          {
            label: "Monthly Revenue",
            data: values,
            backgroundColor: "#4BC0C0",
            borderColor: "#4BC0C0",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching monthly revenue data:", error);
    }
  };

  useEffect(() => {
    fetchMonthlyRevenueData();
  }, []);

  return (
    <div style={{ width: "70%", height: "300px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Monthly Revenue</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                maxRotation: 0, // Prevent label rotation
                minRotation: 0,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default MonthlyRevenueChart;
