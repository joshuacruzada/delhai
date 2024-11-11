import React, { useState, useEffect, useContext } from 'react';
import './Orders.css';
import NewOrderForm from './NewOrderForm';
import { FaFilter } from 'react-icons/fa';
import { database } from '../FirebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { AuthContext } from '../AuthContext';

const Orders = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const { user } = useContext(AuthContext);

  const openNewOrderForm = () => setShowNewOrderForm(true);
  const closeNewOrderForm = () => setShowNewOrderForm(false);

  useEffect(() => {
    // Fetch orders from the database on component mount or user change
    const fetchOrders = () => {
      const ordersRef = ref(database, 'orders/');
      onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const allOrders = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          const filteredOrders =
            user?.role === 'admin'
              ? allOrders
              : allOrders.filter((order) => order.userId === user.uid);

          setOrderHistory(filteredOrders);
        } else {
          setOrderHistory([]);
        }
      });
    };

    if (user) fetchOrders();
  }, [user]);

  // Update payment status in the centralized paymentStatus node only
  const updatePaymentStatus = async (orderId, newStatus) => {
    const orderRef = ref(database, `orders/${orderId}`);

    try {
      // Update the payment status in the orders node
      await update(orderRef, { paymentStatus: newStatus });
      console.log(`Order ${orderId} payment status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

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

          <div className="order-history-container">
            {orderHistory.length > 0 ? (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Sold To</th>
                    <th>Address</th>
                    <th>Shipped To</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order) => (
                    <tr key={order.id}>
                      <td>{order.buyerInfo?.soldTo || 'N/A'}</td>
                      <td>{order.buyerInfo?.address || 'N/A'}</td>
                      <td>{order.buyerInfo?.shippedTo || 'N/A'}</td>
                      <td>₱{order.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td className={`status ${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                        {order.paymentStatus || 'Pending'}
                      </td>
                      <td>
                        <button
                          className="action-button btn-paid"
                          onClick={() => updatePaymentStatus(order.id, 'Paid')}
                          disabled={order.paymentStatus === 'Paid'}
                        >
                          Paid
                        </button>
                        <button
                          className="action-button btn-unpaid"
                          onClick={() => updatePaymentStatus(order.id, 'Unpaid')}
                          disabled={order.paymentStatus === 'Unpaid'}
                        >
                          Unpaid
                        </button>
                      </td>
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
