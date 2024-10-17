import React, { useState, useEffect, useContext } from 'react';
import './Orders.css';
import NewOrderForm from './NewOrderForm';
import { FaFilter } from 'react-icons/fa';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database'; // Added 'off'
import { AuthContext } from '../AuthContext'; // Import AuthContext

const Orders = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const { user } = useContext(AuthContext); // Get the logged-in user from AuthContext

  const openNewOrderForm = () => setShowNewOrderForm(true);
  const closeNewOrderForm = () => setShowNewOrderForm(false);

  // Fetch Orders from Firebase and Filter by User
  useEffect(() => {
    let unsubscribe; // Create a variable for the unsubscribe function

    const fetchOrders = () => {
      const ordersRef = ref(database, 'orders/');
      
      // Listen for real-time updates
      unsubscribe = onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const allOrders = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          // Filter orders: Admins see all, employees only their own orders
          const filteredOrders =
            user?.role === 'admin'
              ? allOrders
              : allOrders.filter((order) => order.userId === user.uid);

          setOrderHistory(filteredOrders);
        } else {
          setOrderHistory([]); // No orders found
        }
      }, (error) => {
        console.error('Error fetching orders:', error);
      });
    };

    if (user) {
      fetchOrders();
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Detach the listener
      }
    };
  }, [user]);

  return (
    <div className="orders-section">
      {!showNewOrderForm ? (
        <>
          <div className="page-header">
            <h3>Order History</h3>
            <div className="order-controls">
              <input type="text" placeholder="Search" className="search-input" />
              <button className="filter-button">
                <FaFilter />
              </button>
              <button className="new-order-button" onClick={openNewOrderForm}>
                + Create Order
              </button>
            </div>
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
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order) => (
                    <tr key={order.id}>
                      <td>{order.buyerInfo?.soldTo || 'N/A'}</td>
                      <td>{order.buyerInfo?.address || 'N/A'}</td>
                      <td>{order.buyerInfo?.shippedTo || 'N/A'}</td>
                      <td>₱{order.totalAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-order-history">No order history available.</div>
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
