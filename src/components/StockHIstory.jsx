import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Table, Form } from 'react-bootstrap';
import './StockHistory.css';

const StockHistory = () => {
  const [viewMode, setViewMode] = useState('all'); // "all", "stock-in", "stock-out"
  const [stockInData, setStockInData] = useState([]);
  const [stockOutData, setStockOutData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [products, setProducts] = useState({}); // To store product details

  // Fetch Product Details from Stocks Node
  useEffect(() => {
    const db = getDatabase();
    const stocksRef = ref(db, 'stocks/');

    onValue(stocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(data); // Save the product data to state
      }
    });
  }, []);

  // Fetch Stock In Data
  useEffect(() => {
    const db = getDatabase();
    const stockInRef = ref(db, 'restock/');

    onValue(stockInRef, (snapshot) => {
      const data = snapshot.val();
      const stockInArray = [];

      if (data) {
        Object.keys(data).forEach((productId) => {
          Object.keys(data[productId]).forEach((restockId) => {
            const restockEntry = data[productId][restockId];
            stockInArray.push({
              ...restockEntry,
              productId,
              restockId,
              productName: products[productId]?.name || 'Unknown', // Map product name
              type: 'Stock In',
            });
          });
        });
      }

      setStockInData(stockInArray);
    });
  }, [products]);

  // Fetch Stock Out Data
  useEffect(() => {
    const db = getDatabase();
    const stockOutRef = ref(db, 'stockout/');

    onValue(stockOutRef, (snapshot) => {
      const data = snapshot.val();
      const stockOutArray = [];

      if (data) {
        Object.keys(data).forEach((productId) => {
          Object.keys(data[productId]).forEach((stockOutId) => {
            const stockOutEntry = data[productId][stockOutId];
            stockOutArray.push({
              ...stockOutEntry,
              productId,
              stockOutId,
              productName: products[productId]?.name || 'Unknown', // Map product name
              type: 'Stock Out',
            });
          });
        });
      }

      setStockOutData(stockOutArray);
    });
  }, [products]);

  // Filter data based on view mode and user inputs
  useEffect(() => {
    let data = [];
    if (viewMode === 'stock-in') {
      data = stockInData;
    } else if (viewMode === 'stock-out') {
      data = stockOutData;
    } else {
      data = [...stockInData, ...stockOutData];
    }

    // Apply search and date filters
    data = data.filter((item) => {
      const matchesSearch = item.productName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStartDate = startDate
        ? new Date(item.restockDate || item.stockOutDate) >= new Date(startDate)
        : true;
      const matchesEndDate = endDate
        ? new Date(item.restockDate || item.stockOutDate) <= new Date(endDate)
        : true;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });

    setFilteredData(data);
  }, [viewMode, stockInData, stockOutData, searchTerm, startDate, endDate]);

  return (
    <div className="stock-history-container">
      {/* Header */}
      <div className="header-container">
        <div className="header-content">
          <span className="back-button" onClick={() => window.history.back()}>
            ←
          </span>
          <h2 className="stock-history-title">Stock History</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-container">
        {/* Search Bar */}
        <Form.Control
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="stock-history-search"
        />

        {/* Date Filter */}
        <div className="date-filter-container">
          <div className="date-inputs">
            <Form.Group controlId="startDate" className="date-filter">
              <span className="date-label">From:</span>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="endDate" className="date-filter">
              <span className="date-label">To:</span>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </div>
        </div>

        {/* View Mode Dropdown */}
        <Form.Select
          className="stock-history-dropdown"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
        >
          <option value="all">All</option>
          <option value="stock-in">Stock In</option>
          <option value="stock-out">Stock Out</option>
        </Form.Select>
      </div>

      {/* Table */}
      <Table className="stock-details-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Expiry Date</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.restockDate || item.stockOutDate}</td>
                <td>{item.productName}</td>
                <td>{item.quantityAdded || item.quantityRemoved}</td>
                <td>{item.expiryDate || 'N/A'}</td>
                <td>{item.type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No records available.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StockHistory;
