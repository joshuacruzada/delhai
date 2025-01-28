import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { database } from '../FirebaseConfig'; // Correct path for Firebase config
import { ref, onValue } from 'firebase/database';
import './InventoryChart.css';

const InventoryChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [stockData, setStockData] = useState([]);

  // Fetch stock data and calculate total
  useEffect(() => {
    const stocksRef = ref(database, 'stocks');

    // Listen for changes in the stocks node
    onValue(stocksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Calculate the total quantity
        const totalQuantity = Object.values(data).reduce(
          (sum, stock) => sum + (stock.quantity || 0),
          0
        );

        // Get today's date (formatted as YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];

        // Update stock data for the chart
        setStockData([{ date: today, quantity: totalQuantity }]);
      } else {
        console.error('No stock data available');
        setStockData([]);
      }
    });
  }, []);

  // Render chart when stockData changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const data = stockData.map((item) => item.quantity);
    const labels = stockData.map((item) => item.date);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar', // Bar chart for stock visualization
      data: {
        labels,
        datasets: [
          {
            label: 'Available Stock Today',
            data,
            backgroundColor: '#42A5F5', // Blue color for the bar
            borderColor: '#1E88E5',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
              font: {
                weight: 'bold',
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Quantity',
              font: {
                weight: 'bold',
              },
            },
            ticks: {
              beginAtZero: true,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stockData]);

  return (
    <div className="inventory-chart">
      <h2>Inventory Available Today</h2>
      <div className="inventory-chart__canvas-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default InventoryChart;
