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
    tin: buyerInfo.tin || "", // Ensure default empty string if not provided
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
  const orderData = {
    customerId, // Reference to the customer
    totalAmount,
    createdAt: new Date().toISOString(),
    paymentStatus: "Pending",
    products: order.map((item) => ({
      name: item.name,
      price: item.editablePrice || 0,
      quantity: item.quantity || 0,
      imageUrl: item.imageUrl || "placeholder.png",
      packaging: item.packaging || "N/A" 
    })),
  };

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
      customerId, // Only save the customerId, not the full buyerInfo
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
  const productRef = ref(database, `stocks/${productId}`);
  const product = products.find((p) => p.id === productId);

  if (product) {
    const currentQuantity = Number(product.quantity) || 0; // Use 'quantity' instead of 'stock'
    const updatedQuantity = Math.max(currentQuantity + quantityChange, 0); // Prevent negative quantity

    if (!isNaN(updatedQuantity)) {
      try {
        await update(productRef, { quantity: updatedQuantity }); // Update 'quantity' in Firebase
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === productId ? { ...p, quantity: updatedQuantity } : p
          )
        );
        console.log(`Quantity updated successfully for product: ${productId}`);
      } catch (error) {
        console.error("Error updating quantity in Firebase:", error);
      }
    } else {
      console.error("Invalid quantity value detected:", updatedQuantity);
    }
  } else {
    console.error("Product not found for quantity update");
  }
};



// Complete order process with proper stock updates
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

    // Step 3: Create invoice
    await createInvoice(orderId, customerId, totalAmount, orderData);

    // Step 4: Send email notification
    await sendEmailNotification(buyerInfo, orderData, totalAmount);

    // Step 5: Update stock
    for (const item of order) {
      await updateStock(item.id, -item.quantity, products, setProducts);
    }

    console.log("Order process completed successfully.");
  } catch (error) {
    console.error("Error in order process:", error);
    throw error;
  }
};