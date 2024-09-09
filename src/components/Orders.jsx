import React, { useState } from 'react';
import './Orders.css';
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customer: '',
    product: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Handler for adding a new order
  const handleAddOrder = (e) => {
    e.preventDefault();
    const order = {
      id: orders.length + 1, // Generate unique ID
      ...newOrder
    };
    setOrders([...orders, order]);
    setNewOrder({
      customer: '',
      product: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  return (
    <div className="orders-section">
      <h3>Order Management</h3>

      {/* Form to add new orders */}
      <form className="new-order-form" onSubmit={handleAddOrder}>
        <label>
          Customer:
          <input
            type="text"
            name="customer"
            value={newOrder.customer}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Product:
          <input
            type="text"
            name="product"
            value={newOrder.product}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            name="quantity"
            value={newOrder.quantity}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={newOrder.date}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit">Add Order</button>
      </form>

      {/* Order History */}
      <h4>Order History</h4>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.product}</td>
              <td>{order.quantity}</td>
              <td>{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
