import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { Table, Form } from "react-bootstrap";
import "./StockHistory.css";

const StockHistory = () => {
  const location = useLocation();
  const { category } = location.state || { category: "all" }; // Default to 'all' if not provided

  const [viewMode, setViewMode] = useState("all"); // "all", "stock-in", "stock-out"
  const [stockHistoryData, setStockHistoryData] = useState([]); // All stock history data
  const [filteredData, setFilteredData] = useState([]); // Filtered data based on view
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCategoryFiltered, setIsCategoryFiltered] = useState(false); // Tracks if category filtering applied

  // 📦 **Fetch Stock History from 'stocks' node**
  useEffect(() => {
    const db = getDatabase();
    const stocksRef = ref(db, "stocks/");

    onValue(stocksRef, (snapshot) => {
      const stocksData = snapshot.val();
      const historyArray = [];

      if (stocksData) {
        Object.keys(stocksData).forEach((productId) => {
          const product = stocksData[productId];
          const productCategory = product.category?.toLowerCase() || "";

          if (category?.toLowerCase() === productCategory || category === "all") {
            // Fetch Stock In History
            if (product.stockHistory) {
              Object.keys(product.stockHistory).forEach((historyId) => {
                const historyEntry = product.stockHistory[historyId];
                historyArray.push({
                  ...historyEntry,
                  type: "IN",
                  productId,
                  historyId,
                  productName: product.name || "Unknown",
                  category: product.category || "Uncategorized",
                });
              });
            }

            // Fetch Stock Out History
            if (product.stockOutHistory) {
              Object.keys(product.stockOutHistory).forEach((historyId) => {
                const historyEntry = product.stockOutHistory[historyId];
                historyArray.push({
                  ...historyEntry,
                  type: "OUT",
                  productId,
                  historyId,
                  productName: product.name || "Unknown",
                  category: product.category || "Uncategorized",
                });
              });
            }
          }
        });
      }

      setStockHistoryData(historyArray);
      setIsCategoryFiltered(category !== "all"); // Indicate category-specific filtering
    });
  }, [category]);

  // 🔍 **Filter Data Based on View Mode, Search, and Date Range**
  useEffect(() => {
    let data = [...stockHistoryData];

    // Filter by View Mode
    if (viewMode === "stock-in") {
      data = data.filter((item) => item.type === "IN");
    } else if (viewMode === "stock-out") {
      data = data.filter((item) => item.type === "OUT");
    }

    // Apply Search Term Filter
    if (searchTerm) {
      data = data.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply Date Filters
    if (startDate) {
      data = data.filter(
        (item) => new Date(item.date || item.restockDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      data = data.filter(
        (item) => new Date(item.date || item.restockDate) <= new Date(endDate)
      );
    }

    setFilteredData(data);
  }, [viewMode, stockHistoryData, searchTerm, startDate, endDate]);

  // 📅 **Format Date Utility**
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
  };

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
                <td>{formatDate(item.date || item.restockDate)}</td>
                <td>{item.productName}</td>
                <td>
                  {item.type === "IN"
                    ? item.quantityAdded || 0
                    : item.quantityRemoved || 0}
                </td>
                <td>{item.expiryDate || "N/A"}</td>
                <td>
                  {item.type === "IN" ? (
                    <span className="stock-in">Stock In</span>
                  ) : (
                    <span className="stock-out">Stock Out</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">
                {isCategoryFiltered
                  ? `No stock history available for ${category}.`
                  : "No stock history available."}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StockHistory;
