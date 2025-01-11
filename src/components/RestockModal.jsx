// src/components/RestockModal.jsx

import React, { useState } from 'react';
import './RestockModal.css';
import { handleRestock } from '../utils/restockUtils';

const RestockModal = ({ product, onClose }) => {
  // State Management
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [restockDate] = useState(new Date().toISOString().substring(0, 10)); // Display today's date at the top
  const [loading, setLoading] = useState(false); // For submit button state
  const [error, setError] = useState(''); // For displaying errors

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newStockQuantity || isNaN(newStockQuantity) || parseInt(newStockQuantity) <= 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const restockDetails = {
        quantityAdded: parseInt(newStockQuantity),
        expiryDate: expiryDate || 'N/A',
        restockDate: restockDate,
      };

      await handleRestock(product.id, restockDetails);

      console.log('✅ Restock completed successfully.');
      onClose();
    } catch (err) {
      console.error('❌ Restock failed:', err.message);
      setError('Failed to update stock. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null; 

  return (
    <div className="restock-modal-overlay">
      <div className="restock-modal restock-new-design">
        <h2>Restock Product</h2>
        <p className="restock-date">{restockDate}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product:</label>
            <p>{product.name}</p>
          </div>

          <div className="form-group">
            <label>Stock:</label>
            <p>{product.quantity}</p>
          </div>

          <div className="form-group">
            <label>New Stock Quantity:</label>
            <input
              type="number"
              value={newStockQuantity}
              onChange={(e) => setNewStockQuantity(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Expiry Date (optional):</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
