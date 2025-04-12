import { ref, update, get, push, set } from "firebase/database";
import { database } from "../FirebaseConfig";

// 🟢 Handle Restock
export const handleRestock = async (productId, restockDetails) => {
  const productRef = ref(database, `stocks/${productId}`);
  const stockHistoryRef = push(ref(database, `stocks/${productId}/stockHistory`));

  try {
    // Fetch current product data
    const productSnapshot = await get(productRef);
    if (!productSnapshot.exists()) {
      throw new Error("❌ Product not found in stock");
    }

    const productData = productSnapshot.val();
    const currentStock = parseInt(productData.stock || 0, 10); // Current stock
    const currentTotalAddedStock = parseInt(productData.totalAddedStock || 0, 10); // Current total added stock
    const quantityAdded = parseInt(restockDetails.quantityAdded || 0, 10); // New quantity being added

    if (quantityAdded <= 0) {
      throw new Error("❌ Quantity added must be greater than zero");
    }

    // Calculate the updated stock and total added stock
    const updatedStock = currentStock + quantityAdded;
    const updatedTotalAddedStock = currentTotalAddedStock + quantityAdded;

    // Generate Unique Batch ID (based on timestamp and productId for uniqueness)
    const batchId = `batch_${Date.now()}`;

    // Update the stock and totalAddedStock fields in the product
    await update(productRef, {
      stock: updatedStock, // Update stock in the database
      totalAddedStock: updatedTotalAddedStock, // Update total added stock
    });

    // Add Restock History with Batch ID
    await set(stockHistoryRef, {
      batchId: batchId,
      type: "IN",
      restockDate: restockDetails.restockDate || new Date().toISOString(),
      expiryDate: restockDetails.expiryDate || "N/A",
      quantityAdded: quantityAdded,
      productName: productData.name || "Unknown",
    });

    console.log(
      `✅ Product ${productId} restocked with ${quantityAdded} units. Updated stock: ${updatedStock}. Total Added Stock: ${updatedTotalAddedStock}. Batch ID: ${batchId}`
    );
    return {
      success: true,
      message: "Restock successful",
      batchId: batchId,
      updatedStock,
      updatedTotalAddedStock,
    };
  } catch (error) {
    console.error("❌ Error during restock:", error.message);
    throw error;
  }
};
