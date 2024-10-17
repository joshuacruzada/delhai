import React, { useState, useEffect, useContext } from 'react';
import { ref, onValue, update, push, set } from 'firebase/database';
import { database } from '../FirebaseConfig';
import './Invoices.css';
import { AuthContext } from '../AuthContext';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const { user } = useContext(AuthContext); // Get logged-in user info

  useEffect(() => {
    const invoicesRef = ref(database, 'invoices/');

    onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Fetched raw invoice data:', data); // Log the raw data

      if (data) {
        const allInvoices = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        console.log('Processed invoices:', allInvoices); // Log the processed invoices

        // Ensure userId is part of invoice creation process; if missing, skip the filter temporarily
        const filteredInvoices = user.role === 'admin'
          ? allInvoices
          : allInvoices.filter((invoice) => invoice.userId === user.uid);

        setInvoices(filteredInvoices);
        console.log('Filtered invoices based on user role:', filteredInvoices); // Log filtered invoices
      } else {
        console.log('No invoices found');
        setInvoices([]); // No invoices found
      }
    });
  }, [user]);

  const updatePaymentStatus = (invoiceId, newStatus, amount) => {
    if (window.confirm(`Are you sure you want to mark this invoice as ${newStatus}?`)) {
      const invoiceRef = ref(database, `invoices/${invoiceId}`);

      // Use correct Firebase path notation
      update(invoiceRef, { paymentStatus: newStatus })
        .then(() => {
          console.log(`Payment status updated to ${newStatus}`);
          if (newStatus === 'Paid') {
            const salesRef = ref(database, 'sales/');
            const newSaleKey = push(salesRef).key;
            set(ref(database, `sales/${newSaleKey}`), {
              date: new Date().toISOString(),
              amount: amount,
            });
            console.log('Sale added successfully.');
          }
        })
        .catch((error) => console.error('Error updating payment status:', error));
    }
  };

  // Simplified filtering logic for invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.buyerInfo?.soldTo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invoice.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || invoice.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="invoices-page">
      <h1 className="invoices-header">Invoices</h1>

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

      <table className="invoices-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Sold To</th>
            <th>Total Amount</th>
            <th>Issued At</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNumber || 'N/A'}</td>
                <td>{invoice.buyerInfo?.soldTo || 'N/A'}</td>
                <td>₱{invoice.totalAmount ? invoice.totalAmount.toFixed(2) : 'N/A'}</td>
                <td>{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span className={invoice.paymentStatus === 'Paid' ? 'paid' : invoice.paymentStatus === 'Pending' ? 'pending' : 'unpaid'}>
                    {invoice.paymentStatus || 'N/A'}
                  </span>
                </td>
                <td>
                  <button
                    className="action-button btn-paid"
                    onClick={() => updatePaymentStatus(invoice.id, 'Paid', invoice.totalAmount)}
                    disabled={invoice.paymentStatus === 'Paid'}
                  >
                    Paid
                  </button>
                  <button
                    className="action-button btn-unpaid"
                    onClick={() => updatePaymentStatus(invoice.id, 'Unpaid', invoice.totalAmount)}
                    disabled={invoice.paymentStatus === 'Unpaid'}
                  >
                    Unpaid
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No matching invoices found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
