import React, { useState, useEffect, useContext } from 'react';
import './Orders.css';
import NewOrderForm from './NewOrderForm';
import {FaCheck, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { database } from '../FirebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { AuthContext } from '../AuthContext';

const Orders = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { user } = useContext(AuthContext);

  const openNewOrderForm = () => setShowNewOrderForm(true);
  const closeNewOrderForm = () => setShowNewOrderForm(false);

  // Fetch orders from the database
  useEffect(() => {
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
          setFilteredOrders(filteredOrders); // Initialize filtered orders
        } else {
          setOrderHistory([]);
          setFilteredOrders([]);
        }
      });
    };

    if (user) fetchOrders();
  }, [user]);

  // Update payment status
  const updatePaymentStatus = async (orderId, newStatus) => {
    const orderRef = ref(database, `orders/${orderId}`);

    try {
      await update(orderRef, { paymentStatus: newStatus });
      console.log(`Order ${orderId} payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  // Delete an order
  const deleteOrder = async (orderId) => {
    const orderRef = ref(database, `orders/${orderId}`);

    try {
      await remove(orderRef);
      console.log(`Order ${orderId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Open delete modal
  const openDeleteModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (selectedOrderId) {
      deleteOrder(selectedOrderId);
      setShowDeleteModal(false);
      setSelectedOrderId(null);
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedOrderId(null);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    filterOrders(e.target.value.toLowerCase(), filterStatus);
  };

  // Handle filter dropdown change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    filterOrders(searchTerm, e.target.value);
  };

  // Filter orders based on search term and payment status
  const filterOrders = (search, status) => {
    const filtered = orderHistory.filter((order) => {
      const matchesStatus =
        status === 'All' || order.paymentStatus === status;
      const matchesSearch =
        order.buyerInfo?.soldTo.toLowerCase().includes(search) ||
        order.buyerInfo?.address.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
    setFilteredOrders(filtered);
  };

  return (
    <div className="orders-section">
      {!showNewOrderForm ? (
        <>
          <div className="page-header">
            <h3>Order History</h3>
            <div className="order-controls">
              <input
                type="text"
                placeholder="Search"
                className="order-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <select
                className="order-filter-dropdown"
                value={filterStatus}
                onChange={handleFilterChange}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
              </select>
              <button className="new-order-button" onClick={openNewOrderForm}>
                + Create Order
              </button>
            </div>
          </div>

          <div className="order-history-container">
            {filteredOrders.length > 0 ? (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sold To</th>
                    <th>Address</th>
                    <th>Shipped To</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt)
                              .toLocaleDateString('en-US', {
                                year: '2-digit',
                                month: '2-digit',
                                day: '2-digit',
                              })
                              .replace(/\//g, '-')
                          : 'N/A'}
                      </td>
                      <td>{order.buyerInfo?.soldTo || 'N/A'}</td>
                      <td>{order.buyerInfo?.address || 'N/A'}</td>
                      <td>{order.buyerInfo?.shippedTo || 'N/A'}</td>
                      <td>₱{order.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td
                        className={`status ${
                          order.paymentStatus?.toLowerCase() || 'pending'
                        }`}
                      >
                        {order.paymentStatus || 'Pending'}
                      </td>
                      <td>
                        <div className="actions-container">
                          <div className="action-buttons">
                            <button
                              className="action-button btn-paid"
                              onClick={() =>
                                updatePaymentStatus(order.id, 'Paid')
                              }
                              disabled={order.paymentStatus === 'Paid'}
                            >
                              <FaCheck style={{ marginRight: '5px' }} />
                              Paid
                            </button>
                            <button
                              className="action-button btn-unpaid"
                              onClick={() =>
                                updatePaymentStatus(order.id, 'Unpaid')
                              }
                              disabled={order.paymentStatus === 'Unpaid'}
                            >
                              <FaTimes style={{ marginRight: '5px' }} />
                              Unpaid
                            </button>
                          </div>
                          <button
                            className="action-button btn-delete"
                            onClick={() => openDeleteModal(order.id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-order-history">
                No order history available.
              </div>
            )}
          </div>
        </>
      ) : (
        <NewOrderForm onBackToOrders={closeNewOrderForm} />
      )}

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this order?</p>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={confirmDelete}>
                Yes
              </button>
              <button className="btn-cancel" onClick={closeDeleteModal}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
