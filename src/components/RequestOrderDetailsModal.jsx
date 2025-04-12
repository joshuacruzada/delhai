import React from "react";
import { useNavigate } from "react-router-dom";
import "./OrderDetailsModal.css";
import "./RequestOrderDetailModal.css";

const RequestOrderDetailsModal = ({ isOpen, order, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  const handleCreateOrder = () => {

  
    // Example: Add validation (if required)
    if (!order || !order.order?.length) {
      alert("Cannot create order. No items available.");
      return;
    }
  
    // Navigate to the New Order Form route with the order data
    navigate("/new-order-form", { state: { order } });
    onClose(); // Close the modal
  };
  

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="order-modal-header">
          <h2 className="order-modal-title">Request Order Details</h2>
          <span className={`order-modal-status status-${order.status?.toLowerCase()}`}>
            {order.status || "N/A"}
          </span>
        </div>

        {/* CUSTOMER INFO */}
        <div className="order-modal-info">
          <div className="info-left">
            <p><strong>NAME:</strong> {order.buyerInfo?.name || "N/A"}</p>
            <p><strong>EMAIL:</strong> {order.buyerInfo?.email || "N/A"}</p>
            <p><strong>PHONE:</strong> {order.buyerInfo?.phone || "N/A"}</p>
            <p><strong>ADDRESS:</strong> {order.buyerInfo?.completeAddress || "N/A"}</p>
            <p><strong>TIN NO.:</strong> {order.buyerInfo?.tin || "N/A"}</p>
          </div>
          <div className="info-right">
            <p><strong>DATE:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US") : "N/A"}</p>
            <p><strong>TERMS:</strong> {order.buyerInfo?.terms || "N/A"}</p>
            <p><strong>P.O NO.:</strong> {order.buyerInfo?.poNo || "N/A"}</p>
            <p><strong>DR NO.:</strong> {order.buyerInfo?.drNo || "N/A"}</p>
            <p><strong>SALESMAN:</strong> {order.buyerInfo?.salesman || "N/A"}</p>
          </div>
        </div>

        {/* ORDER INFORMATION */}
        <h3 className="order-modal-section-title">Order Information</h3>
        <div className="order-modal-items">
          {order.order?.length > 0 ? (
            order.order.map((item, index) => (
              <div key={index} className="order-modal-item">
                <div className="product-image-container">
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.name || "Product Image"}
                    className="product-image"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                </div>
                <p className="product-name">{item.name || "N/A"}</p>
                <p className="product-quantity">x{item.quantity || 0}</p>
                <p className="product-unit-price">₱{item.price?.toFixed(2) || "0.00"}</p>
                <p className="product-net-amount">₱{(item.quantity * item.price)?.toFixed(2) || "0.00"}</p>
              </div>
            ))
          ) : (
            <p className="no-products">No order items available.</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="order-modal-footer">
          <div className="footer-total">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">₱{order.totalAmount?.toFixed(2) || "0.00"}</span>
          </div>

          {/* Create Order Button */}
          {order.status === "confirmed" && (
            <button className="add-order-btn" onClick={handleCreateOrder}>
              Create Order
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default RequestOrderDetailsModal;
