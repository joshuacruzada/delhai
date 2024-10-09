import React, { useState, useEffect } from 'react';
import './Orders.css';
import NewOrderForm from './NewOrderForm';
import { FaFilter } from 'react-icons/fa';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';

const Orders = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  const openNewOrderForm = () => setShowNewOrderForm(true);
  const closeNewOrderForm = () => setShowNewOrderForm(false);

  // Fetching orders from Firebase
  useEffect(() => {
    const ordersRef = ref(database, 'orders/');  // Adjust the path as per your Firebase structure
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orders = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],  // Map the order data
        }));
        console.log(orders);  // Log the data to check if fields exist
        setOrderHistory(orders);
      }
    });
  }, []);

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
            <button className="new-order-button" onClick={openNewOrderForm}>
              New Order
            </button>
          </div>

          {/* Order History Table */}
          <div className="order-history-container">
            {orderHistory.length > 0 ? (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Sold To</th>
                    <th>Address</th>
                    <th>Shipped To</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order) => (
                    <tr key={order.id}>
                      {/* Access fields from buyerInfo */}
                      <td>{order.buyerInfo?.soldTo || 'N/A'}</td>
                      <td>{order.buyerInfo?.address || 'N/A'}</td>
                      <td>{order.buyerInfo?.shippedTo || 'N/A'}</td>
                      <td>₱{order.totalAmount?.toFixed(2) || 'N/A'}</td>
                      <td>{order.status || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-order-history">No order history</div>
            )}
          </div>
        </>
      ) : (
        <NewOrderForm onBackToOrders={closeNewOrderForm} />
      )}
    </div>
  );
};

export default Orders;
