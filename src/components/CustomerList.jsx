import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './CustomerList.css';
import NewCustomer from './NewCustomer';
import EditCustomer from './EditCustomer';
import DeleteWarningModal from './DeleteWarningModal';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const userRoleRef = ref(db, `users/${user.uid}/role`);

      get(userRoleRef).then((snapshot) => {
        if (snapshot.exists()) {
          const role = snapshot.val();
          setRole(role);

          const customerRef = ref(db, `customers/${role}`);
          get(customerRef).then((customerSnapshot) => {
            if (customerSnapshot.exists()) {
              const customerList = Object.entries(customerSnapshot.val()).map(
                ([key, value]) => ({
                  id: key,
                  ...value,
                })
              );
              setCustomers(customerList);
            } else {
              setCustomers([]);
            }
          });
        }
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddCustomer = () => {
    setIsAddModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditCustomer(customer);
  };

  const handleDeleteCustomer = (customerId) => {
    setDeleteCustomerId(customerId);
  };

  const handleCustomerChange = () => {
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-list-container">
      <div className="customer-list-header">
        <h2>Customer List</h2>
        <div className="customer-list-actions">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="new-customer-btn" onClick={handleAddCustomer}>
            <i className="bi bi-person-plus"></i> New Customer
          </button>
        </div>
      </div>
      {customers.length === 0 ? (
        <p className="no-customers">No customers available</p>
      ) : (
        <table className="customer-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Salesman</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.poNumber}</td>
                <td>{customer.name}</td>
                <td>{customer.completeAddress}</td>
                <td>{customer.email}</td>
                <td>{customer.salesman}</td>
                <td className="action-icons">
                  <i
                    className="bi bi-pencil-fill edit-icon"
                    onClick={() => handleEditCustomer(customer)}
                  ></i>
                  <i
                    className="bi bi-trash-fill delete-icon"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isAddModalOpen && (
        <NewCustomer
          onClose={() => {
            setIsAddModalOpen(false);
            handleCustomerChange();
          }}
          role={role}
        />
      )}
      {editCustomer && (
        <EditCustomer
          customer={editCustomer}
          onClose={() => {
            setEditCustomer(null);
            handleCustomerChange();
          }}
        />
      )}
      {deleteCustomerId && (
        <DeleteWarningModal
          customerId={deleteCustomerId}
          role={role}
          onClose={() => {
            setDeleteCustomerId(null);
            handleCustomerChange();
          }}
        />
      )}
    </div>
  );
};

export default CustomerList;
