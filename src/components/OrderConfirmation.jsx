import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ref, update, get } from 'firebase/database';
import { database } from '../FirebaseConfig';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [confirmationStatus, setConfirmationStatus] = useState('Please click confirm to validate your order.');
  const [orderId, setOrderId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const userIdParam = searchParams.get('userId');

    if (orderIdParam && userIdParam) {
      setOrderId(orderIdParam);
      setUserId(userIdParam);
    } else {
      setConfirmationStatus('Invalid order confirmation link.');
    }
  }, [searchParams]);

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
          setConfirmationStatus('Your order has been successfully confirmed!');
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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Order Confirmation</h2>
      <p>{confirmationStatus}</p>
      {orderId && <p><strong>Order ID:</strong> {orderId}</p>}
      {userId && <p><strong>User ID:</strong> {userId}</p>}
      <button 
        onClick={handleConfirmOrder}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Confirm Order
      </button>
    </div>
  );
};

export default OrderConfirmation;
