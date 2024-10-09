import { ref, push, set } from 'firebase/database';
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
export const createInvoice = (orderId, totalAmount) => {
  const invoicesRef = ref(database, 'invoices');
  const newInvoiceRef = push(invoicesRef); // Generate new invoice ID

  const invoiceData = {
    orderId,
    invoiceNumber: `INV-${Date.now()}`, // Example invoice number
    totalAmount,
    paymentStatus: 'Pending',
    issuedAt: new Date().toISOString(),
  };

  return set(newInvoiceRef, invoiceData)
    .then(() => {
      console.log('Invoice created successfully');
    })
    .catch((error) => {
      console.error('Error creating invoice:', error);
    });
};

// Send email notification using EmailJS
export const sendEmailNotification = (buyerInfo, orderData, totalAmount) => {
  const emailParams = {
    to_name: buyerInfo.soldTo,  // Matches the placeholder in EmailJS template
    to_email: buyerInfo.email,  // Matches the recipient email placeholder in EmailJS template
    order_summary: orderData.products
      .map((item) => `${item.name} x ${item.quantity} - ₱${item.price.toFixed(2)}`)
      .join('\n'),  // Order details
    total_amount: `₱${totalAmount.toFixed(2)}`,  // Total amount for the order
  };

  console.log('Email Params:', emailParams);  // Log email params for debugging

  emailjs
  .send('service_xbzwe8f', 'template_op31jrk', emailParams, 'Eaa7gEQkmCzf4Prdz')  // Use your correct Template ID and User ID
  .then((response) => {
    console.log('Email successfully sent!', response.status, response.text);
  })
  .catch((error) => {
    console.error('Failed to send email:', error);
  });



};

// Complete order process function
export const completeOrderProcess = (buyerInfo, order, totalAmount) => {
  return saveOrderToFirebase(buyerInfo, order, totalAmount)
    .then(({ orderId, orderData }) => {
      // After saving the order, create an invoice
      return createInvoice(orderId, totalAmount)
        .then(() => {
          // After creating the invoice, send an email notification
          return sendEmailNotification(buyerInfo, orderData, totalAmount);
        });
    })
    .catch((error) => {
      console.error('Error completing order process:', error);
    });
};
