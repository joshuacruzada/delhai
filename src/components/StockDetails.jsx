import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Table } from 'react-bootstrap';
import './StockDetails.css'; // Import CSS for styling

const StockDetails = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook to navigate between routes
  const { category, type } = location.state || {};
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    if (category) {
      const stocksRef = ref(database, 'stocks/');
      onValue(stocksRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const stockArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          const filteredData = stockArray.filter(stock => stock.category === category);

          let itemsToDisplay = [];

          if (type === 'low-stocks') {
            itemsToDisplay = filteredData.filter(stock => {
              const quantityNumber = parseInt(stock.quantity, 10);
              const unit = stock.quantityUnit;

              // Skip items with 0 quantity or invalid entries
              if (quantityNumber === 0 || isNaN(quantityNumber) || !unit) {
                return false;
              }

              // Define thresholds
              const lowStockThresholds = {
                'box': 5,
                'pcs': 100,
              };

              return quantityNumber < (lowStockThresholds[unit] || Infinity);
            });

          } else if (type === 'out-of-stocks') {
            itemsToDisplay = filteredData.filter(stock => {
              const quantityNumber = parseInt(stock.quantity, 10);
              return quantityNumber === 0;
            });
          } else {
            itemsToDisplay = filteredData;
          }

          setStockData(itemsToDisplay);
        } else {
          setStockData([]);
        }
      });
    }
  }, [category, type]);

  if (!category) {
    return <div>No data available</div>;
  }

  return (
    <div className="stock-details-page">
      <div className="stock-details-header">
        <span className="dashboard-link" onClick={() => navigate('/')}>
          Dashboard
        </span>
        <span className="header-separator">/</span>
        <span className="header-title">
          {`${type.replace(/-/g, ' ').toUpperCase()}`}
        </span>
      </div>
      <Table hover className="stock-details-table">
        <thead>
          <tr>
            {type !== 'total-items' && <th>Quantity</th>}
            <th>Product Name</th>
            <th>Date</th>
            {type === 'total-items' && <th>Category</th>}
          </tr>
        </thead>
        <tbody>
          {stockData.length > 0 ? (
            stockData.map((item, index) => (
              <tr key={index}>
                {type !== 'total-items' && <td>{item.quantity} {item.quantityUnit}</td>}
                <td>
                  {`${item.measurementValue ? `${item.measurementValue} ${item.measurementUnit} ` : ''}${item.name}`}
                </td>
                <td>{item.date}</td>
                {type === 'total-items' && <td>{item.category}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={type === 'total-items' ? 3 : 2}>No data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StockDetails;
