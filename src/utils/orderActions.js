// src/utils/orderActions.js
import { ref, update, get, set, push } from 'firebase/database';
import { database } from '../FirebaseConfig';


// 🟢 Handle Paid Order

export const handlePaidOrder = async (userId, orderId) => {
  const orderRef = ref(database, `orders/${userId}/${orderId}`);
  const salesRef = ref(database, `sales/${userId}`); // Sales Node Reference

  try {
    // Fetch Order Data
    const orderSnapshot = await get(orderRef);
    if (!orderSnapshot.exists()) {
      throw new Error("Order not found");
    }

    const orderData = orderSnapshot.val();

    // Fetch Customer Details
    const customerId = orderData.customerId || null;
    let customerName = "N/A";
    let customerAddress = "N/A";

    if (customerId) {
      const customerRef = ref(database, `customers/${userId}/${customerId}`);
      const customerSnapshot = await get(customerRef);
      if (customerSnapshot.exists()) {
        const customerData = customerSnapshot.val();
        customerName = customerData.name || "N/A";
        customerAddress = customerData.completeAddress || "N/A";
      }
    }

    // Step 1: Update order status to Paid
    await update(orderRef, { paymentStatus: "Paid" });

    // Step 2: Log stock-out for each product
    for (const product of orderData.products || []) {
      if (!product.id) continue;

      const productRef = ref(database, `stocks/${product.id}`);
      const productSnapshot = await get(productRef);

      if (productSnapshot.exists()) {
        const stockData = productSnapshot.val();
        const deductionLog = stockData.deductionLog || {};
        const stockHistory = stockData.stockHistory || {};

        // Log stock-out for each batch in the deductionLog
        for (const logId in deductionLog) {
          const deductionEntry = deductionLog[logId];

          if (!deductionEntry.loggedAsOut && deductionEntry.deductedQuantity > 0) {
            // Only log if there is actually a quantity deducted
            const batchId = deductionEntry.batchId;
            const expiryDate = stockHistory[batchId]?.expiryDate || "N/A";

            // Log stock-out in stockOutHistory
            const stockOutRef = push(
              ref(database, `stocks/${product.id}/stockOutHistory`)
            );
            await set(stockOutRef, {
              type: "OUT",
              batchId: batchId,
              orderId: deductionEntry.orderId,
              date: deductionEntry.timestamp,
              quantityRemoved: deductionEntry.deductedQuantity,
              expiryDate: expiryDate, // Fetch dynamically from stockHistory
            });

            console.log(
              `✅ Logged stock-out for Batch ID: ${batchId}, Quantity Removed: ${deductionEntry.deductedQuantity}, Expiry Date: ${expiryDate}`
            );

            // Mark the deductionLog entry as logged
            await update(
              ref(
                database,
                `stocks/${product.id}/deductionLog/${logId}`
              ),
              { loggedAsOut: true }
            );
          }
        }
      }
    }

    // Step 3: Add order to Sales Node
    const saleEntryRef = push(salesRef);
    await set(saleEntryRef, {
      orderId: orderId,
      totalAmount: orderData.totalAmount || 0,
      date: new Date().toISOString(),
      products: orderData.products || [],
      customerName: customerName,
      customerAddress: customerAddress,
    });

    console.log(
      `✅ Order ${orderId} marked as Paid, sales recorded, and stock-out logged.`
    );
  } catch (error) {
    console.error("❌ Error handling Paid order:", error.message);
  }
};





// 🟠 Handle Cancelled Order
/*export const handleCancelledOrder = async (userId, orderId) => {
    const orderRef = ref(database, `orders/${userId}/${orderId}`);
    
    try {
      // Fetch the order details
      const orderSnapshot = await get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error("Order not found");
      }
  
      const orderData = orderSnapshot.val();
  
      // Step 1: Update order status to "Cancelled"
      await update(orderRef, { paymentStatus: "Cancelled" });
  
      // Step 2: Restore stock quantities
      for (const product of orderData.products || []) {
        if (!product.id) {
          console.warn("⚠️ Product ID missing in order data. Skipping...");
          continue;
        }
  
        const productRef = ref(database, `stocks/${product.id}`);
        const productSnapshot = await get(productRef);
  
        if (productSnapshot.exists()) {
          const stockData = productSnapshot.val();
          const currentStock = stockData.quantity || 0;
          const quantityToRestore = product.quantity || 0;
          const newStock = currentStock + quantityToRestore;
  
          // Update stock with the new quantity
          await update(productRef, { quantity: newStock });
  
          console.log(
            `✅ Restocked product "${stockData.name}" (ID: ${product.id}) with quantity: ${quantityToRestore}. New stock: ${newStock}`
          );
        } else {
          console.warn(`⚠️ Product with ID "${product.id}" not found in stocks.`);
        }
      }
  
      console.log(`✅ Order ${orderId} marked as Cancelled, stock restored successfully.`);
    } catch (error) {
      console.error("❌ Error handling Cancelled order:", error.message);
    }
  };

// 🔴 Handle Unpaid Order
export const handleUnpaidOrder = async (userId, orderId) => {
  const orderRef = ref(database, `orders/${userId}/${orderId}`);
  
  try {
    // Update order status to Unpaid
    await update(orderRef, { paymentStatus: "Unpaid" });
    console.log(`✅ Order ${orderId} marked as Unpaid.`);
  } catch (error) {
    console.error("❌ Error handling Unpaid order:", error.message);
  }
};
*/