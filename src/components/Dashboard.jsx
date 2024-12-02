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
        const criticalStock = parseInt(stock.criticalStock, 10) || 0;
  
        if (!isNaN(quantity)) {
          totalStocks += quantity; // Add to total stock count
          if (quantity === 0) {
            outOfStocks += 1; // Count out-of-stock items
          } else if (quantity < criticalStock) {
            lowStocks += 1; // Count low-stock items
          }
        }
  
        // Check if the product is nearly expired (e.g., expires within 30 days)
        if (stock.expiryDate) {
          const expiryDate = new Date(stock.expiryDate);
          const timeDifference = expiryDate - now;
          const daysToExpire = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert time difference to days
  
          if (daysToExpire >= 0 && daysToExpire <= 30) {
            nearlyExpired += 1; // Count nearly expired items
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
    // Filter stocks by the selected category
    const filteredStocks = stockData.filter(
      (stock) => stock.category.trim().toLowerCase() === activeTab.trim().toLowerCase()
    );
  
    if (type === 'low-stocks') {
      // Filter low stock items
      const lowStocks = filteredStocks.filter(
        (stock) => stock.quantity > 0 && stock.quantity < stock.criticalStock
      );
      navigate('/low-stocks', { state: { stocks: lowStocks, category: activeTab } });
    } else if (type === 'out-of-stocks') {
      // Filter out of stock items
      const outStocks = filteredStocks.filter((stock) => stock.quantity === 0);
      navigate('/out-stocks', { state: { stocks: outStocks, category: activeTab } });
    } else if (type === 'total-stocks') {
      // Pass all stocks in the selected category
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
