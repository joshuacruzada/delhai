import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Button, Form } from 'react-bootstrap';
import './StockDetails.css';

const StockDetails = () => {
  const location = useLocation();
  const { stocks, category } = location.state || {};
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearchChange = (e) => setSearchTerm(e.target.value.toLowerCase());
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  // Filter stocks based on search and date range
  const filteredStocks = stocks
    ? stocks.filter((stock) => {
        const matchesSearch = stock.name.toLowerCase().includes(searchTerm);
        const matchesStartDate = startDate ? new Date(stock.date) >= new Date(startDate) : true;
        const matchesEndDate = endDate ? new Date(stock.date) <= new Date(endDate) : true;
        return matchesSearch && matchesStartDate && matchesEndDate;
      })
    : [];

  return (
    <div className="stock-details-page">
      <div className="header-container">
        <div className="header-content">
          <span className="back-button" onClick={() => navigate(-1)}>
            ←
          </span>
          <h2 className="page-title">
            {category} / Total Stocks
          </h2>
        </div>
      </div>

      {/* Filter and Button Section */}
      <div className="filter-container">
        {/* Search Bar */}
        <Form.Group controlId="search" className="search-bar">
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Form.Group>

        {/* Date Filter */}
        <div className="date-filter-container">
            <div className="date-inputs">
              <Form.Group controlId="startDate" className="date-filter">
                <span className="date-label">From:</span>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </Form.Group>
              <Form.Group controlId="endDate" className="date-filter">
                <span className="date-label">To:</span>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </Form.Group>
            </div>
        </div>


        {/* View Stock History Button */}
        <Button
          className="view-history-btn"
          onClick={() => navigate('/stock-history')}
        >
          View Stock History
        </Button>
      </div>

      <Table className="stock-details-table">
        <thead>
          <tr>
            <th>Product Image</th>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Packaging</th>
            <th>Initial Stock Date</th>
            <th>Last Restocked</th>
          </tr>
        </thead>
        <tbody>
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <tr
                key={stock.id}
                onClick={() => navigate(`/stock-history/${stock.id}`, { state: { stock } })}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  {stock.imageUrl ? (
                    <img
                      src={stock.imageUrl}
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
                <td>{stock.date || 'N/A'}</td>
                <td>{stock.lastRestocked || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No stock information available.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default StockDetails;
