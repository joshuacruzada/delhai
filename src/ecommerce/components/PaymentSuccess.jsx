import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { database } from "../../FirebaseConfig";
import { ref, push, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const rawData = localStorage.getItem("checkoutData");
    if (!rawData) return;

    const orderData = JSON.parse(rawData);

    const orderRef = ref(database, `orders/${user.uid}`);
    const newOrderRef = push(orderRef);

    const payload = {
      createdAt: new Date().toISOString(),
      customerId: user.uid, // used in lookup
      paymentStatus: "Paid",
      totalAmount: orderData.totalAmount,
      products: orderData.products,
    };

    const customerInfo = {
      name: user.displayName || "Walk-in Customer",
      email: user.email || "",
      completeAddress: orderData.shippingAddress || "N/A",
      // optionally add: poNo, tin, salesman, etc.
    };

    Promise.all([
      set(newOrderRef, payload),
      set(ref(database, `customers/${user.uid}/${user.uid}`), customerInfo),
    ])
      .then(() => {
        console.log("✅ Order + customer stored");
        localStorage.removeItem("checkoutData");
        setTimeout(() => navigate("/"), 3000);
      })
      .catch((err) => console.error("❌ Failed storing data:", err));
  }, [navigate, auth.currentUser]);

  return (
    <div className="success-page">
      <h1>✅ Payment Successful!</h1>
      <p>Your order has been placed.</p>
      <p>Redirecting...</p>
    </div>
  );
};

export default PaymentSuccess;
