import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { remove, ref } from "firebase/database";
import { database } from "../../FirebaseConfig";
import "./PaymentSuccess.css";
import { completeOrderProcess } from "../../services/orderUtils";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const hasSaved = useRef(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saveOrder = async () => {
      if (hasSaved.current) return;
      hasSaved.current = true;

      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const rawData = localStorage.getItem("checkoutData");
      if (!rawData) {
        console.log("No checkout data found. Skipping order creation.");
        return;
      }

      const orderData = JSON.parse(rawData);

      // 🔥 Build buyerInfo properly
      const buyerInfo = {
        name: currentUser.displayName || "Walk-in Customer",
        email: currentUser.email || "",
        street: "N/A", // No street info from Firebase Auth
        barangay: "N/A",
        city: "N/A",
        province: "N/A",
        zipCode: "N/A",
        tin: "N/A",
        drNo: "N/A",
        poNo: "N/A",
        terms: "N/A",
        shippedTo: "N/A",
        salesman: "N/A",
      };

      try {
        // 🔥 Call completeOrderProcess
        await completeOrderProcess(
          buyerInfo,
          orderData.products,
          orderData.totalAmount,
          [], // Empty products array for now
          () => {}, // Dummy setProducts function
          currentUser.uid
        );

        // 🔥 Remove cart items after successful order
        if (Array.isArray(orderData.products)) {
          const removalPromises = orderData.products.map(async (product) => {
            const productId = product.id || product.productId || null;
            if (productId) {
              await remove(ref(database, `users/${currentUser.uid}/cart/${productId}`));
            }
          });

          await Promise.all(removalPromises);
        }

        // ✅ SET order info to show success page
        setOrderInfo({ customerInfo: buyerInfo, orderData });
        localStorage.removeItem("checkoutData");
        localStorage.removeItem("cartItems");

        console.log("✅ Order process completed successfully!");

      } catch (error) {
        console.error("❌ Payment Success Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    saveOrder();
  }, [navigate]);

  if (loading) {
    return <div className="success-page">Loading...</div>;
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✔️</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your payment. Your order is being processed.</p>

        {orderInfo && (
          <div className="order-info">
            <h4>Order Details:</h4>
            <p><strong>Customer:</strong> {orderInfo.customerInfo.name}</p>
            <p><strong>Address:</strong> {orderInfo.customerInfo.street}</p>
            <p><strong>Total Amount:</strong> ₱{orderInfo.orderData.totalAmount.toFixed(2)}</p>
            <div className="order-products">
              <h5>Products:</h5>
              <ul>
                {orderInfo.orderData.products.map((product, index) => (
                  <li key={index}>
                    {product.name} - {product.quantity} pcs - ₱{(product.amount / 100).toFixed(2)} each
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={() => navigate("/")}
                  className="home-button"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
