import React, { useState, useEffect, useRef } from 'react';
import { Chart, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, BarController } from 'chart.js';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';
import * as XLSX from 'xlsx'; // Import the xlsx library

Chart.register(
  BarElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  BarController
);

const Analytics = () => {
  const [stockData, setStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const stockChartRef = useRef(null);
  const salesChartRef = useRef(null);
  const stockChartInstance = useRef(null);
  const salesChartInstance = useRef(null);

  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data);
        const aggregatedStockData = formattedData.map(item => ({
          quantity: parseInt(item.quantity) || 0,
          date: item.date || new Date().toISOString()
        }));
        setStockData(aggregatedStockData);
      }
    });

    const salesRef = ref(database, 'sales/');
    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data);
        setSalesData(formattedData);
      }
    });
  }, []);

  const aggregateSalesData = (data) => {
    const dailySales = {};
    const monthlySales = {};
    const yearlySales = {};

    data.forEach(item => {
      const date = new Date(item.date);
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const month = date.toISOString().slice(0, 7); // YYYY-MM
      const year = date.getFullYear(); // YYYY

      // Daily
      dailySales[day] = (dailySales[day] || 0) + (item.amount || 0);
      // Monthly
      monthlySales[month] = (monthlySales[month] || 0) + (item.amount || 0);
      // Yearly
      yearlySales[year] = (yearlySales[year] || 0) + (item.amount || 0);
    });

    return { dailySales, monthlySales, yearlySales };
  };

  const initializeChart = (ref, data, label, backgroundColor, chartInstance) => {
    if (ref && ref.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const filteredData = data.filter(item => item.date && (item.amount || item.quantity));
      chartInstance.current = new Chart(ref.current, {
        type: 'bar',
        data: {
          labels: filteredData.map(item => new Date(item.date).toLocaleDateString()),
          datasets: [
            {
              label,
              data: filteredData.map(item => item.amount || item.quantity),
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
    }
  };

  useEffect(() => {
    if (stockData.length) {
      initializeChart(stockChartRef, stockData, 'Stock Levels', '#5AB2FF', stockChartInstance);
    }
    if (salesData.length) {
      const { dailySales } = aggregateSalesData(salesData);
      const aggregatedSalesData = Object.keys(dailySales).map(date => ({
        amount: dailySales[date],
        date
      }));
      initializeChart(salesChartRef, aggregatedSalesData, 'Sales Data', '#FF6384', salesChartInstance);
    }
  }, [stockData, salesData]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const stockWorksheet = XLSX.utils.json_to_sheet(stockData);
    XLSX.utils.book_append_sheet(wb, stockWorksheet, 'Stock Data');
    
    // Aggregate sales data for export
    const { dailySales } = aggregateSalesData(salesData);
    const aggregatedSalesData = Object.keys(dailySales).map(date => ({
      date,
      amount: dailySales[date],
    }));
    const salesWorksheet = XLSX.utils.json_to_sheet(aggregatedSalesData);
    XLSX.utils.book_append_sheet(wb, salesWorksheet, 'Sales Data');

    XLSX.writeFile(wb, 'analytics_data.xlsx');
  };

  return (
    <div className="analytics container-fluid">
      <h2>Stock and Sales Analytics</h2>
      
      <button onClick={exportToExcel} style={{ marginBottom: '20px' }}>
        Export to Excel
      </button>

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
