import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ref, update, get } from 'firebase/database';
import { database } from '../FirebaseConfig';
import Confetti from 'react-confetti'; // 
import './OrderConfirmation.css'; // Make sure to create this CSS file

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [confirmationStatus, setConfirmationStatus] = useState('Please click confirm to validate your order.');
  const [orderId, setOrderId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false); // 🎉 Trigger confetti

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const userIdParam = searchParams.get('userId');

    if (orderIdParam && userIdParam) {
      setOrderId(orderIdParam);
      setUserId(userIdParam);
      fetchOrderDetails(userIdParam, orderIdParam);
    } else {
      setConfirmationStatus('Invalid order confirmation link.');
    }
  }, [searchParams]);

  // 🛠️ Fetch Order Details
  const fetchOrderDetails = async (userId, orderId) => {
    try {
      const orderRef = ref(database, `requestOrders/${userId}/${orderId}`);
      const snapshot = await get(orderRef);

      if (snapshot.exists()) {
        setOrderDetails(snapshot.val());
      } else {
        setConfirmationStatus('Order not found or invalid.');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setConfirmationStatus('Failed to fetch order details. Please try again later.');
    }
  };

  // 🛠️ Handle Order Confirmation
  const handleConfirmOrder = async () => {
    if (!userId || !orderId) {
      setConfirmationStatus('Invalid user or order ID.');
      return;
    }

    try {
      const orderRef = ref(database, `requestOrders/${userId}/${orderId}`);
      const snapshot = await get(orderRef);

      if (snapshot.exists()) {
        const orderData = snapshot.val();

        if (orderData.status === 'confirmed') {
          setConfirmationStatus('This order is already confirmed.');
        } else {
          await update(orderRef, { status: 'confirmed' });
          setConfirmationStatus(' Your order has been successfully confirmed!');
          setShowConfetti(true); 
        }
      } else {
        setConfirmationStatus('Order not found or invalid.');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      setConfirmationStatus('Failed to confirm the order. Please try again later.');
    }
  };

  return (
    <div className="order-confirmation-container">
      {showConfetti && <Confetti />}

      <div className="confirmation-card">
        <h2> Order Confirmation</h2>
        <p className={`status-message ${showConfetti ? 'confirmation-success-message' : ''}`}>
          {confirmationStatus}
        </p>

        {orderDetails && (
          <div className="order-details">
            <h6><strong>Buyer Details:</strong></h6>
            <p><strong>Name:</strong> {orderDetails?.buyerInfo?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {orderDetails?.buyerInfo?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {orderDetails?.buyerInfo?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> {orderDetails?.buyerInfo?.completeAddress || 'N/A'}</p>
            

            {/* Display Order Items */}
            <h6><strong>Items Ordered:</strong></h6>
            {orderDetails?.order?.length > 0 ? (
              <div className="clean-order-items">
                {orderDetails.order.map((item, index) => (
                  <p key={index}>
                    {item.name} × {item.quantity} - ₱{item.price}
                  </p>
                ))}
                <p><strong>Total Amount:</strong> ₱{orderDetails?.totalAmount || '0.00'}</p>
              </div>
            ) : (
              <p>No items in this order.</p>
            )}
          </div>
        )}


        <button 
          onClick={handleConfirmOrder}
          className="confirm-button"
        >
          Confirm Order 
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
