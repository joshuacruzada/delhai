import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './CustomerList.css';
import { database } from "../FirebaseConfig";
import NewCustomer from './NewCustomer';
import EditCustomer from './EditCustomer';
import DeleteWarningModal from './DeleteWarningModal';
import { cleanUpDuplicates } from "../services/customerCleanup";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await cleanUpDuplicates(user.uid);

      // Fetch admin UID from config
      const adminConfigRef = ref(database, 'config/adminUID');
      const adminSnapshot = await get(adminConfigRef);
      const adminUID = adminSnapshot.exists() ? adminSnapshot.val() : null;

      let customersList = [];

      // Fetch customers from ADMIN path
      if (adminUID) {
        const adminCustomersRef = ref(database, `customers/${adminUID}`);
        const adminCustomersSnapshot = await get(adminCustomersRef);
        if (adminCustomersSnapshot.exists()) {
          const adminCustomers = Object.entries(adminCustomersSnapshot.val()).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          customersList = customersList.concat(adminCustomers);
        }
      }

      // Fetch customers from USER path (ecommerce users)
      const userCustomersRef = ref(database, `customers/${user.uid}`);
      const userCustomersSnapshot = await get(userCustomersRef);
      if (userCustomersSnapshot.exists()) {
        const userCustomers = Object.entries(userCustomersSnapshot.val()).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        customersList = customersList.concat(userCustomers);
      }

      setCustomers(customersList);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleLocationSearchChange = (event) => setLocationSearch(event.target.value);
  const handleAddCustomer = () => setIsAddModalOpen(true);
  const handleEditCustomer = (customer) => setEditCustomer(customer);
  const handleDeleteCustomer = (customerId) => setDeleteCustomerId(customerId);
  const handleCustomerChange = () => fetchCustomers();

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.poNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = 
      customer.completeAddress?.toLowerCase().includes(locationSearch.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="customer-list-container">
      <div className="customer-list-header">
        <h2>Customer List</h2>
        <div className="customer-list-actions">
          <input
            type="text"
            placeholder="Search by name, PO #, or email"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <input
            type="text"
            placeholder="Search by location"
            value={locationSearch}
            onChange={handleLocationSearchChange}
            className="location-search-input"
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
                <td>{customer.poNo || 'N/A'}</td>
                <td>{customer.name || 'N/A'}</td>
                <td>{customer.completeAddress || 'N/A'}</td>
                <td>{customer.email || 'N/A'}</td>
                <td>{customer.salesman || 'N/A'}</td>
                <td className="action-icons">
                  <i className="bi bi-pencil-fill edit-icon" onClick={() => handleEditCustomer(customer)}></i>
                  <i className="bi bi-trash-fill delete-icon" onClick={() => handleDeleteCustomer(customer.id)}></i>
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
