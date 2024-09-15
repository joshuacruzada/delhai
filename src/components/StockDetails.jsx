import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { Card, Row, Col } from 'react-bootstrap';

const StockDetails = ({ category }) => {
  const [totals, setTotals] = useState({
    totalItems: 0,
    totalStocks: 0,
    lowStocks: 0,
    outOfStocks: 0,
  });

  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    const unsubscribe = onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const stockArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        calculateTotals(stockArray, category);
      }
    });

    return () => unsubscribe();
  }, [category]);

  const calculateTotals = (stockArray, category) => {
    let totalItems = 0;
    let totalStocks = 0;
    let lowStocks = 0;
    let outOfStocks = 0;

    stockArray.forEach((stock) => {
      if (stock.category.trim().toLowerCase() === category.trim().toLowerCase()) {
        totalItems += 1;
        const quantity = parseInt(stock.quantity, 10);
        if (!isNaN(quantity)) {
          totalStocks += quantity;
          if (quantity === 0) {
            outOfStocks += 1;
          } else if (quantity < 10) {
            lowStocks += 1;
          }
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

  return (
    <Card className="stats-group-card">
      <Row className="mb-2">
        {[
          { title: 'TOTAL ITEMS', count: totals.totalItems, className: 'total-items' },
          { title: 'TOTAL STOCKS', count: totals.totalStocks, className: 'total-stocks' },
          { title: 'LOW STOCKS', count: totals.lowStocks, className: 'low-stocks' },
          { title: 'OUT OF STOCKS', count: totals.outOfStocks, className: 'out-of-stocks' },
        ].map((cardData, index) => (
          <Col key={index} md="auto">
            <Card className={`text-center stats-card ${cardData.className}`}>
              <Card.Body>
                <Card.Title>{cardData.title}</Card.Title>
                <Card.Text className="count">{cardData.count}</Card.Text>
                <Card.Text>{category}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default StockDetails;
