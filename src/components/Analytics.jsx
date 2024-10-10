import React, { useState, useEffect, useRef } from 'react';
import { Chart, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, BarController, LineController } from 'chart.js';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';  // Adjust path based on your structure

// Register necessary Chart.js components
Chart.register(
  BarElement,
  LinearScale,  // Register LinearScale
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  BarController,
  LineController
);

const Analytics = () => {
  const [stockData, setStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const stockChartRef = useRef(null);
  const salesChartRef = useRef(null);

  useEffect(() => {
    // Fetch stocks from Firebase
    const stocksRef = ref(database, 'stocks/');
    onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data);  // Convert Firebase object to array
        setStockData(formattedData);
      }
    });

    // Fetch sales from Firebase
    const salesRef = ref(database, 'sales/');
    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data);  // Convert Firebase object to array
        setSalesData(formattedData);
      }
    });
  }, []);

  // Adjust this function to handle both stock and sales charts
  const initializeChart = (ref, data, label, backgroundColor, valueField) => {
    if (ref && ref.current) {
      const chart = new Chart(ref.current, {
        type: 'bar',
        data: {
          labels: data.map(item => new Date(item.date).toLocaleDateString()),  // Convert date to a readable format
          datasets: [
            {
              label,
              data: data.map(item => item[valueField]),  // Use the provided valueField to extract data
              backgroundColor,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      return () => chart.destroy();  // Cleanup on component unmount
    }
  };

  useEffect(() => {
    if (stockData.length) {
      initializeChart(stockChartRef, stockData, 'Stock Levels', '#5AB2FF', 'quantity');  // Assuming 'quantity' is the stock value field
    }
    if (salesData.length) {
      initializeChart(salesChartRef, salesData, 'Sales Data', '#FF6384', 'amount');  // Assuming 'amount' is the sales value field
    }
  }, [stockData, salesData]);

  return (
    <div className="analytics container-fluid">
      <h2>Stock and Sales Analytics</h2>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Stock Levels</h3>
          <canvas ref={stockChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Sales Data</h3>
          <canvas ref={salesChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
