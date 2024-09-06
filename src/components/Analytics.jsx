import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { 
  Chart, 
  BarElement, 
  LinearScale, 
  CategoryScale, 
  RadialLinearScale, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  BarController, // Add this line
  RadarController, // Add this line for radar charts
  DoughnutController, // Add this line for doughnut charts
  PolarAreaController, // Add this line for polar area charts
  PieController, // Add this line for pie charts
} from 'chart.js';
import ExportModal from './ExportModal';
import './Analytics.css';

// Register necessary Chart.js components
Chart.register(
  BarElement,
  LinearScale,
  CategoryScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  BarController, // Register BarController
  RadarController, // Register RadarController
  DoughnutController, // Register DoughnutController
  PolarAreaController, // Register PolarAreaController
  PieController, // Register PieController
);

const Analytics = () => {
  const [showModal, setShowModal] = useState(false);
  const [exportType, setExportType] = useState('weekly');

  const weeklyChartRef = useRef(null);
  const monthlyChartRef = useRef(null);
  const electricalChartRef = useRef(null);
  const civilChartRef = useRef(null);
  const productionChartRef = useRef(null);
  const hvacChartRef = useRef(null);

  const weeklyData = useMemo(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Weekly Stock Levels',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: '#5AB2FF',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1,
    }]
  }), []);

  const monthlyData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Stock Levels',
      data: [300, 200, 400, 500, 450, 600, 700, 800, 600, 550, 650, 750],
      backgroundColor: '#FF8E8F',
      borderColor: '#FF8E8F',
      borderWidth: 1,
    }]
  }), []);

  const stockAgingData = {
    electrical: {
      data: [200, 150, 100, 50, 25, 10],
      labels: ['6+ months', '3-6 months', '1-3 months', '1 month', '2 weeks', '1 week'],
    },
    civil: {
      data: [100, 90, 60, 40, 30, 20],
      labels: ['6+ months', '3-6 months', '1-3 months', '1 month', '2 weeks', '1 week'],
    },
    production: {
      data: [150, 130, 110, 80, 60, 30],
      labels: ['6+ months', '3-6 months', '1-3 months', '1 month', '2 weeks', '1 week'],
    },
    hvac: {
      data: [300, 200, 150, 100, 50, 20],
      labels: ['6+ months', '3-6 months', '1-3 months', '1 month', '2 weeks', '1 week'],
    },
  };

  const initializeChart = (ref, data, type = 'bar') => {
    if (ref && ref.current) {
      const existingChart = Chart.getChart(ref.current);
      if (existingChart) {
        existingChart.destroy();
      }
      new Chart(ref.current, {
        type,
        data,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              type: 'linear',
            },
          },
        },
      });
    }
  };

  useEffect(() => {
    initializeChart(weeklyChartRef, weeklyData, 'bar');
    initializeChart(monthlyChartRef, monthlyData, 'bar');
    initializeChart(electricalChartRef, {
      labels: stockAgingData.electrical.labels,
      datasets: [{ data: stockAgingData.electrical.data, backgroundColor: '#FF6384' }],
    }, 'polarArea');
    initializeChart(civilChartRef, {
      labels: stockAgingData.civil.labels,
      datasets: [{ data: stockAgingData.civil.data, backgroundColor: '#36A2EB' }],
    }, 'radar');
    initializeChart(productionChartRef, {
      labels: stockAgingData.production.labels,
      datasets: [{ data: stockAgingData.production.data, backgroundColor: '#FFCE56' }],
    }, 'doughnut');
    initializeChart(hvacChartRef, {
      labels: stockAgingData.hvac.labels,
      datasets: [{ data: stockAgingData.hvac.data, backgroundColor: '#4BC0C0' }],
    }, 'pie');
  }, [
    weeklyData,
    monthlyData,
    stockAgingData.electrical.data,
    stockAgingData.electrical.labels,
    stockAgingData.civil.data,
    stockAgingData.civil.labels,
    stockAgingData.production.data,
    stockAgingData.production.labels,
    stockAgingData.hvac.data,
    stockAgingData.hvac.labels,
  ]);

  const handleShowModal = (type) => {
    setExportType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="analytics container-fluid">
      <div className="analytics-header">
        <h2 >Stock Levels Analytics</h2>
        <DropdownButton
          id="dropdown-basic-button"
          title="Export Data"
          variant="primary"
          align="end"
        >
          <Dropdown.Item onClick={() => handleShowModal('weekly')}>Weekly</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('monthly')}>Monthly</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('stockAging')}>Stock Aging</Dropdown.Item>
        </DropdownButton>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Weekly Stock Levels</h3>
          <canvas ref={weeklyChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Monthly Stock Levels</h3>
          <canvas ref={monthlyChartRef}></canvas>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Electrical Stock Aging</h3>
          <canvas ref={electricalChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Civil Stock Aging</h3>
          <canvas ref={civilChartRef}></canvas>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Production Stock Aging</h3>
          <canvas ref={productionChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>HVAC Stock Aging</h3>
          <canvas ref={hvacChartRef}></canvas>
        </div>
      </div>

      <ExportModal
        show={showModal}
        handleClose={handleCloseModal}
        weeklyData={weeklyData}
        monthlyData={monthlyData}
        stockAgingData={stockAgingData}
        exportType={exportType}
      />
    </div>
  );
};

export default Analytics;
