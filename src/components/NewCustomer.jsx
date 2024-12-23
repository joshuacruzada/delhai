import React, { useState } from 'react';
import { getDatabase, ref, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './NewCustomer.css';

const NewCustomer = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    tin: '',
    drNo: '',
    poNo: '',
    email: '',
    salesman: '',
  });
  const [isAdded, setIsAdded] = useState(false);

  const provinces = [
    'Metro Manila',
    'Cebu',
    'Davao',
    'Pampanga',
    'Batangas',
    'Laguna',
    'Rizal',
    'Bulacan',
  ];

  const citiesMetroManila = [
    'Manila',
    'Makati',
    'Quezon City',
    'Pasig',
    'Mandaluyong',
    'Taguig',
    'Caloocan',
    'Pasay',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to add a new customer.");
      return;
    }

    const customerRef = ref(db, `customers/${user.uid}`);
    const newCustomerRef = push(customerRef);

    set(newCustomerRef, {
      ...formData,
      completeAddress: `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.zipCode}`,
      dateAdded: new Date().toISOString(),
    })
      .then(() => {
        setIsAdded(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      })
      .catch((error) => {
        console.error('Error adding customer:', error);
      });
  };

  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="new-customer-modal">
      {isAdded ? (
        <div className="success-modal">
          <div className="success-modal-content">
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-check"
                fill="none"
                d="M16 26 l8 8 l16 -16"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div className="new-customer-modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h2>Add New Customer</h2>
            <span className="modal-date">{currentDate}</span>
          </div>
          <form>
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              name="street"
              placeholder="Street # and Name"
              value={formData.street}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              name="barangay"
              placeholder="Barangay"
              value={formData.barangay}
              onChange={handleChange}
            />
            <select
              className="form-select"
              name="province"
              value={formData.province}
              onChange={handleChange}
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {formData.province === 'Metro Manila' && (
              <select
                className="form-select"
                name="city"
                value={formData.city}
                onChange={handleChange}
              >
                <option value="">Select City</option>
                {citiesMetroManila.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              className="form-control"
              name="zipCode"
              placeholder="Zip Code"
              value={formData.zipCode}
              onChange={handleChange}
            />
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              name="tin"
              placeholder="TIN #"
              value={formData.tin}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              name="drNo"
              placeholder="DR #"
              value={formData.dr}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              name="poNo"
              placeholder="PO #"
              value={formData.poNumber}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control"
              name="salesman"
              placeholder="Salesman"
              value={formData.salesman}
              onChange={handleChange}
            />
          </form>
          <button className="btn btn-success" onClick={handleSubmit}>
            Add Customer
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default NewCustomer;
