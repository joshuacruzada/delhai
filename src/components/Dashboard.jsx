import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Dashboard.css';
import ActivityLog from './ActivityLog';
import Analytics from './Analytics';

const Dashboard = () => {
  // Initialize activeTab from localStorage or default to 'Pharmaceuticals'
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'Pharmaceuticals');
  const [stockData, setStockData] = useState([]);  // Store stock data for further filtering
  const [totals, setTotals] = useState({
    totalItems: 0,
    totalStocks: 0,
    lowStocks: 0,
    outOfStocks: 0,
  });

  const navigate = useNavigate();

  // Fetch stock data and calculate totals whenever activeTab changes
  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    const unsubscribe = onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const stockArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setStockData(stockArray);  // Save stock data for later use
        calculateTotals(stockArray, activeTab);
      }
    });

    return () => unsubscribe();
  }, [activeTab]);

  const calculateTotals = (stockArray, category) => {
    let totalItems = 0;
    let totalStocks = 0;
    let lowStocks = 0;
    let outOfStocks = 0;
  
    stockArray.forEach((stock) => {
      // Ensure category comparison is case insensitive
      if (stock.category.trim().toLowerCase() === category.trim().toLowerCase()) {
        totalItems += 1;
        const quantity = parseInt(stock.quantity, 10);
        const minStockBox = parseInt(stock.minStockBox, 10) || 0;
        const minStockPcs = parseInt(stock.minStockPcs, 10) || 0;
        const minStockLevel = Math.max(minStockBox, minStockPcs);
  
        // Log the retrieved values for debugging
        console.log(`Product: ${stock.name}, Quantity: ${quantity}, Min Stock Box: ${minStockBox}, Min Stock Pcs: ${minStockPcs}, Min Stock Level: ${minStockLevel}`);
  
        if (!isNaN(quantity)) {
          totalStocks += quantity;
  
          if (quantity === 0) {
            outOfStocks += 1; // Product is out of stock
          } else if (quantity < minStockLevel) {
            lowStocks += 1; // Product is in low stock
          }
        }
      }
    });
  
    console.log(`Total Items: ${totalItems}, Total Stocks: ${totalStocks}, Low Stocks: ${lowStocks}, Out Of Stocks: ${outOfStocks}`);
    
    setTotals({
      totalItems,
      totalStocks,
      lowStocks,
      outOfStocks,
    });
  };
  


  // This function handles changing the active category tab and saving to localStorage
  const handleTabChange = (category) => {
    setActiveTab(category);  // Update the active tab
    localStorage.setItem('activeTab', category);  // Save the active tab to localStorage
  };

  // Function to handle the card clicks and navigate to StockDetails
  const handleCardClick = (type) => {
    let filteredData = [];

    if (type === 'total-items') {
      filteredData = stockData; // All items
    } else if (type === 'total-stocks') {
      filteredData = stockData.filter((stock) => parseInt(stock.quantity, 10) > 0); // Only items in stock
    } else if (type === 'low-stocks') {
      filteredData = stockData.filter((stock) => {
        const minStockBox = parseInt(stock.minStockBox, 10) || 0;
        const minStockPcs = parseInt(stock.minStockPcs, 10) || 0;
        const minStockLevel = Math.max(minStockBox, minStockPcs);
        return parseInt(stock.quantity, 10) < minStockLevel;
      });
    } else if (type === 'out-of-stocks') {
      filteredData = stockData.filter((stock) => parseInt(stock.quantity, 10) === 0); // Out of stock items
    }

    // Navigate to StockDetails and pass the filtered stock data and category
    navigate('/stock-details', { state: { stocks: filteredData, category: activeTab, type } });
  };

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>

      <div className="dashboard-content">
        <div className="left-section">
          <Card className="category-and-stats-container">
            <div className="button-group-container">
              {['Pharmaceuticals', 'Medical Supplies', 'Laboratory Reagents', 'Medical Equipment'].map((category) => (
                <Button
                  key={category}
                  variant="outline-secondary"
                  className={`category-tab-btn ${activeTab === category ? 'active' : ''}`}
                  onClick={() => handleTabChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Stats Cards */}
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
                        <Card.Text>{activeTab}</Card.Text> {/* Show active category name here */}
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
