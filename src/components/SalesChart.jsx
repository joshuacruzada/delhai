import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import './SalesChart.css'; // Import the CSS file

const SalesChart = ({ salesData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [view, setView] = useState('daily'); // State managed locally

  useEffect(() => {
    // Destroy existing chart to avoid memory leaks
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Validate salesData and prepare data and labels
    const validSalesData = Array.isArray(salesData) ? salesData : [];
    const data = validSalesData.map((sale) => sale.amount || 0); // Y-axis: Amount
    const labels = validSalesData.map((sale) => sale.date || 'N/A'); // X-axis: Dates

    // Define line colors based on view
    const lineColors = {
      daily: '#4CAF50', // Green for Daily
      monthly: '#FFC107', // Yellow for Monthly
      yearly: '#E91E63', // Pink for Yearly
    };

    // Ensure view has a valid value
    const safeView = view || 'daily';

    // Initialize the chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${safeView.charAt(0).toUpperCase() + safeView.slice(1)} Sales`,
            data,
            borderColor: lineColors[safeView] || '#4CAF50',
            backgroundColor: `${lineColors[safeView] || '#4CAF50'}33`,
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

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [salesData, view]);

  return (
    <div className="sales-chart">
      <h2>Sales</h2>
      {/* Radio Button Controls */}
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
      
      {/* Chart Canvas */}
      <div className="sales-chart__canvas-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default SalesChart;
