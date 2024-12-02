import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './OutStockTable.css';

const OutStockTable = () => {
  const [outStocks, setOutStocks] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get selected category from location.state
  const { category } = location.state || {};

  useEffect(() => {
    const stocksRef = ref(database, 'stocks/');
    onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter data by category and out of stock
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
            (stock) => stock.quantity === 0 && stock.category === category // Filter out of stock by category
          );

        setOutStocks(filteredData);
      }
    });
  }, [category]);

  return (
    <div className="out-stocks-page">
      <div className="header">
        <span className="back-button" onClick={() => navigate(-1)}>
          ←
        </span>
        <h2>Out of Stock Items in {category}</h2>
      </div>
      <table className="out-stocks-table">
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
          {outStocks.length > 0 ? (
            outStocks.map((stock) => (
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
              <td colSpan="5">No out of stock items found in {category}.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OutStockTable;
