import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import axios from "axios";

// Register the required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MostSoldItemsChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const fetchMostSoldItemsData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/most-sold-items`);
      const data = response.data;

      const labels = data.map((item) => item.itemName);
      const values = data.map((item) => item.quantitySold);

      setChartData({
        labels,
        datasets: [
          {
            label: "Most Sold Items",
            data: values,
            backgroundColor: "#36A2EB",
            borderColor: "#36A2EB",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching most sold items data:", error);
    }
  };

  useEffect(() => {
    fetchMostSoldItemsData();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Most Sold Items</h3>
      <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default MostSoldItemsChart;
