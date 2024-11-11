import React, { useState, useEffect } from 'react';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Invoices.css';

// Function to format the invoice number with leading zeroes
const formatInvoiceNumber = (number) => {
  return String(number).padStart(6, '0');
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchInvoices = () => {
      const ordersRef = ref(database, 'orders/');
      onValue(
        ordersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const allInvoices = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));

            // Generate and assign formatted invoice numbers
            allInvoices.forEach((invoice, index) => {
              if (!invoice.buyerInfo?.invoiceNumber) {
                // Assign a sequential invoice number if it doesn’t already have one
                const newInvoiceNumber = formatInvoiceNumber(index + 1);
                invoice.buyerInfo = {
                  ...invoice.buyerInfo,
                  invoiceNumber: newInvoiceNumber,
                };
              }
            });

            setInvoices(allInvoices);
          } else {
            setInvoices([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching invoices:", error);
          setLoading(false);
        }
      );
    };

    fetchInvoices();
  }, []);

  // Filter invoices based on search, buyer, and date filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.buyerInfo?.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
    const matchesBuyer = buyerFilter ? (invoice.buyerInfo?.soldTo?.toLowerCase().includes(buyerFilter.toLowerCase()) ?? false) : true;
    const matchesDate = dateFilter ? invoice.date?.startsWith(dateFilter) : true;
    return matchesSearch && matchesBuyer && matchesDate;
  });

  return (
    <div className="invoices-page">
      <h1 className="invoices-header">Invoices</h1>
      
      <div className="invoices-controls">
        <input
          type="text"
          placeholder="Search by Invoice Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="invoices-search"
        />
        
        <input
          type="text"
          placeholder="Filter by Buyer"
          value={buyerFilter}
          onChange={(e) => setBuyerFilter(e.target.value)}
          className="invoices-search"
        />

        <input
          type="date"
          placeholder="Filter by Date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="date-filter"
        />
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : (
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Sold To</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.buyerInfo?.invoiceNumber || 'N/A'}</td>
                  <td>{invoice.buyerInfo?.soldTo || 'N/A'}</td>
                  <td>₱{(invoice.totalAmount || 0).toFixed(2)}</td>
                  <td className={`status ${invoice.paymentStatus?.toLowerCase() || 'pending'}`}>
                    {invoice.paymentStatus || 'Pending'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-results">No invoices available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Invoices;
