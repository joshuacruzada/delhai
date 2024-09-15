import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { 
  Chart, 
  BarElement, 
  LinearScale, 
  CategoryScale, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  BarController, 
  LineController,
} from 'chart.js';
import ExportModal from './ExportModal';
import './Analytics.css';

// Register necessary Chart.js components
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
  BarController,
  LineController, // Register LineController for sales charts
);

const Analytics = () => {
  const [showModal, setShowModal] = useState(false);
  const [exportType, setExportType] = useState('weekly');

  const weeklyChartRef = useRef(null);
  const monthlyChartRef = useRef(null);
  const yearlyChartRef = useRef(null);
  const dailySalesChartRef = useRef(null);
  const weeklySalesChartRef = useRef(null);
  const yearlySalesChartRef = useRef(null);

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

  const yearlyData = useMemo(() => ({
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
      label: 'Yearly Stock Levels',
      data: [3000, 3200, 3100, 2900, 3300], 
      backgroundColor: '#FF9874', // Change this to your desired color (e.g., Blue)
      borderColor: '#1E88E5', 
      borderWidth: 1,
    }]
  }), []);
  

  const dailySalesData = useMemo(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Everyday Sales',
      data: [120, 150, 130, 170, 160, 190, 180],
      backgroundColor: '#4BC0C0',
      borderColor: '#4BC0C0',
      borderWidth: 1,
    }]
  }), []);

  const weeklySalesData = useMemo(() => ({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Weekly Sales',
      data: [600, 700, 750, 800],
      backgroundColor: '#FFCE56',
      borderColor: '#FFCE56',
      borderWidth: 1,
    }]
  }), []);

  const yearlySalesData = useMemo(() => ({
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
      label: 'Yearly Sales',
      data: [12000, 15000, 14000, 16000, 17000],
      backgroundColor: '#FF6384',
      borderColor: '#FF6384',
      borderWidth: 1,
    }]
  }), []);

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
    initializeChart(yearlyChartRef, yearlyData, 'bar');
    initializeChart(dailySalesChartRef, dailySalesData, 'line');
    initializeChart(weeklySalesChartRef, weeklySalesData, 'line');
    initializeChart(yearlySalesChartRef, yearlySalesData, 'line');
  }, [
    weeklyData,
    monthlyData,
    yearlyData,
    dailySalesData,
    weeklySalesData,
    yearlySalesData,
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
        <h2>Stock and Sales Analytics</h2>
        <DropdownButton
          id="dropdown-basic-button"
          title="Export Data"
          variant="primary"
          align="end"
        >
          <Dropdown.Item onClick={() => handleShowModal('weekly')}>Weekly Stock</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('monthly')}>Monthly Stock</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('yearly')}>Yearly Stock</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('dailySales')}>Everyday Sales</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('weeklySales')}>Weekly Sales</Dropdown.Item>
          <Dropdown.Item onClick={() => handleShowModal('yearlySales')}>Yearly Sales</Dropdown.Item>
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
          <h3>Yearly Stock Levels</h3>
          <canvas ref={yearlyChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Everyday Sales</h3>
          <canvas ref={dailySalesChartRef}></canvas>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Weekly Sales</h3>
          <canvas ref={weeklySalesChartRef}></canvas>
        </div>
        <div className="chart-container">
          <h3>Yearly Sales</h3>
          <canvas ref={yearlySalesChartRef}></canvas>
        </div>
      </div>

      <ExportModal
        show={showModal}
        handleClose={handleCloseModal}
        weeklyData={weeklyData}
        monthlyData={monthlyData}
        yearlyData={yearlyData}
        dailySalesData={dailySalesData}
        weeklySalesData={weeklySalesData}
        yearlySalesData={yearlySalesData}
        exportType={exportType}
      />
    </div>
  );
};

export default Analytics;
