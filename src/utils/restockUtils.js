import { ref, update, get, push, set } from 'firebase/database';
import { database } from '../FirebaseConfig';

// 🟢 Handle Restock
export const handleRestock = async (productId, restockDetails) => {
    const productRef = ref(database, `stocks/${productId}`);
    const stockHistoryRef = push(ref(database, `stocks/${productId}/stockHistory`));

    try {
        // Fetch current stock
        const productSnapshot = await get(productRef);
        if (!productSnapshot.exists()) {
            throw new Error("❌ Product not found in stock");
        }

        const currentStock = productSnapshot.val().quantity || 0;
        const newStock = currentStock + (restockDetails.quantityAdded || 0);

        // Generate Unique Batch ID (based on timestamp for uniqueness)
        const batchId = `batch_${Date.now()}`;

        // Update Stock Quantity
        await update(productRef, { quantity: newStock });

        // Add Restock History with Batch ID
        await set(stockHistoryRef, {
            batchId: batchId, // Unique batch identifier
            type: "IN",
            restockDate: restockDetails.restockDate || new Date().toISOString(),
            expiryDate: restockDetails.expiryDate || "N/A",
            quantityAdded: restockDetails.quantityAdded || 0,
            productName: productSnapshot.val().name || "Unknown"
        });

        console.log(`✅ Product ${productId} restocked with ${restockDetails.quantityAdded} units. Batch ID: ${batchId}`);
        return { success: true, message: 'Restock successful', batchId: batchId };
    } catch (error) {
        console.error("❌ Error during restock:", error.message);
        throw error;
    }
};
