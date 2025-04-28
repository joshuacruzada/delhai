import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import './MyPurchasePage.css';

const MyPurchasePage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const ordersRef = ref(database, `sales/${currentUser.uid}`);
        const snapshot = await get(ordersRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedPurchases = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          formattedPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));
          setPurchases(formattedPurchases);
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const handleBuyAgain = (productId) => {
    navigate(`/productdetail/${productId}`);
  };

  return (
    <div className="my-purchase-page">
      <h4>My Purchases</h4>
      {loading ? (
        <p>Loading your purchases...</p>
      ) : purchases.length === 0 ? (
        <div className="purchase-history-placeholder">
          <p>No purchases found yet.</p>
        </div>
      ) : (
        <div className="purchase-history-list">
          {purchases.map((purchase) => (
            purchase.products?.map((product, idx) => (
              <div key={idx} className="purchase-card">
                {/* LEFT SIDE */}
                <div className="purchase-left">
                  <img
                    src={product.imageUrl || '/placeholder.png'}
                    alt={product.name}
                    className="purchase-product-image"
                  />
                  <div className="purchase-product-details">
                    <h4 className="purchase-product-name">{product.name}</h4>
                    <p className="purchase-product-qty">Qty: {product.quantity}x</p>
                    <p className="purchase-product-date">
                      {new Date(purchase.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="purchase-right">
                  <p className="purchase-product-price">₱{(product.price || 0).toFixed(2)}</p>
                  <p className="purchase-order-total"><strong>₱{(purchase.totalAmount || 0).toFixed(2)}</strong></p>
                  <button
                    className="buy-again-btn"
                    onClick={() => handleBuyAgain(product.id)}
                  >
                    Buy Again
                  </button>
                </div>
              </div>
            ))
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchasePage;
