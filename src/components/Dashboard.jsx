import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Dashboard.css';
import ActivityLog from './ActivityLog';
import Analytics from './Analytics';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'Pharmaceuticals');
  const [stockData, setStockData] = useState([]);
  const [totals, setTotals] = useState({
    nearlyExpired: 0, // New state to hold products that are nearly expired
    totalStocks: 0,
    lowStocks: 0,
    outOfStocks: 0,
  });

  const navigate = useNavigate();

  // Fetch stocks from Firebase
  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    const unsubscribe = onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const stockArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setStockData(stockArray);
        calculateTotals(stockArray, activeTab);
      }
    });

    return () => unsubscribe();
  }, [activeTab]);

  // Function to calculate totals, including nearly expired products
  const calculateTotals = (stockArray, category) => {
    let nearlyExpired = 0; // Count products that are nearly expired
    let totalStocks = 0;
    let lowStocks = 0;
    let outOfStocks = 0;

    const now = new Date(); // Get the current date

    stockArray.forEach((stock) => {
      if (stock.category.trim().toLowerCase() === category.trim().toLowerCase()) {
        const quantity = parseInt(stock.quantity, 10);
        const minStockBox = parseInt(stock.minStockBox, 10) || 0;
        const minStockPcs = parseInt(stock.minStockPcs, 10) || 0;
        const minStockLevel = Math.max(minStockBox, minStockPcs);

        if (!isNaN(quantity)) {
          totalStocks += quantity;
          if (quantity === 0) {
            outOfStocks += 1;
          } else if (quantity < minStockLevel) {
            lowStocks += 1;
          }
        }

        // Check if the product is nearly expired (e.g., expires within 30 days)
        if (stock.expiryDate) {
          const expiryDate = new Date(stock.expiryDate);
          const timeDifference = expiryDate - now;
          const daysToExpire = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert time difference to days

          if (daysToExpire >= 0 && daysToExpire <= 30) {
            nearlyExpired += 1;
          }
        }
      }
    });

    setTotals({
      nearlyExpired, // Update the nearly expired count
      totalStocks,
      lowStocks,
      outOfStocks,
    });
  };

  const handleTabChange = (category) => {
    setActiveTab(category);
    localStorage.setItem('activeTab', category);
  };

  const handleCardClick = (type) => {
    let filteredData = [];

    if (type === 'nearly-expired') {
      filteredData = stockData.filter((stock) => {
        const expiryDate = new Date(stock.expiryDate);
        const now = new Date();
        const daysToExpire = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysToExpire >= 0 && daysToExpire <= 30;
      });
    } else if (type === 'total-stocks') {
      filteredData = stockData.filter((stock) => parseInt(stock.quantity, 10) > 0);
    } else if (type === 'low-stocks') {
      filteredData = stockData.filter((stock) => {
        const minStockBox = parseInt(stock.minStockBox, 10) || 0;
        const minStockPcs = parseInt(stock.minStockPcs, 10) || 0;
        const minStockLevel = Math.max(minStockBox, minStockPcs);
        return parseInt(stock.quantity, 10) < minStockLevel;
      });
    } else if (type === 'out-of-stocks') {
      filteredData = stockData.filter((stock) => parseInt(stock.quantity, 10) === 0);
    }

    navigate('/stock-details', { state: { stocks: filteredData, category: activeTab, type } });
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-content">
        {/* Left Section for Tabs and Stats */}
        <div className="left-section">
          {/* Category Tabs */}
          <div className="category-and-stats-container">
            <div className="button-group-container">
              {[
                'Rapid Tests & Diagnostic Products',
                'X-Ray & Imaging Products',
                'Laboratory Reagents & Supplies',
                'Medical Supplies',
              ].map((category) => (
                <button
                  key={category}
                  className={`category-tab-btn ${activeTab === category ? 'active' : ''}`}
                  onClick={() => handleTabChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="stats-group">
              {[
                { title: 'NEARLY EXPIRED', count: totals.nearlyExpired, className: 'nearly-expired' }, // Changed card title
                { title: 'TOTAL STOCKS', count: totals.totalStocks, className: 'total-stocks' },
                { title: 'LOW STOCKS', count: totals.lowStocks, className: 'low-stocks' },
                { title: 'OUT OF STOCKS', count: totals.outOfStocks, className: 'out-of-stocks' },
              ].map((cardData, index) => (
                <div
                  key={index}
                  className={`stats-card ${cardData.className}`}
                  onClick={() => handleCardClick(cardData.className)}
                >
                  <h3>{cardData.title}</h3>
                  <p className="count">{cardData.count}</p>
                  <p>{activeTab}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="activity-log">
            <ActivityLog />
          </div>
        </div>

        {/* Right Section for Analytics */}
        <div className="right-section">
          <div className="analytics-container">
            <Analytics showExportButtons={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
