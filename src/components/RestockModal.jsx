import React, { useState, useEffect } from 'react';
import './RestockModal.css';
import { getDatabase, ref, update, push, get } from 'firebase/database'; // Import Firebase Realtime Database functions

const RestockModal = ({ product, onClose }) => {
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [restockDate, setRestockDate] = useState(new Date().toISOString().substring(0, 10)); // Default to current date

  useEffect(() => {
    if (product) {
      // Additional pre-fill logic if needed
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const db = getDatabase(); // Initialize the database reference
    const productRef = ref(db, `stocks/${product.id}`); // Reference to the specific product in the stocks node
    const restockRef = ref(db, `restock/${product.id}`); // Reference to the restock node for this product

    // Fetch the current stock level for the product
    const productSnapshot = await get(productRef);
    const currentStock = productSnapshot.val()?.quantity || 0;

    // Calculate the new stock after restocking
    const updatedStock = parseInt(currentStock) + parseInt(newStockQuantity);

    // Create a restock log entry
    const restockData = {
      quantityAdded: newStockQuantity,
      expiryDate: expiryDate || 'N/A',
      restockDate: restockDate,
    };

    // Prepare updates
    const updates = {};
    updates[`/stocks/${product.id}/quantity`] = updatedStock; // Update stock quantity
    updates[`/stocks/${product.id}/lastRestocked`] = restockDate; // Update last restock date

    // Push the restock event to the "restock" node under the product
    const restockLogRef = push(restockRef); // Store restock log under the separate "restock" node
    updates[`/restock/${product.id}/${restockLogRef.key}`] = restockData;

    // Execute the updates in Firebase
    await update(ref(db), updates);

    console.log("Restock Data:", restockData);

    // After successfully updating, close the modal
    onClose();
  };

  if (!product) return null; // Do not render if no product is selected

  return (
    <div className="restock-modal-overlay">
      <div className="restock-modal">
        <h2>Restock Product</h2>
        <div className="product-info">
          <p><strong>Product:</strong> {product.name}</p>
          <p><strong>Current Stock:</strong> {product.quantity}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Stock Quantity</label>
            <input
              type="number"
              value={newStockQuantity}
              onChange={(e) => setNewStockQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Restock Date</label>
            <input
              type="date"
              value={restockDate}
              onChange={(e) => setRestockDate(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Confirm Restock</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
