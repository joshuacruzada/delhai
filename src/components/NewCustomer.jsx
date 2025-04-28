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
    phone: '',
  });

  const provinces = [
    'Metro Manila', 'Cebu', 'Davao', 'Pampanga',
    'Batangas', 'Laguna', 'Rizal', 'Bulacan',
  ];

  const citiesMetroManila = [
    'Manila', 'Makati', 'Quezon City', 'Pasig',
    'Mandaluyong', 'Taguig', 'Caloocan', 'Pasay',
  ];

  const [isAdded, setIsAdded] = useState(false);
  const currentDate = new Date().toLocaleDateString();

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
      alert('You must be logged in.');
      return;
    }

    const customerRef = ref(db, `customers/${user.uid}`);
    const newCustomerRef = push(customerRef);

    await set(newCustomerRef, {
      ...formData,
      completeAddress: `${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.zipCode}`,
      dateAdded: new Date().toISOString(),
    });

    setIsAdded(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="new-customer-modal">
      {isAdded ? (
        <div className="success-modal">
          <div className="success-modal-content">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M16 26 l8 8 l16 -16" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="new-customer-modal-content">
          <div className="modal-header">
            <h2>Add New Customer</h2>
            <span className="modal-date">{currentDate}</span>
          </div>
          <form className="two-column-form">
            <div>
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label>Province</label>
              <select name="province" value={formData.province} onChange={handleChange}>
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Street # and Name</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} />
            </div>
            <div>
              <label>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />
            </div>

            <div>
              <label>Barangay</label>
              <input type="text" name="barangay" value={formData.barangay} onChange={handleChange} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label>City</label>
              {formData.province === 'Metro Manila' ? (
                <select name="city" value={formData.city} onChange={handleChange}>
                  <option value="">Select City</option>
                  {citiesMetroManila.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <input type="text" name="city" value={formData.city} onChange={handleChange} />
              )}
            </div>
            <div>
              <label>DR #</label>
              <input type="text" name="drNo" value={formData.drNo} onChange={handleChange} />
            </div>

            <div>
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label>PO #</label>
              <input type="text" name="poNo" value={formData.poNo} onChange={handleChange} />
            </div>

            <div>
              <label>TIN #</label>
              <input type="text" name="tin" value={formData.tin} onChange={handleChange} />
            </div>
            <div>
              <label>Salesman</label>
              <input type="text" name="salesman" value={formData.salesman} onChange={handleChange} />
            </div>
          </form>

          <div className="button-group">
            <button className="btn btn-success" onClick={handleSubmit}>Add Customer</button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCustomer;
