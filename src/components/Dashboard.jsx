import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Dashboard.css';
import Analytics from './Analytics';
import ActivityLog from './ActivityLog';
import {
  loadNotifications,
  markNotificationAsRead,
  saveNotifications,
} from '../services/notification.js';

const Dashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('Electrical');
  const [notifications, setNotifications] = useState([]);

  const [totals, setTotals] = useState({
    totalItems: 0,
    totalStocks: 0,
    lowStocks: 0,
    outOfStocks: 0,
  });

  const navigate = useNavigate();

  // UseCallback to generate notifications when stock data changes
  const generateAndSetNotifications = useCallback((stockArray, category) => {
    // Load existing notifications from local storage or state
    let existingNotifications = loadNotifications();

    // Filter for low stock items in the new stock array
    const newLowStockNotifications = stockArray
      .filter((stock) => stock.category === category && parseInt(stock.quantity) < 10)
      .map((stock) => ({
        id: stock.id, // Use stock ID for better identification
        message: `Stock item ${stock.name} in category ${category} is low.`,
        time: new Date().toLocaleString(),
        read: false, // New notifications are unread by default
      }));

    // Filter out existing notifications that correspond to low stock items to avoid duplicates
    const mergedNotifications = [
      ...existingNotifications,
      ...newLowStockNotifications.filter(
        (newNotif) => !existingNotifications.some((notif) => notif.id === newNotif.id)
      ),
    ];

    // Set and save the merged notifications
    setNotifications(mergedNotifications);
    saveNotifications(mergedNotifications);
  }, []);

  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    const unsubscribe = onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const stockArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        calculateTotals(stockArray, activeTab);
        generateAndSetNotifications(stockArray, activeTab); // Trigger notifications on stock change
      }
    });

    return () => unsubscribe(); // Clean up Firebase listener
  }, [activeTab, generateAndSetNotifications]);

  useEffect(() => {
    const storedNotifications = loadNotifications();
    setNotifications(storedNotifications);
  }, []);

  const calculateTotals = (stockArray, category) => {
    let totalItems = 0;
    let totalStocks = 0;
    let lowStocks = 0;
    let outOfStocks = 0;

    stockArray.forEach((stock) => {
      if (stock.category === category) {
        totalItems += 1;
        const quantity = parseInt(stock.quantity.split(' ')[0], 10);
        totalStocks += quantity;

        if (quantity === 0) {
          outOfStocks += 1;
        } else if (quantity < 10) {
          lowStocks += 1;
        }
      }
    });

    setTotals({
      totalItems,
      totalStocks,
      lowStocks,
      outOfStocks,
    });
  };

  const handleCardClick = (type) => {
    navigate(`/stock-details`, { state: { category: activeTab, type } });
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (id, event) => {
    event.stopPropagation();
    const updatedNotifications = markNotificationAsRead(id);
    setNotifications(updatedNotifications);
  };

  const clearAllNotifications = (event) => {
    event.stopPropagation();
    setNotifications([]);
    saveNotifications([]);
  };

  // Sort notifications: Unread notifications on top
  const sortedNotifications = notifications.sort((a, b) => {
    if (!a.read && b.read) return -1;
    if (a.read && !b.read) return 1;
    return new Date(b.time) - new Date(a.time);
  });

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h2>Dashboard</h2>
        </div>
        <div className="dashboard-header-right">
          <div className="notification-container" onClick={handleToggleNotifications}>
            <img src="/notification-bell.png" alt="Notification Bell" className="notification-icon" />
            {notifications.some((notification) => !notification.read) && (
              <span className="notification-dot"></span>
            )}
            {showNotifications && (
              <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">
                  <h5>Notifications</h5>
                  <button className="clear-all-btn" onClick={clearAllNotifications}>
                    Clear All
                  </button>
                </div>
                {sortedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${notif.read ? '' : 'unread'}`}
                    onClick={(e) => handleNotificationClick(notif.id, e)}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <p className="notification-time">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Section: Stats and Activity Log */}
        <div className="left-section">
          <Card className="category-and-stats-container">
            <div className="button-group-container">
              {['Electrical', 'Civil', 'Production', 'HVAC'].map((category) => (
                <Button
                  key={category}
                  variant="outline-secondary"
                  className={`category-tab-btn ${activeTab === category ? 'active' : ''}`}
                  onClick={() => setActiveTab(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <Card className="stats-group-card">
              <Row className="mb-2">
                {[
                  { title: 'TOTAL ITEMS', count: totals.totalItems, className: 'total-items' },
                  { title: 'TOTAL STOCKS', count: totals.totalStocks, className: 'total-stocks' },
                  { title: 'LOW STOCKS', count: totals.lowStocks, className: 'low-stocks' },
                  { title: 'OUT OF STOCKS', count: totals.outOfStocks, className: 'out-of-stocks' },
                ].map((cardData, index) => (
                  <Col key={index} md="auto">
                    <Card
                      className={`text-center stats-card ${cardData.className}`}
                      onClick={() => handleCardClick(cardData.className)}
                    >
                      <Card.Body>
                        <Card.Title>{cardData.title}</Card.Title>
                        <Card.Text className="count">{cardData.count}</Card.Text>
                        <Card.Text>{activeTab}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Card>

          <Card className="activity-log">
            <Card.Body>
              <ActivityLog />
            </Card.Body>
          </Card>
        </div>

        {/* Right Section: Analytics */}
        <div className="right-section">
          <Card className="analytics-container">
            <Card.Body>
              <Analytics showExportButtons={false} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
