import { ref, get, update } from "firebase/database";
import { database } from "../FirebaseConfig";

export const cancelOrderAndRestock = async (userId, orderId, fetchOrders) => {
  try {
    if (!userId) throw new Error('User not authenticated');

    const orderRef = ref(database, `orders/${userId}/${orderId}`);

    const orderSnapshot = await get(orderRef);
    if (!orderSnapshot.exists()) throw new Error('Order not found');

    const orderData = orderSnapshot.val();
    const products = orderData.products || [];

    const updates = {};
    products.forEach((product) => {
      if (product.id) {
        updates[`stocks/${product.id}/quantity`] = {
          '.sv': {
            increment: product.quantity,
          },
        };
      }
    });

    updates[`orders/${userId}/${orderId}/paymentStatus`] = 'Cancelled';

    await update(ref(database), updates);

    console.log(`Order ${orderId} cancelled and products restocked.`);
    fetchOrders(); // Refresh order list
  } catch (error) {
    console.error('Error cancelling order and restocking:', error.message);
    alert('Failed to cancel order and restock products.');
  }
};
