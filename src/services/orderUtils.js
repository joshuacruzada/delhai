import { ref, push, set, update, get } from "firebase/database";
import { database } from "../FirebaseConfig";
import { getAuth } from "firebase/auth";
import emailjs from "emailjs-com";

export const findCustomerByName = async (name, userId) => {
  if (!name || !userId) {
    throw new Error("Name and User ID are required to find a customer.");
  }

  const customersRef = ref(database, `customers/${userId}`);
  const snapshot = await get(customersRef);

  if (snapshot.exists()) {
    const customers = snapshot.val();
    const customerList = Object.keys(customers).map((key) => ({
      id: key,
      ...customers[key],
    }));

    // Find a customer by name (case-insensitive)
    return customerList.find(
      (customer) =>
        customer.name && customer.name.toLowerCase() === name.toLowerCase()
    );
  }
  return null;
};





// Add a new customer to the database
export const addNewCustomer = async (buyerInfo) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User must be logged in to add a customer.");

  const customersRef = ref(database, `customers/${user.uid}`);
  const newCustomerRef = push(customersRef);

  const customerData = {
    name: buyerInfo.name,
    street: buyerInfo.street,
    barangay: buyerInfo.barangay,
    city: buyerInfo.city,
    province: buyerInfo.province,
    zipCode: buyerInfo.zipCode,
    email: buyerInfo.email,
    tin: buyerInfo.tin || "",
    drNo: buyerInfo.drNo || "",
    poNo: buyerInfo.poNo || "",
    terms: buyerInfo.terms || "", 
    shippedTo: buyerInfo.shippedTo || "",
    salesman: buyerInfo.salesman || "",
    completeAddress: `${buyerInfo.street}, ${buyerInfo.barangay}, ${buyerInfo.city}`,
    dateAdded: new Date().toISOString(),
  };

  await set(newCustomerRef, customerData);
  console.log("New customer added successfully:", buyerInfo.name);
  return newCustomerRef.key; // Return customerId
};


// Save order to Firebase
export const saveOrderToFirebase = async (customerId, order, totalAmount, userId) => {
  console.log("Saving order for customer:", customerId);
  console.log("Order details:", order);

  for (const item of order) {
    if (!item.id) {
      throw new Error(`❌ Product "${item.name}" is missing an ID.`);
    }
  }

  const orderData = {
    customerId, // Reference to the customer
    totalAmount,
    createdAt: new Date().toISOString(),
    paymentStatus: "Pending",
    products: order.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.editablePrice || 0,
      quantity: item.quantity || 0,
      imageUrl: item.imageUrl || "placeholder.png",
      packaging: item.packaging || "N/A",
      expiryDate: item.expiryDate || "N/A",
    })),
  };

  console.log("Order data to be saved:", orderData);

  const ordersRef = ref(database, `orders/${userId}`);
  const newOrderRef = push(ordersRef);

  try {
    await set(newOrderRef, orderData);
    console.log("Order saved successfully:", newOrderRef.key);
    return { orderId: newOrderRef.key, orderData };
  } catch (error) {
    console.error("Error saving order:", error);
    throw error;
  }
};




// Create invoice in Firebase
export const createInvoice = async (orderId, customerId, totalAmount, orderData) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User must be logged in to create an invoice.");
  if (!orderId || !customerId) throw new Error("Order ID and Customer ID are required.");

  const invoicesRef = ref(database, `invoices/${user.uid}`);
  const orderRef = ref(database, `orders/${user.uid}/${orderId}`); // Reference to the specific order

  try {
    // Step 1: Fetch the latest invoice number
    const snapshot = await get(invoicesRef);
    let newInvoiceNumber = "000001";

    if (snapshot.exists()) {
      const existingInvoices = Object.values(snapshot.val());
      const maxInvoiceNumber = Math.max(
        ...existingInvoices.map((invoice) => parseInt(invoice.invoiceNumber, 10))
      );
      newInvoiceNumber = (maxInvoiceNumber + 1).toString().padStart(6, "0");
    }

    // Step 2: Fetch order payment status
    const orderSnapshot = await get(orderRef);
    if (!orderSnapshot.exists()) {
      throw new Error("Order data not found.");
    }
    const orderDataFromDB = orderSnapshot.val();

    // Step 3: Prepare invoice data with only customerId and other essentials
    const newInvoiceRef = push(invoicesRef);
    const invoiceData = {
      orderId,
      customerId, 
      invoiceNumber: newInvoiceNumber,
      totalAmount,
      paymentStatus: orderDataFromDB.paymentStatus || "Pending", // Link to the order's status
      issuedAt: new Date().toISOString(),
      orderDetails: orderData.products, // Use products data
    };

    // Step 4: Save the invoice data to Firebase
    await set(newInvoiceRef, invoiceData);
    console.log("Invoice created successfully:", invoiceData.invoiceNumber);

    return newInvoiceRef.key; // Return the new invoice key
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};



// Send email notification using EmailJS
export const sendEmailNotification = (buyerInfo, orderData, totalAmount) => {
  const emailParams = { 
    to_name: buyerInfo.name, 
    to_email: buyerInfo.email,      
    order_summary: orderData.products
      .map((item) => `${item.name} x ${item.quantity} - ₱${item.price.toFixed(2)}`)
      .join("\n"),
    total_amount: `₱${totalAmount.toFixed(2)}`,
  };

  console.log("Email Params:", emailParams); // Log email params for debugging

  emailjs
    .send("service_xbzwe8f", "template_op31jrk", emailParams, "Eaa7gEQkmCzf4Prdz")
    .then((response) => {
      console.log("Email successfully sent!", response.status, response.text);
    })
    .catch((error) => {
      console.error("Failed to send email:", error);
    });
};

// Update stock function
export const updateStock = async (productId, quantityChange, products, setProducts) => {
  console.log("Updating stock for product:", productId, "with change:", quantityChange);

  const productRef = ref(database, `stocks/${productId}`);
  const product = products.find((p) => p.id === productId);

  if (product) {
    const currentQuantity = Number(product.quantity) || 0;
    const updatedQuantity = Math.max(currentQuantity + quantityChange, 0);

    console.log("Current Quantity:", currentQuantity, "Updated Quantity:", updatedQuantity);

    if (!isNaN(updatedQuantity)) {
      try {
        await update(productRef, { quantity: updatedQuantity });
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === productId ? { ...p, quantity: updatedQuantity } : p
          )
        );
        console.log(`Stock updated successfully for product: ${productId}`);
      } catch (error) {
        console.error("Error updating stock in Firebase:", error);
      }
    } else {
      console.error("Invalid quantity value detected:", updatedQuantity);
    }
  } else {
    console.error("Product not found for stock update:", productId);
  }
};


export const completeOrderProcess = async (buyerInfo, order, totalAmount, products, setProducts, userId) => {
  try {
    console.log("Starting Complete Order Process");

    if (!userId) throw new Error("User ID is required.");

    // Step 1: Find or add customer
    let customerId;
    const existingCustomer = await findCustomerByName(buyerInfo.name, userId);

    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log("Customer found:", existingCustomer.name);
    } else {
      console.log("Customer not found. Adding as new customer.");
      customerId = await addNewCustomer(buyerInfo);
    }

    // Step 2: Save the order
    const { orderId, orderData } = await saveOrderToFirebase(customerId, order, totalAmount, userId);

    // Step 3: Update stock using FIFO logic
    for (const item of order) {
      console.log(`\n🔍 Processing stock deduction for product "${item.name}" (ID: ${item.id}).`);
      const productRef = ref(database, `stocks/${item.id}`);
      const deductionLogRef = ref(database, `stocks/${item.id}/deductionLog`); // Deduction log reference
      const productSnapshot = await get(productRef);

      if (productSnapshot.exists()) {
        const stockData = productSnapshot.val();
        let quantityToDeduct = item.quantity || 0; // Total quantity to deduct
        let stockHistory = stockData.stockHistory || {};
        let updatedHistory = {};

        // Convert stockHistory to an array for sorting
        let historyArray = Object.entries(stockHistory).map(([key, value]) => ({
          batchId: key,
          ...value,
        }));

        // Ensure `initialBatch` is always first
        historyArray.sort((a, b) => {
          if (a.batchId === "initialBatch") return -1;
          if (b.batchId === "initialBatch") return 1;
          return new Date(a.restockDate || 0) - new Date(b.restockDate || 0);
        });

        console.log(`👉 Starting FIFO deduction for product "${item.name}".`);

        // Deduct stock from batches
        for (const batch of historyArray) {
          if (quantityToDeduct <= 0) break;

          const batchQuantity = batch.quantityAdded || 0; // Available quantity in the batch
          const quantityRemoved = Math.min(batchQuantity, quantityToDeduct);

          // Update batch quantity
          batch.quantityAdded = batchQuantity - quantityRemoved;
          quantityToDeduct -= quantityRemoved;

          console.log(
            `✅ Deducted ${quantityRemoved} from Batch "${batch.batchId}". Remaining in batch: ${batch.quantityAdded}.`
          );

          // Record deduction in deductionLog
          const deductionLogEntry = {
            batchId: batch.batchId,
            deductedQuantity: quantityRemoved,
            orderId: orderId,
            timestamp: new Date().toISOString(),
          };

          const newLogRef = push(deductionLogRef); // Create a unique log entry
          await set(newLogRef, deductionLogEntry);

          // Retain all batches, even those with `quantityAdded` set to 0
          updatedHistory[batch.batchId] = {
            ...batch,
            quantityAdded: batch.quantityAdded, // Keep 0 if fully deducted
          };
        }

        // Calculate new stock
        const newStock = historyArray.reduce((sum, batch) => sum + (batch.quantityAdded || 0), 0);

        // Update product stock and stock history in Firebase
        await update(productRef, {
          stock: newStock, // Remaining stock
          stockHistory: updatedHistory, // Updated history
        });

        console.log(
          `✅ Final Stock for "${item.name}" (ID: ${item.id}): ${newStock}. Updated stock history logged.`
        );
      } else {
        console.warn(`⚠️ Product "${item.name}" (ID: ${item.id}) not found in stocks. Skipping deduction.`);
      }
    }

    // Step 4: Create invoice
    await createInvoice(orderId, customerId, totalAmount, orderData);

    // Step 5: Send email notification
    await sendEmailNotification(buyerInfo, orderData, totalAmount);

    console.log("🎉 Order process completed successfully.");
  } catch (error) {
    console.error("❌ Error in order process:", error);
    throw error;
  }
};

