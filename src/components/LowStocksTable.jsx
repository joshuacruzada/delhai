import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './LowStocksTable.css';

const LowStocksTable = () => {
  const [lowStocks, setLowStocks] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get selected category from location.state
  const { category } = location.state || {};

  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter data by category and low stock
        const filteredData = Object.keys(data)
          .map((key) => ({
            id: key,
            name: data[key].name || 'No Name',
            description: data[key].description || 'No description available',
            quantity: data[key].quantity || 0,
            criticalStock: data[key].criticalStock || 0,
            date: data[key].date || 'N/A',
            category: data[key].category || 'N/A', // Ensure category is included
          }))
          .filter(
            (stock) =>
              stock.quantity > 0 && // Low stock: Quantity greater than 0 but less than critical stock
              stock.quantity < stock.criticalStock &&
              stock.category === category // Filter by category
          );

        setLowStocks(filteredData);
      }
    });
  }, [category]);

  return (
    <div className="low-stocks-page">
      <div className="header">
        <span className="back-button" onClick={() => navigate(-1)}>
          ←
        </span>
        <h2>Low Stock Items in {category}</h2>
      </div>
      <table className="low-stocks-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Critical Stock</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {lowStocks.length > 0 ? (
            lowStocks.map((stock) => (
              <tr key={stock.id}>
                <td>{stock.name}</td>
                <td>{stock.description}</td>
                <td>{stock.quantity}</td>
                <td>{stock.criticalStock}</td>
                <td>{stock.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No low stock items found in {category}.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LowStocksTable;
