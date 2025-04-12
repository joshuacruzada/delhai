import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { Table } from "react-bootstrap";
import "./ItemHistory.css";

const ItemHistory = () => {
  const location = useLocation();
  const { item } = location.state || {}; // Get the product details from state

  const [stockHistory, setStockHistory] = useState([]); // Stock history record
  const [filteredHistory, setFilteredHistory] = useState([]); // Filtered stock history
  const [totalAddedStock, setTotalAddedStock] = useState(0); // Total stock added
  const [totalDeductedStock, setTotalDeductedStock] = useState(0); // Total stock deducted
  const [overallStock, setOverallStock] = useState(0); // Overall stock

  const [filterType, setFilterType] = useState("All"); // Filter for All, Stock In, Stock Out

  const [batchIds, setBatchIds] = useState([]); // All batch IDs for filtering
  const [selectedBatchId, setSelectedBatchId] = useState("All"); // Selected Batch ID filter

  useEffect(() => {
    if (!item || !item.id) {
      console.error("No product selected.");
      return;
    }

    const db = getDatabase();
    const stockRef = ref(db, `stocks/${item.id}`);

    onValue(stockRef, (snapshot) => {
      const stockData = snapshot.val();
      if (stockData) {
        const { stockHistory = {}, stockOutHistory = {}, totalAddedStock = 0, stock = 0 } = stockData;

        const historyArray = [
          ...Object.keys(stockHistory).map((key) => {
            const batch = stockHistory[key];
            return {
              id: key,
              type: "IN",
              restockDate: batch.restockDate,
              ...batch,
            };
          }),
          ...Object.keys(stockOutHistory).map((key) => ({
            id: key,
            type: "OUT",
            ...stockOutHistory[key],
          })),
        ];

        // Sort history by date
        historyArray.sort((a, b) => {
          const dateA = new Date(a.restockDate || a.date || 0);
          const dateB = new Date(b.restockDate || b.date || 0);
          return dateA - dateB;
        });

        // Calculate total deducted stock
        const totalDeducted = Object.values(stockOutHistory || {}).reduce(
          (sum, outRecord) => sum + (outRecord.quantityRemoved || 0),
          0
        );

        // Get all batch IDs for filtering
        const batchIds = Array.from(
          new Set(historyArray.map((record) => record.batchId))
        );

        setStockHistory(historyArray);
        setFilteredHistory(historyArray); // Set initially to all history
        setOverallStock(stock); // Overall stock
        setTotalAddedStock(totalAddedStock); // Set cumulative added stock
        setTotalDeductedStock(totalDeducted); // Calculate total deducted stock
        setBatchIds(batchIds); // Save batch IDs
      } else {
        setStockHistory([]);
        setFilteredHistory([]);
        setTotalAddedStock(0);
        setTotalDeductedStock(0);
        setOverallStock(0);
        setBatchIds([]);
      }
    });
  }, [item]);

  useEffect(() => {
    let filtered = [...stockHistory];

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter((record) => record.type === filterType);
    }

    // Filter by Batch ID
    if (selectedBatchId !== "All") {
      filtered = filtered.filter((record) => record.batchId === selectedBatchId);
    }
   
    setFilteredHistory(filtered);
  }, [filterType, selectedBatchId, stockHistory]);

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

  return (
    <div className="item-history-container">
      {/* Header Section */}
      <div className="item-history-header">
        <button
          onClick={() => window.history.back()}
          className="item-history-back-btn"
        >
          ← 
        </button>
      </div>
    <div>
      <h2>{item.name ? `Stock Summary for ${item.name}` : "Stock Summary"}</h2>
    </div>

      {/* Summary Boxes */}
      <div className="item-history-summary">
        <div className="summary-box">
          <strong>Total Added Stock</strong>
          <span>{totalAddedStock}</span>
        </div>
        <div className="summary-box">
          <strong>Total Deducted Stock</strong>
          <span>{totalDeductedStock}</span>
        </div>
        <div className="summary-box">
          <strong>Overall Stock</strong>
          <span>{overallStock}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className=" item-history-filters-table-container">
      <div className="item-history-filters">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="form-select"
        >
          <option value="All">All</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
        </select>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className="form-select"
        >
          <option value="All">All Batch IDs</option>
          {batchIds.map((batchId) => (
            <option key={batchId} value={batchId}>
              {batchId}
            </option>
          ))}
        </select>
      </div>

      {/* Stock History Table */}
      <div className="item-history-table">
  {/* Table */}
  <Table className="item-history-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Batch ID</th>
        <th>Type</th>
        <th>Quantity</th>
        <th>Expiry Date</th>
      </tr>
    </thead>
    <tbody className="item-history-scrollable">
      {filteredHistory.length > 0 ? (
        filteredHistory.map((record) => (
          <tr key={record.id}>
            <td>{formatDate(record.restockDate || record.date)}</td>
            <td>{record.batchId || "N/A"}</td>
            <td>
              {record.type === "IN" ? (
                <span className="text-success font-weight-bold">Stock In</span>
              ) : (
                <span className="text-danger font-weight-bold">Stock Out</span>
              )}
            </td>
            <td>
              {record.type === "IN"
                ? `+${record.quantityAdded || 0}`
                : `-${record.quantityRemoved || 0}`}
            </td>
            <td>{record.expiryDate || "N/A"}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="text-center">
            No stock history available for this product.
          </td>
        </tr>
      )}
    </tbody>
  </Table>
</div>
</div>
    
</div>
  );
};

export default ItemHistory;
