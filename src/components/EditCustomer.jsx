import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import './EditCustomer.css';

const EditCustomer = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({ ...customer });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const db = getDatabase();
    const customerRef = ref(db, `customers/${formData.role}/${formData.id}`);

    update(customerRef, {
      ...formData,
      completeAddress: `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.zipCode}`,
    })
      .then(() => {
        alert('Customer updated successfully!');
        onClose();
      })
      .catch((error) => {
        console.error('Error updating customer:', error);
      });
  };

  return (
    <div className="edit-customer-modal">
      <div className="edit-customer-modal-content">
        <h2>Edit Customer</h2>
        <form>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="form-control"
          />
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Street"
            className="form-control"
          />
          <input
            type="text"
            name="barangay"
            value={formData.barangay}
            onChange={handleChange}
            placeholder="Barangay"
            className="form-control"
          />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="form-control"
          />
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            placeholder="Province"
            className="form-control"
          />
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Zip Code"
            className="form-control"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="form-control"
          />
          <input
            type="text"
            name="salesman"
            value={formData.salesman}
            onChange={handleChange}
            placeholder="Salesman"
            className="form-control"
          />
        </form>
        <button onClick={handleSubmit} className="btn btn-success">
          Save Changes
        </button>
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditCustomer;
