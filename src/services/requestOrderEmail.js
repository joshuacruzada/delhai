import { ref, get } from "firebase/database";
import { database } from "../FirebaseConfig";
import emailjs from "emailjs-com";

/**
 * Sends an order confirmation email with order details and a confirmation link.
 * @param {string} customerEmail - The recipient's email address.
 * @param {string} totalAmount - The total order amount.
 */
export const sendOrderConfirmationEmail = async (customerEmail, totalAmount) => {
  if (!customerEmail) {
    alert("❌ Customer email not available.");
    return;
  }

  try {
    // 📡 Fetch all `requestOrders`
    const ordersRef = ref(database, `requestOrders`);
    console.log(`📡 Fetching all orders from path: requestOrders`);

    const snapshot = await get(ordersRef);

    if (!snapshot.exists()) {
      console.warn("⚠️ Firebase Snapshot: No order details found.");
      alert("⚠️ No order details found.");
      return;
    }

    const allOrders = snapshot.val();
    console.log("✅ All Orders Fetched:", allOrders);

    // 🔍 Find the first matching order by customerEmail
    let matchingOrder = null;
    let matchingOrderId = null;
    let matchingUserId = null;

    for (const userId in allOrders) {
      for (const orderId in allOrders[userId]) {
        const order = allOrders[userId][orderId];
        if (order.email === customerEmail) {
          matchingOrder = order;
          matchingOrderId = orderId;
          matchingUserId = userId;
          break;
        }
      }
      if (matchingOrder) break;
    }

    if (!matchingOrder) {
      console.warn("⚠️ No matching order found for the provided customer email.");
      alert("⚠️ No matching order found for this email.");
      return;
    }

    console.log("✅ Matching Order Found:", matchingOrder);

    // 🛍️ Build Order Summary
    const orderSummary = (matchingOrder.order || [])
      .map((item) => `${item.name || 'N/A'} x ${item.quantity || 0} - ₱${item.price || 0}`)
      .join("\n");

    console.log("✅ Order Summary:", orderSummary);

    // 🔗 Generate Confirmation Link
    const confirmationLink = `${window.location.origin}/confirm-order?userId=${matchingUserId}&orderId=${matchingOrderId}`;
    console.log("🔗 Confirmation Link:", confirmationLink);

    // 🔄 Fetch Customer Details from `customers` Node
    const customerRef = ref(database, `customers/${matchingUserId}`);
    const customerSnapshot = await get(customerRef);

    if (!customerSnapshot.exists()) {
      console.warn("⚠️ No customer details found for this userId.");
      alert("⚠️ Customer details not found.");
      return;
    }

    const customerDetails = customerSnapshot.val();
    const customerName = customerDetails.name || "Valued Customer";

    console.log("✅ Customer Details Fetched:", customerDetails);

    // 📧 Prepare Email Template
    const templateParams = {
      to_name: customerName, // Use fetched customer name
      to_email: customerEmail,
      order_summary: orderSummary || "No order details available.",
      total_amount: `₱${(matchingOrder.totalAmount || 0).toFixed(2)}`,
      confirmation_link: confirmationLink,
      from_name: "Delhai Medical Center",
    };

    console.log("📧 Sending Email with Template Params:", templateParams);

    // 📤 Send the email using the correct template ID
    await emailjs.send(
      "service_xbzwe8f",   // Email service ID
      "template_fppn99s",  // Updated Email template ID
      templateParams,
      "Eaa7gEQkmCzf4Prdz"  // Email public key
    );

    console.log("✅ Email successfully sent with details:", templateParams);
    alert(`✅ Confirmation email successfully sent to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Failed to fetch order details or send email:", error);
    alert("❌ Failed to send confirmation email. Please try again.");
  }
};
