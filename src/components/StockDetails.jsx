import React from 'react';
import { useLocation } from 'react-router-dom';
import { Table } from 'react-bootstrap';

const StockDetails = () => {
  const location = useLocation();
  const { stocks = [], category = "Unknown", type = "" } = location.state || {};

  // Filter the stocks based on the category passed
  const filteredStocks = stocks.filter(stock => stock.category && stock.category.trim().toLowerCase() === category.trim().toLowerCase());

  return (
    <div className="stock-details-container">
      <h3>{category} - {type.replace('-', ' ').toUpperCase()}</h3>

      {filteredStocks.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Min Stock Box</th>
              <th>Min Stock Pcs</th>
              <th>Packaging</th>
              <th>Price Per Box</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.id}>
                <td>{stock.name}</td>
                <td>{stock.quantity}</td>
                <td>{stock.minStockBox}</td>
                <td>{stock.minStockPcs}</td>
                <td>{stock.packaging}</td>
                <td>{stock.pricePerBox}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No products available for this category.</p>
      )}
    </div>
  );
};

export default StockDetails;
