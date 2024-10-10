import React, { useState, useEffect } from 'react';
import { ref, onValue, update, push, set } from 'firebase/database'; // Import push and set for adding sales
import { database } from '../FirebaseConfig';
import './Invoices.css'; // Assuming this is the CSS file

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const invoicesRef = ref(database, 'invoices/');
    onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const invoiceArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setInvoices(invoiceArray);
      }
    });
  }, []);

  // Update payment status and add sale to sales node
  const updatePaymentStatus = (invoiceId, newStatus, amount) => {
    if (window.confirm(`Are you sure you want to mark this invoice as ${newStatus}?`)) {
      const invoiceRef = ref(database, `invoices/${invoiceId}`);

      // Step 1: Update the payment status in the invoices node
      update(invoiceRef, { paymentStatus: newStatus })
        .then(() => {
          console.log(`Payment status updated to ${newStatus} for invoice ${invoiceId}`);

          // Step 2: Add sales data to the sales node if status is "Paid"
          if (newStatus === 'Paid') {
            const salesRef = ref(database, 'sales/'); // Reference to sales node
            const newSaleKey = push(salesRef).key; // Create a new sale entry key

            // Set the new sale data in Firebase
            set(ref(database, `sales/${newSaleKey}`), {
              date: new Date().toISOString(),
              amount: amount,  // Add the total amount from the invoice
            });
            console.log('Sale added successfully to sales node.');
          }
        })
        .catch((error) => {
          console.error('Error updating payment status:', error);
        });
    }
  };

  // Filter invoices based on search term and selected status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearchTerm =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.buyerInfo?.soldTo.toLowerCase().includes(searchTerm.toLowerCase()); // Search by 'Sold To' name

    const matchesStatus =
      filterStatus === 'All' || invoice.paymentStatus === filterStatus;

    return matchesSearchTerm && matchesStatus;
  });

  return (
    <div className="invoices-page">
      <h1 className="invoices-header">Invoices</h1>

      {/* Search and Filter Section */}
      <div className="invoices-controls">
        <input
          type="text"
          placeholder="Search by Invoice Number or Sold To"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="invoices-search"
        />

        <select
          className="status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      <div className="table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Sold To</th> {/* Updated header */}
              <th>Total Amount</th>
              <th>Issued At</th>
              <th>Payment Status</th>
              <th>Actions</th> {/* Add column for actions */}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.buyerInfo?.soldTo || 'N/A'}</td> {/* Display Sold To */}
                <td>₱{invoice.totalAmount.toFixed(2)}</td>
                <td>{new Date(invoice.issuedAt).toLocaleDateString()}</td>
                <td className={invoice.paymentStatus === 'Paid' ? 'paid' : 'pending'}>
                  {invoice.paymentStatus}
                </td>
                <td>
                  {/* Buttons to manually update the payment status */}
                  <button
                    className="btn btn-success"
                    onClick={() => updatePaymentStatus(invoice.id, 'Paid', invoice.totalAmount)}
                    disabled={invoice.paymentStatus === 'Paid'} // Disable button if already paid
                  >
                    Paid
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updatePaymentStatus(invoice.id, 'Unpaid', invoice.totalAmount)}
                    disabled={invoice.paymentStatus === 'Unpaid'} // Disable button if already unpaid
                  >
                    Unpaid
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="6" className="no-results">
                  No matching invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
