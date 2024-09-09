import React, { useState } from 'react';

const Invoices = () => {
  // Initial state for invoices (can later be fetched from an API or local storage)
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      customerName: 'John Doe',
      date: '2024-09-07',
      total: 500,
      status: 'Paid',
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      date: '2024-09-06',
      total: 300,
      status: 'Unpaid',
    },
  ]);

  // Function to add a new invoice (could be triggered by a form or external action)
  const addInvoice = () => {
    const newInvoice = {
      id: invoices.length + 1, // Simple incrementing ID
      customerName: 'New Customer',
      date: '2024-09-08',
      total: 450,
      status: 'Paid',
    };
    setInvoices([...invoices, newInvoice]);
  };

  return (
    <div>
      <h1>Invoices</h1>
      <button onClick={addInvoice}>Add New Invoice</button>
      <table border="1" style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.customerName}</td>
              <td>{invoice.date}</td>
              <td>${invoice.total}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
