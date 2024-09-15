import React, { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database'; // Import Firebase database functions
import { database } from '../FirebaseConfig';
import './Invoices.css'; // Assuming you have a separate CSS file for styling

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

  // Function to delete an invoice by its ID
  const deleteInvoice = (id) => {
    const invoiceRef = ref(database, `invoices/${id}`);
    remove(invoiceRef).then(() => {
      setInvoices(invoices.filter((invoice) => invoice.id !== id)); // Update state after deletion
    });
  };

  // Filter invoices based on search term and selected status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearchTerm =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || invoice.status === filterStatus;

    return matchesSearchTerm && matchesStatus;
  });

  return (
    <div className="invoices-page">
      <h1 className="invoices-header">Invoices</h1>

      {/* Search and Filter Section */}
      <div className="invoices-controls">
        <input
          type="text"
          placeholder="Search by Buyer or Address"
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
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      <div className="table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Buyer</th>
              <th>Address</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.customerName}</td>
                <td>{invoice.address}</td>
                <td>{invoice.date}</td>
                <td>₱{invoice.total.toFixed(2)}</td>
                <td className={invoice.status === 'Paid' ? 'paid' : 'unpaid'}>
                  {invoice.status}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteInvoice(invoice.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="7" className="no-results">
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
