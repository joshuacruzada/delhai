import { ref, push, set, update, get } from "firebase/database";
import { database } from "../FirebaseConfig";
import emailjs from "emailjs-com";

// Save order to Firebase
export const saveOrderToFirebase = (buyerInfo, order, totalAmount, userId) => {
  // Structure the order data correctly before saving
  const orderData = {
    userId, // From AuthContext, indicates who created the order
    totalAmount, // Must be present
    createdAt: new Date().toISOString(),
    buyerInfo: {
      name: buyerInfo.name, // Buyer's name
      address: `${buyerInfo.street}, ${buyerInfo.barangay}, ${buyerInfo.city}, ${buyerInfo.province}, ${buyerInfo.zipCode}`, // Concatenate full address
      shippedTo: buyerInfo.shippedTo, // Shipping address
      drNo: buyerInfo.drNo, // Delivery receipt number
      poNo: buyerInfo.poNo, // Purchase order number
      terms: buyerInfo.terms, // Payment terms
      salesman: buyerInfo.salesman, // Salesman
      email: buyerInfo.email, // Buyer's email
    },
    products: order.map((item) => ({
      name: item.name,
      price: item.editablePrice,
      quantity: item.quantity,
      packaging: item.packaging,
    })),
  };

  const ordersRef = ref(database, "orders");
  const newOrderRef = push(ordersRef);

  return set(newOrderRef, orderData)
    .then(() => {
      console.log("Order saved successfully");
      return { orderId: newOrderRef.key, orderData };
    })
    .catch((error) => {
      console.error("Error saving order:", error);
      throw error;
    });
};

// Create invoice in Firebase
export const createInvoice = (orderId, totalAmount, buyerInfo, orderData) => {
  const invoicesRef = ref(database, "invoices");

  return new Promise((resolve, reject) => {
    get(invoicesRef)
      .then((snapshot) => {
        const data = snapshot.val();
        let newInvoiceNumber = "000001"; // Default starting invoice number

        if (data) {
          const invoiceNumbers = Object.values(data).map((invoice) => invoice.invoiceNumber);
          const maxInvoiceNumber = Math.max(
            ...invoiceNumbers.map((num) => parseInt(num.slice(4), 10)) // Get numeric part
          );
          newInvoiceNumber = (maxInvoiceNumber + 1).toString().padStart(6, "0");
        }

        const newInvoiceRef = push(invoicesRef);

        const { email, ...buyerInfoWithoutEmail } = buyerInfo;

        const invoiceData = {
          orderId,
          invoiceNumber: `${newInvoiceNumber}`,
          totalAmount,
          paymentStatus: "Pending",
          issuedAt: new Date().toISOString(),
          buyerInfo: buyerInfoWithoutEmail,
          orderDetails: orderData.products,
           // Ensure the userId is saved in the invoice
        };

        set(newInvoiceRef, invoiceData)
          .then(() => {
            console.log("Invoice created successfully");
            resolve();
          })
          .catch((error) => {
            console.error("Error creating invoice:", error);
            reject(error);
          });
      })
      .catch((error) => {
        console.error("Error fetching invoice data:", error);
        reject(error);
      });
  });
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
    const currentStock = Number(product.stock) || 0;
    const updatedStock = Math.max(currentStock + quantityChange, 0);

    if (!isNaN(updatedStock)) {
      try {
        await update(productRef, { stock: updatedStock });
        setProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === productId ? { ...p, stock: updatedStock } : p))
        );
        console.log(`Stock updated successfully for product: ${productId}`);
      } catch (error) {
        console.error("Error updating stock in Firebase:", error);
      }
    } else {
      console.error("Invalid stock value detected:", updatedStock);
    }
  } else {
    console.error("Product not found for stock update");
  }
};

// Complete order process with proper stock updates
export const completeOrderProcess = async (buyerInfo, order, totalAmount, products, setProducts) => {
  try {
    if (!buyerInfo.userId) {
      throw new Error("User ID is missing in buyerInfo");
    }

    const { orderId, orderData } = await saveOrderToFirebase(buyerInfo, order, totalAmount, buyerInfo.userId);

    await createInvoice(orderId, totalAmount, buyerInfo, orderData);

    await sendEmailNotification(buyerInfo, orderData, totalAmount);

    for (const item of order) {
      await updateStock(item.id, -item.quantity, products, setProducts); // Decrease stock
    }

    console.log("Order process completed successfully!");
  } catch (error) {
    console.error("Error completing the order process:", error);
  }
};
