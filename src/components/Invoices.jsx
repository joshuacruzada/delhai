import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { AuthContext } from '../AuthContext';
import InvoiceDetails from './InvoiceDetails';
import './Invoices.css';

// Utility function to format invoice numbers
const formatInvoiceNumber = (number) => String(number).padStart(6, '0');

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Selected invoice details
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Fetch Invoices, Customers, and Orders
  useEffect(() => {
    const fetchInvoicesAndOrders = async () => {
      if (!user) return;

      const invoicesRef = ref(database, `invoices/${user.uid}`);
      const customersRef = ref(database, `customers/${user.uid}`);
      const ordersRef = ref(database, `orders/${user.uid}`);

      try {
        setLoading(true);
        setError(null);

        const [invoicesSnapshot, customersSnapshot, ordersSnapshot] = await Promise.all([
          get(invoicesRef),
          get(customersRef),
          get(ordersRef),
        ]);

        const invoicesData = invoicesSnapshot.exists()
          ? Object.entries(invoicesSnapshot.val()).map(([key, value]) => ({ id: key, ...value }))
          : [];
        const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {};
        const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {};

        const mergedInvoices = invoicesData.map((invoice, index) => {
          const customer = customersData[invoice.customerId] || {};
          const order = ordersData[invoice.orderId] || {};

          return {
            ...invoice,
            invoiceNumber: formatInvoiceNumber(invoice.invoiceNumber || 1),
            customerName: invoice.customerName || customer.name || 'N/A',
            customerAddress: invoice.customerAddress || customer.completeAddress || 'N/A',
            tin: invoice.tin || 'N/A',
            shippedTo: invoice.shippedTo || 'N/A',
            drNo: invoice.drNo || 'N/A',
            poNo: invoice.poNo || 'N/A',
            terms: invoice.terms || 'N/A',
            salesman: invoice.salesman || 'N/A',
            totalAmount: invoice.totalAmount || 0,
            paymentStatus: order.paymentStatus || invoice.paymentStatus || 'Pending',
            products: invoice.orderDetails || [],
          };
        }).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)); // sort here

        setInvoices(mergedInvoices);
      } catch (error) {
        console.error('Error fetching invoices, customers, or orders:', error);
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesAndOrders();
  }, [user]);

  // Modal Close on Outside Click
  const handleOutsideClick = useCallback((event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeInvoiceModal();
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal, handleOutsideClick]);

  const openInvoiceModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeInvoiceModal = () => {
    setSelectedInvoice(null);
    setShowModal(false);
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceNumber
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBuyer = buyerFilter
      ? invoice.customerName?.toLowerCase().includes(buyerFilter.toLowerCase())
      : true;
    const matchesDate = dateFilter ? invoice.issuedAt?.startsWith(dateFilter) : true;

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
        <div className="spinner">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Name</th>
              <th>PO#</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} onClick={() => openInvoiceModal(invoice)} style={{ cursor: 'pointer' }}>
                  <td>{invoice.invoiceNumber || 'N/A'}</td>
                  <td>{invoice.customerName || 'N/A'}</td>
                  <td>{invoice.poNo || 'N/A'}</td>
                  <td>₱{(invoice.totalAmount || 0).toFixed(2)}</td>
                  <td className={`status ${invoice.paymentStatus?.toLowerCase() || 'pending'}`}>
                    {invoice.paymentStatus || 'Pending'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No invoices available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal for Invoice Details */}
      {showModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <InvoiceDetails invoice={selectedInvoice} onClose={closeInvoiceModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
