import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Table } from 'react-bootstrap';
import './StockDetails.css'; // Assuming you are adding a CSS file

const StockDetails = () => {
  const location = useLocation(); // Access the passed state from navigate
  const { stocks, category } = location.state || {}; // Destructure the passed state
  const [viewMode, setViewMode] = useState('total-stocks'); // State to toggle between views
  const [stockInData, setStockInData] = useState([]); // State to hold stock in data
  const navigate = useNavigate();

  // Handle View Stock In and View Stock Out
  const handleViewStockIn = () => {
    setViewMode('stock-in');
  };

  const handleViewStockOut = () => {
    setViewMode('stock-out');
  };

  const handleViewTotalStocks = () => {
    setViewMode('total-stocks');
  };

  // Fetch Stock In Data and Merge with Product Data
  useEffect(() => {
    if (viewMode === 'stock-in') {
      const db = getDatabase();
      const stockInRef = ref(db, `restock/`);
      const stocksRef = ref(db, `stocks/`);

      // Fetch both restock and product (stock) data
      onValue(stockInRef, (snapshot) => {
        const restockData = snapshot.val();
        const restockArray = [];

        if (restockData) {
          onValue(stocksRef, (stockSnapshot) => {
            const stockData = stockSnapshot.val();

            Object.keys(restockData).forEach((productId) => {
              const product = stockData[productId]; // Fetch product info from stocks node

              Object.keys(restockData[productId]).forEach((restockId) => {
                restockArray.push({
                  id: restockId,
                  productId,
                  productName: product?.name || 'Unknown', // Merge with product name
                  imageUrl: product?.imageUrl || '', // Use the image URL directly from database
                  packaging: product?.packaging || 'N/A', // Merge with packaging info
                  description: product?.description || 'No description available', // Include product description
                  dateAdded: product?.date || 'Unknown', // Include the date the product was added
                  ...restockData[productId][restockId],
                });
              });
            });

            setStockInData(restockArray); // Save merged data to state
          });
        }
      });
    }
  }, [viewMode]);

  return (
    <div className="stock-details-page">
      <div className="header-container">
        {/* Back Button and Title in One Line */}
        <div className="header-content">
          <span className="back-button" onClick={() => navigate(-1)}>
            ←
          </span>
          {/* Clickable Title */}
          <h2 className="page-title" onClick={handleViewTotalStocks} style={{ cursor: 'pointer' }}>
            {category} / Total Stocks
            {viewMode === 'stock-in' && ' - Stock In List'}
            {viewMode === 'stock-out' && ' - Stock Out List'}
          </h2>
        </div>

        {/* Buttons (now text links) for Stock In and Stock Out */}
        <div className="total-stock-actions">
          <span className="action-link" onClick={handleViewStockIn}>
            Stock In List
          </span>
          <span className="action-link" onClick={handleViewStockOut}>
            Stock Out List
          </span>
        </div>
      </div>

      {/* Conditionally Render the Tables */}
      {viewMode === 'total-stocks' ? (
        <Table className="stock-details-table">
          <thead>
            <tr>
              <th>Product Image</th>
              <th>Item Description</th> {/* Combined Product Name and Description */}
              <th>Quantity</th>
              <th>Packaging</th>
              <th>Initial Stock Date</th> {/* Show Initial Stock Date */}
              <th>Last Restocked</th>
            </tr>
          </thead>
          <tbody>
            {stocks && stocks.length > 0 ? (
              stocks.map((stock) => (
                <tr key={stock.id}>
                  <td>
                    {stock.imageUrl ? (
                      <img
                        src={stock.imageUrl} // Use the image URL from the database directly
                        alt={stock.name}
                        style={{ width: '60px', height: '60px' }}
                      />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td>
                    <strong>{stock.name}</strong>
                    <br />
                    {stock.description || 'No description available'}
                  </td>
                  <td>{stock.quantity}</td>
                  <td>{stock.packaging}</td>
                  <td>{stock.date || 'N/A'}</td> {/* Display the initial stock date */}
                  <td>{stock.lastRestocked || 'N/A'}</td> {/* Display the latest restock date */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No stock information available.</td>
              </tr>
            )}
          </tbody>
        </Table>
      ) : viewMode === 'stock-in' ? (
        // Stock In (Restock) Table
        <Table className="stock-details-table">
          <thead>
            <tr>
              <th>Product Image</th>
              <th>Product Name</th>
              <th>Packaging</th>
              <th>Quantity</th>
              <th>Restock Date</th>
            </tr>
          </thead>
          <tbody>
            {stockInData.length > 0 ? (
              stockInData.map((restock) => (
                <tr key={restock.id}>
                  <td>
                    {restock.imageUrl ? (
                      <img
                        src={restock.imageUrl} // Use the image URL from the database directly
                        alt={restock.productName}
                        style={{ width: '50px', height: '50px' }}
                      />
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td>{restock.productName}</td>
                  <td>{restock.packaging}</td>
                  <td>{restock.quantityAdded}</td>
                  <td>{restock.restockDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No restock events found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      ) : (
        // Stock Out Table
        <Table className="stock-details-table">
          <thead>
            <tr>
              <th>Product Image</th>
              <th>Product Name</th>
              <th>Packaging</th>
              <th>Quantity Removed</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder for Stock Out data */}
            <tr>
              <td colSpan="5">No stock-out events found.</td>
            </tr>
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default StockDetails;
