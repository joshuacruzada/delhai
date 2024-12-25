import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Dashboard.css';
import ActivityLog from './ActivityLog';
import Analytics from './Analytics';

const safeString = (value) => (typeof value === "string" ? value.trim() : "");

const Dashboard = () => {
  const [stockData, setStockData] = useState([]);
  const [totals, setTotals] = useState({
    nearlyExpired: 0,
    totalStocks: 0,
    lowStocks: 0,
    outOfStocks: 0,
  });
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'Pharmaceuticals');

  const navigate = useNavigate();

  const calculateTotals = useCallback((stockArray, category) => {
    let nearlyExpired = 0; 
    let totalStocks = 0;
    let lowStocks = 0;
    let outOfStocks = 0;
  
    const now = new Date();
  
    stockArray.forEach((stock) => {
      const stockCategory = safeString(stock?.category);
      const activeCategory = safeString(category);
  
      if (stockCategory.toLowerCase() === activeCategory.toLowerCase()) {
        const quantity = parseInt(stock.quantity, 10);
        const criticalStock = parseInt(stock.criticalStock, 10) || 0;
  
        if (!isNaN(quantity)) {
          totalStocks += quantity;
          if (quantity === 0) {
            outOfStocks += 1;
          } else if (quantity < criticalStock) {
            lowStocks += 1;
          }
        }
  
        if (stock.expiryDate) {
          const expiryDate = new Date(stock.expiryDate);
          const timeDifference = expiryDate - now;
          const daysToExpire = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
          if (daysToExpire >= 0 && daysToExpire <= 30) {
            nearlyExpired += 1;
          }
        }
      }
    });
  
    setTotals({
      nearlyExpired,
      totalStocks,
      lowStocks,
      outOfStocks,
    });
  }, []);
    
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
  }, [activeTab, calculateTotals]); // Added calculateTotals
  

  

  const handleTabChange = (category) => {
    setActiveTab(category);
    localStorage.setItem('activeTab', category);
  };

  const handleCardClick = (type) => {
    const filteredStocks = stockData.filter(
      (stock) => safeString(stock?.category).toLowerCase() === safeString(activeTab).toLowerCase()
    );
  
    if (type === 'low-stocks') {
      const lowStocks = filteredStocks.filter(
        (stock) => stock.quantity > 0 && stock.quantity < stock.criticalStock
      );
      navigate('/low-stocks', { state: { stocks: lowStocks, category: activeTab } });
    } else if (type === 'out-of-stocks') {
      const outStocks = filteredStocks.filter((stock) => stock.quantity === 0);
      navigate('/out-stocks', { state: { stocks: outStocks, category: activeTab } });
    } else if (type === 'total-stocks') {
      navigate('/stock-details', { state: { stocks: filteredStocks, category: activeTab } });
    }
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
                'Rapid Tests ',
                'X-Ray Products',
                'Laboratory Reagents ',
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
