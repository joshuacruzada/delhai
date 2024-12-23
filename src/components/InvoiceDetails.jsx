import React, { useRef } from 'react';
import './InvoiceDetails.css';

const InvoiceDetails = ({ invoice, onClose }) => {
  const modalRef = useRef(null);
  const printRef = useRef(null);

  // Close modal when clicking outside
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Print Invoice Function
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (!invoice) return null;

  return (
    <div className="invoice-modal-overlay" onClick={handleOutsideClick}>
      <div className="invoice-modal-content" ref={modalRef}>
        <div ref={printRef}>
          {/* CUSTOMER & INVOICE INFORMATION */}
          <div className="invoice-modal-info">
            {/* Left Side */}
            <div className="info-left">
              <p><strong>NAME:</strong> {invoice.customerName || 'N/A'}</p>
              <p><strong>ADDRESS:</strong> {invoice.customerAddress || 'N/A'}</p>
              <p><strong>TIN NO:</strong> {invoice.tin || 'N/A'}</p>
              <p><strong>SHIPPED TO:</strong> {invoice.shippedTo || 'N/A'}</p>
            </div>

            {/* Right Side */}
            <div className="info-right">
              <p><strong>DR. NO.:</strong> {invoice.drNo || 'N/A'}</p>
              <p>
                <strong>DATE:</strong> 
                {invoice.createdAt 
                  ? new Date(invoice.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).replace(/ /g, '-') 
                  : 'N/A'}
              </p>
              <p><strong>TERMS:</strong> {invoice.terms || 'N/A'}</p>
              <p><strong>SALESMAN:</strong> {invoice.salesman || 'N/A'}</p>
              <p><strong>PO NO.:</strong> {invoice.poNo || 'N/A'}</p>
            </div>
          </div>

          {/* PRODUCT LIST */}
          <div className="invoice-products-container">
            {invoice.products?.length > 0 ? (
              <table className="invoice-products-table">
                <thead>
                  <tr>
                    <th>QTY</th>
                    <th>ITEM CODE</th>
                    <th>SKU#</th>
                    <th>DESCRIPTION</th>
                    <th>UNIT PRICE</th>
                    <th>NET AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.quantity || 0}</td>
                      <td>{product.packaging || ''}</td>
                      <td>{product.sku || ''}</td>
                      <td>{product.name || 'N/A'}</td>
                      <td>₱{product.price?.toFixed(2) || '0.00'}</td>
                      <td>₱{(product.quantity * product.price)?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No product details available.</p>
            )}
          </div>

          {/* TOTAL */}
          <div className="invoice-modal-footer">
            <div className="footer-total">
              <span className="total-label">Total Amount:</span>
              <span className="total-value">₱{invoice.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          {/* PRINT BUTTON */}
          <div className="invoice-actions">
            <button className="btn-print" onClick={handlePrint}>Print Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
