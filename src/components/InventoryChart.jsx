import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import './InventoryChart.css';

const InventoryChart = ({ inventoryData }) => {
  const [view, setView] = useState('monthly'); // Default view is monthly
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Validate inventoryData
    const validInventoryData = Array.isArray(inventoryData) ? inventoryData : [];

    // Filter data based on selected view
    const filteredData = validInventoryData.filter((item) => {
      if (view === 'monthly') return item.type === 'monthly';
      if (view === 'yearly') return item.type === 'yearly';
      return false;
    });

    const data = filteredData.map((item) => item.stockIn || 0);
    const labels = filteredData.map((item) => item.date || 'N/A');

    const lineColors = {
      monthly: '#42A5F5', // Blue for Monthly
      yearly: '#FF7043', // Orange for Yearly
    };

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${view.charAt(0).toUpperCase() + view.slice(1)} Inventory Stock`,
            data,
            borderColor: lineColors[view],
            backgroundColor: `${lineColors[view]}33`,
            fill: true,
            tension: 0.4,
          },
        ],
      },
    });
  }, [inventoryData, view]);

  return (
    <div className="inventory-chart">
      <h2>Inventory</h2>
      <div className="inventory-chart__controls">
        <label>
          <input
            type="radio"
            name="view"
            value="monthly"
            checked={view === 'monthly'}
            onChange={() => setView('monthly')}
          />
          Monthly
        </label>
        <label>
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
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default InventoryChart;
