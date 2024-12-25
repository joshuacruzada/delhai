import React, { useState } from 'react';
import './RestockModal.css';
import { getDatabase, ref, update, push, get } from 'firebase/database';

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

      const db = getDatabase();
      const productRef = ref(db, `stocks/${product.id}`);
      const restockRef = ref(db, `restock/${product.id}`);

      // Fetch current stock
      const productSnapshot = await get(productRef);
      const currentStock = productSnapshot.val()?.quantity || 0;

      // Calculate new stock
      const updatedStock = parseInt(currentStock) + parseInt(newStockQuantity);

      // Prepare data for the database
      const restockData = {
        quantityAdded: parseInt(newStockQuantity),
        expiryDate: expiryDate || 'N/A',
        restockDate: restockDate,
      };

      const updates = {};
      updates[`/stocks/${product.id}/quantity`] = updatedStock;
      updates[`/stocks/${product.id}/lastRestocked`] = restockDate;

      const restockLogRef = push(restockRef);
      updates[`/restock/${product.id}/${restockLogRef.key}`] = restockData;

      // Update database
      await update(ref(db), updates);

      console.log('Restock Data:', restockData);
      onClose();
    } catch (err) {
      console.error('Restock failed:', err);
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

          {/* Expiry Date */}
          <div className="form-group">
            <label>Expiry Date (optional):</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Modal Actions */}
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
