import React from 'react';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="order-modal-header">
          <h2 className="order-modal-title">Order Details</h2>
          <span className={`order-modal-status status-${order.paymentStatus?.toLowerCase()}`}>
            {order.paymentStatus || 'N/A'}
          </span>
        </div>

        {/* ORDER INFO */}
        <div className="order-modal-info">
          <div className="info-left">
            <p><strong>NAME:</strong> {order.customerName || 'N/A'}</p>
            <p><strong>ADDRESS:</strong> {order.customerAddress || 'N/A'}</p>
            <p><strong>TIN NO:</strong> {order.tin || 'N/A'}</p>
            <p><strong>SHIPPED TO:</strong> {order.shippedTo || ''}</p>
            <p><strong>DR. NO.:</strong> {order.drNo || 'N/A'}</p>
          </div>
          <div className="info-right">
          <p><strong>DATE:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\//g, '-') : 'N/A'}</p>

            <p><strong>TERMS:</strong> {order.terms || 'N/A'}</p>
            <p><strong>SALESMAN:</strong> {order.salesman || 'N/A'}</p>
            <p><strong>P.O NO.:</strong> {order.poNo || 'N/A'}</p>
          </div>
        </div>

        {/* ORDER INFORMATION */}
        <h3 className="order-modal-section-title">Order Information</h3>
        <div className="order-modal-items">
          {order.products?.length > 0 ? (
            order.products.map((product, index) => (
              <div key={index} className="order-modal-item">
                <div className="product-image-container">
                <img 
                  src={product.imageUrl || '/placeholder.png'} 
                  alt={product.name || 'Product Image'} 
                  className="product-image"
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
                </div>
                <p className="product-name">{product.name || 'N/A'}</p>
                <p className="product-quantity">x{product.quantity || 0}</p>
                <p className="product-unit-price">₱{product.price?.toFixed(2) || '0.00'}</p>
                <p className="product-net-amount">₱{(product.quantity * product.price)?.toFixed(2) || '0.00'}</p>
              </div>
            ))
          ) : (
            <p className="no-products">No product details available.</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="order-modal-footer">
          <div className="footer-total">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">₱{order.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
