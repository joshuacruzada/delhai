import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../FirebaseConfig";
import "./RequestOrder.css";

const RequestOrder = ({ userId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const ordersRef = ref(database, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const userOrders = Object.entries(data || {}).filter(
        ([, order]) => order.userId === userId && order.status === 'waiting_for_customer'
      );
      setOrders(userOrders);
    });
  }, [userId]);

  const handleConfirm = (orderId) => {
    update(ref(database, `orders/${orderId}`), { status: 'confirmed' });
    alert('Order confirmed!');
  };

  const handleCancel = (orderId) => {
    update(ref(database, `orders/${orderId}`), { status: 'cancelled' });
    alert('Order cancelled!');
  };

  return (
    <div className="request-orders">
      <h3>Request Orders</h3>
      {orders.length > 0 ? (
        <table className="request-orders-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(([id, order]) => (
              <tr key={id}>
                <td>{order.customerName || "N/A"}</td>
                <td>{order.customerPhone || "N/A"}</td>
                <td>
                  {order.items
                    ? order.items.map((item) => (
                        <p key={item.id}>
                          {item.productName} - {item.quantity}
                        </p>
                      ))
                    : "No items"}
                </td>
                <td>
                  <button
                    className="btn-confirm"
                    onClick={() => handleConfirm(id)}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancel(id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending request orders found.</p>
      )}
    </div>
  );
};

export default RequestOrder;
