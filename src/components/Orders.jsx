import React, { useState } from 'react';
import './Orders.css';
import NewOrderForm from './NewOrderForm'; // Import the new component
import { FaFilter } from 'react-icons/fa'; // For the filter icon

const Orders = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);

  const openNewOrderForm = () => setShowNewOrderForm(true);
  const closeNewOrderForm = () => setShowNewOrderForm(false);

  return (
    <div className="orders-section">
      {!showNewOrderForm ? (
        <>
          <h3>Order History</h3>

          <div className="order-controls">
            <input type="text" placeholder="Search" className="search-input" />
            <button className="filter-button">
              <FaFilter />
            </button>
            <button className="new-order-button" onClick={openNewOrderForm}>New Order</button>
          </div>

          {/* Order History Table or No Order Message */}
          <div className="order-history-container">
            <div className="no-order-history">No order history</div>
          </div>
        </>
      ) : (
        <NewOrderForm onBackToOrders={closeNewOrderForm} />
      )}
    </div>
  );
};

export default Orders;
