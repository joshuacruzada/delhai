import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './EditCustomer.css';

const EditCustomer = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({ ...customer });

  const provinces = [
    'Metro Manila', 'Cebu', 'Davao', 'Pampanga', 'Batangas', 'Laguna', 'Rizal', 'Bulacan',
  ];
  const citiesMetroManila = [
    'Manila', 'Makati', 'Quezon City', 'Pasig', 'Mandaluyong', 'Taguig', 'Caloocan', 'Pasay',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('You must be logged in to update a customer.');
      return;
    }

    const customerRef = ref(db, `customers/${user.uid}/${formData.id}`);

    try {
      await update(customerRef, {
        ...formData,
        completeAddress: `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.zipCode}`,
      });
      alert('Customer updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer.');
    }
  };

  return (
    <div className="edit-customer-modal">
      <div className="edit-customer-modal-content">
        <h2>Edit Customer</h2>
        <form className="edit-customer-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <label>Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} />

              <label>Street # and Name</label>
              <input type="text" name="street" value={formData.street || ''} onChange={handleChange} />

              <label>Barangay</label>
              <input type="text" name="barangay" value={formData.barangay || ''} onChange={handleChange} />

              <label>City</label>
              {formData.province === 'Metro Manila' ? (
                <select name="city" value={formData.city || ''} onChange={handleChange}>
                  <option value="">Select City</option>
                  {citiesMetroManila.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <input type="text" name="city" value={formData.city || ''} onChange={handleChange} />
              )}

              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} />

              <label>TIN #</label>
              <input type="text" name="tin" value={formData.tin || ''} onChange={handleChange} />
            </div>

            {/* Right Column */}
            <div className="form-column">
              <label>Province</label>
              <select name="province" value={formData.province || ''} onChange={handleChange}>
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>

              <label>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode || ''} onChange={handleChange} />

              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />

              <label>DR #</label>
              <input type="text" name="drNo" value={formData.drNo || ''} onChange={handleChange} />

              <label>PO #</label>
              <input type="text" name="poNo" value={formData.poNo || ''} onChange={handleChange} />

              <label>Salesman</label>
              <input type="text" name="salesman" value={formData.salesman || ''} onChange={handleChange} />
            </div>
          </div>
        </form>

        <div className="edit-customer-buttons">
          <button onClick={handleSubmit} className="btn-success">Save Changes</button>
          <button onClick={onClose} className="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
