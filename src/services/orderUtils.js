import { ref, push, set, update, get } from 'firebase/database'; // Use 'get' instead of 'onValue'
import { database } from '../FirebaseConfig';
import emailjs from 'emailjs-com';

// Save order to Firebase
export const saveOrderToFirebase = (buyerInfo, order, totalAmount) => {
  return new Promise((resolve, reject) => {
    const orderData = {
      buyerInfo,
      totalAmount,
      products: order.map((item) => ({
        name: item.name,
        price: item.editablePrice,
        quantity: item.quantity,
        packaging: item.packaging,
      })),
      createdAt: new Date().toISOString(),
    };

    // Reference for 'orders' node in Firebase
    const ordersRef = ref(database, 'orders');
    const newOrderRef = push(ordersRef); // Generate new order ID

    // Save the order
    set(newOrderRef, orderData)
      .then(() => {
        console.log('Order saved successfully');
        resolve({ orderId: newOrderRef.key, orderData }); // Resolve with the order ID and data
      })
      .catch((error) => {
        console.error('Error saving order:', error);
        reject(error);
      });
  });
};

// Create invoice in Firebase
export const createInvoice = (orderId, totalAmount, buyerInfo, orderData) => {
  const invoicesRef = ref(database, 'invoices');

  return new Promise((resolve, reject) => {
    // Fetch the current invoices once to determine the last used invoice number
    get(invoicesRef)
      .then((snapshot) => {
        const data = snapshot.val();
        let newInvoiceNumber = '000001'; // Default starting invoice number

        if (data) {
          // Find the highest invoice number
          const invoiceNumbers = Object.values(data).map((invoice) => invoice.invoiceNumber);
          const maxInvoiceNumber = Math.max(
            ...invoiceNumbers.map((num) => parseInt(num.slice(4), 10)) // Get numeric part
          );
          newInvoiceNumber = (maxInvoiceNumber + 1).toString().padStart(6, '0'); // Increment and pad with zeros
        }

        const newInvoiceRef = push(invoicesRef); // Generate new invoice ID

        // Exclude the email field from buyerInfo
        const { email, ...buyerInfoWithoutEmail } = buyerInfo;

        // Create invoice data with all order details and the new invoice number
        const invoiceData = {
          orderId,
          invoiceNumber: `${newInvoiceNumber}`, // Incremented invoice number
          totalAmount,
          paymentStatus: 'Pending',
          issuedAt: new Date().toISOString(),
          buyerInfo: buyerInfoWithoutEmail, // Store buyerInfo without the email
          orderDetails: orderData.products, // Include order products in the invoice
        };

        set(newInvoiceRef, invoiceData)
          .then(() => {
            console.log('Invoice created successfully');
            resolve(); // Resolve the promise after successful invoice creation
          })
          .catch((error) => {
            console.error('Error creating invoice:', error);
            reject(error);
          });
      })
      .catch((error) => {
        console.error('Error fetching invoice data:', error);
        reject(error);
      });
  });
};

// Send email notification using EmailJS
export const sendEmailNotification = (buyerInfo, orderData, totalAmount) => {
  const emailParams = {
    to_name: buyerInfo.soldTo, // Matches the placeholder in EmailJS template
    to_email: buyerInfo.email, // Matches the recipient email placeholder in EmailJS template
    order_summary: orderData.products
      .map((item) => `${item.name} x ${item.quantity} - ₱${item.price.toFixed(2)}`)
      .join('\n'), // Order details
    total_amount: `₱${totalAmount.toFixed(2)}`, // Total amount for the order
  };

  console.log('Email Params:', emailParams); // Log email params for debugging

  emailjs
    .send('service_xbzwe8f', 'template_op31jrk', emailParams, 'Eaa7gEQkmCzf4Prdz') // Use your correct Template ID and User ID
    .then((response) => {
      console.log('Email successfully sent!', response.status, response.text);
    })
    .catch((error) => {
      console.error('Failed to send email:', error);
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
        // Update the local state to reflect the new stock
        setProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === productId ? { ...p, stock: updatedStock } : p))
        );
        console.log(`Stock updated successfully for product: ${productId}`);
      } catch (error) {
        console.error('Error updating stock in Firebase:', error);
      }
    } else {
      console.error('Invalid stock value detected:', updatedStock);
    }
  } else {
    console.error('Product not found for stock update');
  }
};

// Complete order process with proper stock updates
export const completeOrderProcess = async (buyerInfo, order, totalAmount, products, setProducts) => {
  try {
    // Save the order
    const { orderId, orderData } = await saveOrderToFirebase(buyerInfo, order, totalAmount);

    // Create invoice with all order data but without the email
    await createInvoice(orderId, totalAmount, buyerInfo, orderData);

    // Send email notification
    await sendEmailNotification(buyerInfo, orderData, totalAmount);

    // Update stock for each item in the order
    for (const item of order) {
      await updateStock(item.id, -item.quantity, products, setProducts); // Decrease stock by quantity ordered
    }

    console.log('Order process completed successfully!');
  } catch (error) {
    console.error('Error completing the order process:', error);
  }
};
