import React, { useState, useEffect, useCallback } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../FirebaseConfig";
import "./RequestOrder.css";
import { useNavigate } from 'react-router-dom';
import { sendOrderConfirmationEmail } from "../services/requestOrderEmail";
import { IconTrash } from "@tabler/icons-react";
import RequestOrderDetailsModal from "./RequestOrderDetailsModal";
const RequestOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timerData, setTimerData] = useState({});
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

const handleRowClick = (order) => {
  setSelectedOrder(order);
  setModalOpen(true);
};

const closeModal = () => {
  setModalOpen(false);
  setSelectedOrder(null);
};


  /** 🛠️ FETCH ORDERS */useEffect(() => {
  const ordersRef = ref(database, "requestOrders");

  const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
    const ordersData = snapshot.val();
    if (!ordersData) {
      console.warn("No data found in requestOrders node!");
      setOrders([]);
      return;
    }

    // Flatten orders from all users
    const ordersList = Object.entries(ordersData).flatMap(([userId, userOrders]) =>
      Object.entries(userOrders).map(([orderId, orderData]) => ({
        userId,
        orderId,
        status: orderData.status || "N/A",
        createdAt: orderData.createdAt || null,
        expiry: orderData.expiry || null,
        totalAmount: orderData.totalAmount || 0,
        customerName: orderData?.buyerInfo?.name || "N/A", // Include name
        customerEmail: orderData?.buyerInfo?.email || "N/A", // Include email
        customerAddress: orderData?.buyerInfo?.completeAddress || "N/A", // Include address
        buyerInfo: orderData?.buyerInfo || {}, // Pass entire buyerInfo for modal
        order: orderData?.order || [], // Pass the order items
      }))
    );

    setOrders(ordersList);

    // Initialize timers for countdown
    const initialTimers = {};
    ordersList.forEach((order) => {
      initialTimers[order.orderId] = calculateTimeLeft(order.expiry);
    });
    setTimerData(initialTimers);
  });

  return () => unsubscribeOrders();
}, []);


  /** 🛠️ FILTER ORDERS */
  const filterOrders = useCallback(() => {
    const filtered = orders.filter((order) => {
      if (activeFilter === 'all') return true;
      return order.status.toLowerCase() === activeFilter;
    });
    setFilteredOrders(filtered);
  }, [orders, activeFilter]);

  useEffect(() => {
    filterOrders();
  }, [orders, activeFilter, filterOrders]);

  /** 🛠️ FORMAT DATE */
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  /** 🛠️ COUNTDOWN TIMER */
  const calculateTimeLeft = (expiry) => {
    if (!expiry) return "N/A";
    const now = Date.now();
    const timeLeft = expiry - now;

    if (timeLeft <= 0) return "Expired";

    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

 /** 🛠️ REAL-TIME TIMER */
/** 🛠️ REAL-TIME TIMER */
useEffect(() => {
  const timer = setInterval(() => {
    setTimerData((prevTimers) => {
      const updatedTimers = {};
      orders.forEach((order) => {
        if (order.status === "pending") {
          updatedTimers[order.orderId] = calculateTimeLeft(order.expiry);
        } else if (order.status === "confirmed") {
          updatedTimers[order.orderId] = "confirmed";
        } else if (order.status === "unconfirmed") {
          updatedTimers[order.orderId] = "unconfirmed";
        } else if (order.expiry && Date.now() > order.expiry) {
          updatedTimers[order.orderId] = "expired";
        } else {
          updatedTimers[order.orderId] = "N/A";
        }
      });
      return updatedTimers;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [orders]);


  /** 🛠️ AUTO-UPDATE STATUS */
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


  // 🛠️ SEND EMAIL
  const handleSendEmail = async (customerEmail, userId, customerName, totalAmount) => {
    await sendOrderConfirmationEmail(customerEmail, userId, customerName, totalAmount);
  };
  
  

  /** 🛠️ DELETE ORDER */
  const handleDelete = (orderId, userId) => {
    if (userId && orderId) {
      remove(ref(database, `requestOrders/${userId}/${orderId}`))
        .then(() => alert("Order deleted!"))
        .catch((error) => console.error("Error deleting order:", error));
    } else {
      console.error("Invalid userId or orderId");
    }
  };
  

  return (
    <div className="request-orders">
      <div>
        <button onClick={() => navigate('/orders')} className="back-button">
          ← Back to Order List
        </button>
      </div>
      <h3>Request Orders</h3>

      {/* Filtering Tabs */}
      <div className="filter-tabs">
        {["all", "pending", "confirmed", "unconfirmed"].map((status) => (
          <button
            key={status}
            className={`filter-tab ${activeFilter === status ? "active" : ""}`}
            onClick={() => setActiveFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <table className="request-orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expiry</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.orderId} onClick={() => handleRowClick(order)}>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>{timerData[order.orderId] || "N/A"}</td>
                <td>{order.customerName || "N/A"}</td>
                <td>{order.customerEmail || "N/A"}</td>
                <td>₱{order.totalAmount?.toFixed(2) || "0.00"}</td>
                <td>{order.status}</td>
                <td className="actions-container">
                  <button
                    className="request-tab-emailbtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendEmail(order.customerEmail, order.orderId, order.customerName, order.totalAmount);
                    }}
                  >
                    Send Email
                  </button>
                  <button
                    className="request-tab-deletebtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.orderId, order.userId);
                    }}
                  >
                    <IconTrash stroke={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders match the selected filter.</p>
      )}

    <RequestOrderDetailsModal
      isOpen={isModalOpen}
      order={selectedOrder}
      onClose={closeModal}
    />

    </div>
  );
};

export default RequestOrder;
