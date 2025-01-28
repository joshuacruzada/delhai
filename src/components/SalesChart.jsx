import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { database } from '../FirebaseConfig'; // Correct path for Firebase config
import { ref, get } from 'firebase/database';
import './SalesChart.css'; // Custom styles

const SalesChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [view, setView] = useState('daily');
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch sales data from Firebase
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const salesRef = ref(database, 'sales');
        const snapshot = await get(salesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          // Traverse nested structure and format data
          const formattedData = Object.entries(data).flatMap(([userId, userSales]) =>
            Object.entries(userSales).map(([saleId, sale]) => ({
              amount: sale.totalAmount || 0,
              date: sale.date, // Use date as-is from Firebase
            }))
          );

          setSalesData(formattedData);
        } else {
          console.error('No sales data available');
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, []);

  // Filter sales data based on selected view
  useEffect(() => {
    let filtered = [];

    if (view === 'daily') {
      // Use sales data as-is (no aggregation)
      filtered = salesData.map((sale) => ({
        date: new Date(sale.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        amount: sale.amount,
      }));
    } else if (view === 'monthly') {
      // Group by month
      const aggregatedData = salesData.reduce((acc, sale) => {
        const monthStr = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[monthStr] = (acc[monthStr] || 0) + sale.amount;
        return acc;
      }, {});
      filtered = Object.entries(aggregatedData).map(([date, amount]) => ({ date, amount }));
    } else if (view === 'yearly') {
      // Group by year
      const aggregatedData = salesData.reduce((acc, sale) => {
        const yearStr = new Date(sale.date).getFullYear().toString();
        acc[yearStr] = (acc[yearStr] || 0) + sale.amount;
        return acc;
      }, {});
      filtered = Object.entries(aggregatedData).map(([date, amount]) => ({ date, amount }));
    }

    setFilteredData(filtered);
  }, [salesData, view]);

  // Render chart when filteredData or view changes
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const data = filteredData.map((sale) => sale.amount);
    const labels = filteredData.map((sale) => sale.date);

    const lineColors = {
      daily: '#4D869C',
      monthly: '#FFC107',
      yearly: '#E91E63',
    };

    const safeView = view || 'daily';

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${safeView.charAt(0).toUpperCase() + safeView.slice(1)} Sales`,
            data,
            borderColor: lineColors[safeView],
            backgroundColor: `${lineColors[safeView]}33`,
            fill: true,
            tension: 0.4,
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
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Amount (₱)',
              font: {
                weight: 'bold',
              },
            },
            ticks: {
              callback: (value) => `₱${value.toLocaleString()}`,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                return `Amount: ₱${tooltipItem.raw.toLocaleString()}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [filteredData, view]);

  return (
    <div className="sales-chart">
      <h2>Sales</h2>
      <div className="sales-chart__controls">
        <label className="sales-chart__label">
          <input
            type="radio"
            name="view"
            value="daily"
            checked={view === 'daily'}
            onChange={() => setView('daily')}
          />
          Daily
        </label>
        <label className="sales-chart__label">
          <input
            type="radio"
            name="view"
            value="monthly"
            checked={view === 'monthly'}
            onChange={() => setView('monthly')}
          />
          Monthly
        </label>
        <label className="sales-chart__label">
          <input
            type="radio"
            name="view"
            value="yearly"
            checked={view === 'yearly'}
            onChange={() => setView('yearly')}
          />
          Yearly
        </label>
      </div>
      <div className="sales-chart__canvas-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default SalesChart;
