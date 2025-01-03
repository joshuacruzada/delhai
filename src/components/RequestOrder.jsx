import React, { useState, useEffect } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../FirebaseConfig";
import "./RequestOrder.css";

const RequestOrder = () => {
  const [orders, setOrders] = useState([]);
  const [timerData, setTimerData] = useState({});

  // Fetch Orders and Customer Details
  useEffect(() => {
    const ordersRef = ref(database, "requestOrders");
    const customersRef = ref(database, "customers");

    onValue(ordersRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (!ordersData) {
        console.warn("No data found in requestOrders node!");
        setOrders([]);
        return;
      }

      const ordersList = Object.entries(ordersData).flatMap(([userId, userOrders]) =>
        Object.entries(userOrders).map(([orderId, orderData]) => ({
          userId,
          orderId,
          status: orderData.status || "N/A",
          createdAt: orderData.createdAt || null,
          expiry: orderData.expiry || null,
          totalAmount: orderData.totalAmount || 0,
        }))
      );

      // Fetch Customer Details
      onValue(customersRef, (customerSnapshot) => {
        const customersData = customerSnapshot.val() || {};

        const enrichedOrders = ordersList.map((order) => {
          const userCustomers = customersData[order.userId] || {};
          const customerDetails = Object.values(userCustomers)[0] || {};

          return {
            ...order,
            customerName: customerDetails.name || "N/A",
            customerPhone: customerDetails.phone || "N/A",
            customerAddress: customerDetails.completeAddress || "N/A",
          };
        });

        // Filter Pending/Unconfirmed Orders
        const filteredOrders = enrichedOrders.filter(
          (order) => order.status === "pending" || order.status === "unconfirmed"
        );

        setOrders(filteredOrders);

        // Initialize timers for each order
        const initialTimers = {};
        filteredOrders.forEach((order) => {
          initialTimers[order.orderId] = calculateTimeLeft(order.expiry);
        });
        setTimerData(initialTimers);
      });
    });
  }, []);

  // Format CreatedAt Date (Display Date as Stored in Database)
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const datePart = dateString.split("T")[0];
    const date = new Date(datePart);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Countdown Timer for Expiry
  const calculateTimeLeft = (expiry) => {
    if (!expiry) return "N/A";
    const now = Date.now();
    const timeLeft = expiry - now;

    if (timeLeft <= 0) {
      return "Expired";
    }

    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Real-time Timer for Each Order
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerData((prevTimers) => {
        const updatedTimers = {};
        orders.forEach((order) => {
          updatedTimers[order.orderId] = calculateTimeLeft(order.expiry);
        });
        return updatedTimers;
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [orders]);

  // Automatic Status Update for Expired Orders
  useEffect(() => {
    const timer = setInterval(() => {
      orders.forEach((order) => {
        if (order.expiry && Date.now() > order.expiry && order.status === "pending") {
          update(ref(database, `requestOrders/${order.userId}/${order.orderId}`), {
            status: "unconfirmed",
          });
          console.log(`Order ${order.orderId} marked as 'unconfirmed' due to expiry.`);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orders]);

  // Send SMS Action
  const handleSendSMS = (customerPhone, orderId) => {
    if (!customerPhone) {
      alert("Customer phone number not available.");
      return;
    }
    console.log(`SMS sent to ${customerPhone} for order ${orderId}`);
    alert(`SMS sent to ${customerPhone} for order confirmation.`);
  };

  // Cancel Order
  const handleCancel = (orderId, userId) => {
    update(ref(database, `requestOrders/${userId}/${orderId}`), { status: "cancelled" });
    alert("Order cancelled!");
  };

  // Delete Order
  const handleDelete = (orderId, userId) => {
    remove(ref(database, `requestOrders/${userId}/${orderId}`));
    alert("Order deleted!");
  };

  return (
    <div className="request-orders">
      <h3>Request Orders</h3>
      {orders.length > 0 ? (
        <table className="request-orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expiry</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(
              ({
                orderId,
                customerName,
                customerPhone,
                createdAt,
                expiry,
                totalAmount,
                status,
                userId,
              }) => (
                <tr key={orderId}>
                  <td>{formatDateTime(createdAt)}</td>
                  <td>{timerData[orderId] || "N/A"}</td>
                  <td>{customerName || "N/A"}</td>
                  <td>{customerPhone || "N/A"}</td>
                  <td>₱{totalAmount?.toFixed(2) || "0.00"}</td>
                  <td>{status}</td>
                  <td>
                    <button
                      className="btn-sms"
                      onClick={() => handleSendSMS(customerPhone, orderId)}
                    >
                      Send SMS
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(orderId, userId)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(orderId, userId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <p>No pending or unconfirmed request orders found.</p>
      )}
    </div>
  );
};

export default RequestOrder;
