import React, { useState, useEffect, useRef } from 'react';
import {
  Chart,
  LineElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineController,
} from 'chart.js';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';

Chart.register(LineElement, LinearScale, CategoryScale, Title, Tooltip, Legend, PointElement, LineController);

const aggregateData = (sales, stock) => {
  const dailyData = { sales: {}, stockIn: {}, stockOut: {} };
  const monthlyData = { sales: {}, stockIn: {}, stockOut: {} };
  const yearlyData = { sales: {}, stockIn: {}, stockOut: {} };

  sales.forEach((item) => {
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return;

    const day = date.toISOString().split('T')[0];
    const month = date.toISOString().slice(0, 7);
    const year = date.getFullYear();

    dailyData.sales[day] = (dailyData.sales[day] || 0) + (item.amount || 0);
    monthlyData.sales[month] = (monthlyData.sales[month] || 0) + (item.amount || 0);
    yearlyData.sales[year] = (yearlyData.sales[year] || 0) + (item.amount || 0);
  });

  stock.forEach((item) => {
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return;

    const day = date.toISOString().split('T')[0];
    const month = date.toISOString().slice(0, 7);
    const year = date.getFullYear();

    dailyData.stockIn[day] = (dailyData.stockIn[day] || 0) + (item.stockIn || 0);
    dailyData.stockOut[day] = (dailyData.stockOut[day] || 0) + (item.stockOut || 0);

    monthlyData.stockIn[month] = (monthlyData.stockIn[month] || 0) + (item.stockIn || 0);
    monthlyData.stockOut[month] = (monthlyData.stockOut[month] || 0) + (item.stockOut || 0);

    yearlyData.stockIn[year] = (yearlyData.stockIn[year] || 0) + (item.stockIn || 0);
    yearlyData.stockOut[year] = (yearlyData.stockOut[year] || 0) + (item.stockOut || 0);
  });

  return { dailyData, monthlyData, yearlyData };
};

const Analytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [salesView, setSalesView] = useState('daily');
  const [stockView, setStockView] = useState('daily');

  const salesChartRef = useRef(null);
  const stockChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const stockChartInstance = useRef(null);

  useEffect(() => {
    const salesRef = ref(database, 'sales/');
    const stockRef = ref(database, 'stocks/');

    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSalesData(Object.values(data));
      }
    });

    onValue(stockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStockData(Object.values(data));
      }
    });
  }, []);

  const initializeChart = (ref, labels, datasets, chartInstance) => {
    if (ref && ref.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy previous instance if it exists
      }

      chartInstance.current = new Chart(ref.current, {
        type: 'line',
        data: {
          labels,
          datasets,
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount',
              },
            },
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
              },
            },
            legend: {
              display: true,
              position: 'top',
            },
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
        },
      });
    }
  };

  useEffect(() => {
    if (salesData.length && stockData.length) {
      const { dailyData, monthlyData, yearlyData } = aggregateData(salesData, stockData);

      let salesLabels, salesDataset;
      if (salesView === 'daily') {
        salesLabels = Object.keys(dailyData.sales).sort();
        salesDataset = [
          {
            label: 'Daily Sales',
            data: salesLabels.map((label) => dailyData.sales[label]),
            borderColor: '#FF6384',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
        ];
      } else if (salesView === 'monthly') {
        salesLabels = Object.keys(monthlyData.sales).sort();
        salesDataset = [
          {
            label: 'Monthly Sales',
            data: salesLabels.map((label) => monthlyData.sales[label]),
            borderColor: '#FF6384',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
        ];
      } else if (salesView === 'yearly') {
        salesLabels = Object.keys(yearlyData.sales).sort();
        salesDataset = [
          {
            label: 'Yearly Sales',
            data: salesLabels.map((label) => yearlyData.sales[label]),
            borderColor: '#FF6384',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
        ];
      }

      initializeChart(salesChartRef, salesLabels, salesDataset, salesChartInstance);

      let stockLabels, stockDatasets;
      if (stockView === 'daily') {
        stockLabels = Object.keys(dailyData.stockIn).sort();
        stockDatasets = [
          {
            label: 'Daily Stock In',
            data: stockLabels.map((label) => dailyData.stockIn[label]),
            borderColor: '#36A2EB',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: 'Daily Stock Out',
            data: stockLabels.map((label) => dailyData.stockOut[label]),
            borderColor: '#FFCE56',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
        ];
      } else if (stockView === 'monthly') {
        stockLabels = Object.keys(monthlyData.stockIn).sort();
        stockDatasets = [
          {
            label: 'Monthly Stock In',
            data: stockLabels.map((label) => monthlyData.stockIn[label]),
            borderColor: '#36A2EB',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: 'Monthly Stock Out',
            data: stockLabels.map((label) => monthlyData.stockOut[label]),
            borderColor: '#FFCE56',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
        ];
      } else if (stockView === 'yearly') {
        stockLabels = Object.keys(yearlyData.stockIn).sort();
        stockDatasets = [
          {
            label: 'Yearly Stock In',
            data: stockLabels.map((label) => yearlyData.stockIn[label]),
            borderColor: '#36A2EB',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: 'Yearly Stock Out',
            data: stockLabels.map((label) => yearlyData.stockOut[label]),
            borderColor: '#FFCE56',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
        ];
      }

      initializeChart(stockChartRef, stockLabels, stockDatasets, stockChartInstance);
    }
  }, [salesView, stockView, salesData, stockData]);

  return (
    <div className="analytics container-fluid">
      <h2>Sales and Stock Analytics</h2>

      {/* Sales Graph */}
      <div className="charts-row">
        <h3>Sales Data</h3>
        <div className="chart-controls">
          <button className={salesView === 'daily' ? 'active' : ''} onClick={() => setSalesView('daily')}>
            Daily
          </button>
          <button className={salesView === 'monthly' ? 'active' : ''} onClick={() => setSalesView('monthly')}>
            Monthly
          </button>
          <button className={salesView === 'yearly' ? 'active' : ''} onClick={() => setSalesView('yearly')}>
            Yearly
          </button>
        </div>
        <div className="chart-container">
          <canvas ref={salesChartRef}></canvas>
        </div>
      </div>

      {/* Stock Graph */}
      <div className="charts-row">
        <h3>Stock Data</h3>
        <div className="chart-controls">
          <button className={stockView === 'daily' ? 'active' : ''} onClick={() => setStockView('daily')}>
            Daily
          </button>
          <button className={stockView === 'monthly' ? 'active' : ''} onClick={() => setStockView('monthly')}>
            Monthly
          </button>
          <button className={stockView === 'yearly' ? 'active' : ''} onClick={() => setStockView('yearly')}>
            Yearly
          </button>
        </div>
        <div className="chart-container">
          <canvas ref={stockChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
