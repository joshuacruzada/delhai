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
    const ordersRef = ref(database, `requestOrders`);
    const snapshot = await get(ordersRef);

    if (!snapshot.exists()) {
      console.warn("⚠️ Firebase Snapshot: No order details found.");
      alert("⚠️ No order details found.");
      return;
    }

    const allOrders = snapshot.val();

    let matchingOrder = null;
    let matchingOrderId = null;
    let matchingUserId = null;

    for (const userId in allOrders) {
      const userOrders = allOrders[userId];
      if (!userOrders) continue;

      for (const orderId in userOrders) {
        const order = userOrders[orderId];
        if (!order || !order.buyerInfo) continue;

        if (order.buyerInfo.email === customerEmail) {
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

    const orderSummary = (matchingOrder.order || [])
      .map((item) => `${item.name || "N/A"} x ${item.quantity || 0} - ₱${item.price || 0}`)
      .join("\n");

    const confirmationLink = `${window.location.origin}/confirm-order?userId=${matchingUserId}&orderId=${matchingOrderId}`;
    const customerName = matchingOrder?.buyerInfo?.name || "Valued Customer";

    const templateParams = {
      to_name: customerName,
      to_email: customerEmail,
      order_summary: orderSummary || "No items in order.",
      total_amount: `₱${(matchingOrder?.totalAmount || 0).toFixed(2)}`,
      confirmation_link: confirmationLink,
      from_name: "Delhai Medical Center",
    };

    console.log("📧 Sending Email with Template Params:", templateParams);

    const response = await emailjs.send(
      "service_xbzwe8f",
      "template_fppn99s",
      templateParams,
      "Eaa7gEQkmCzf4Prdz"
    );

    console.log("✅ Email sent successfully:", response);
    alert(`✅ Confirmation email successfully sent to ${customerEmail}`);
  } catch (error) {
    if (error.response) {
      console.error("EmailJS Error Response:", error.response);
    } else {
      console.error("EmailJS Error:", error.message);
    }
    alert("❌ Failed to send confirmation email. Please try again.");
  }
};