import React, { useState } from 'react';
import regionsData from '../../utils/regionsData'; 
import './AddAddressModal.css'; 

const AddAddressModal = ({ newAddress, setNewAddress, onSubmit, onClose }) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('Region');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [postalError, setPostalError] = useState(false);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setSelectedCity('');
    setSelectedBarangay('');
    setActiveTab('City');
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedBarangay('');
    setActiveTab('Barangay');
  };

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay);
    setNewAddress({
      ...newAddress,
      addressLine: `${barangay}, ${selectedCity}, ${selectedRegion}`,
    });
    setShowLocationDropdown(false);
  };

  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    setNewAddress({ ...newAddress, postalCode: value });
    setPostalError(!/^\d{4}$/.test(value));
  };

  return (
    <div className="add-address-modal-overlay">
      <div className="add-address-modal-content">
        <h3 className="add-address-modal-title">New Address</h3>

        <div className="add-address-modal-form">

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="add-address-modal-input"
            value={newAddress.fullName}
            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
          />

          {/* Phone Number */}
          <input
            type="text"
            placeholder="Phone Number"
            className="add-address-modal-input"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
          />

          {/* Address Selection */}
          <div 
            className="add-address-modal-input add-address-location-selector" 
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            {selectedBarangay ? `${selectedBarangay}, ${selectedCity}, ${selectedRegion}` : "Region, Province, City, Barangay"}
            <span className="add-address-location-arrow">&#9662;</span>
          </div>

          {/* Dropdown */}
          {showLocationDropdown && (
            <div className="add-address-location-dropdown">
              <div className="add-address-location-tabs">
                <span
                  className={`add-address-location-tab ${activeTab === 'Region' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Region')}
                >
                  Region
                </span>
                <span
                  className={`add-address-location-tab ${activeTab === 'City' ? 'active' : ''}`}
                  onClick={() => selectedRegion && setActiveTab('City')}
                >
                  City
                </span>
                <span
                  className={`add-address-location-tab ${activeTab === 'Barangay' ? 'active' : ''}`}
                  onClick={() => selectedCity && setActiveTab('Barangay')}
                >
                  Barangay
                </span>
              </div>

              <div className="add-address-location-options">
                {activeTab === 'Region' &&
                  Object.keys(regionsData).map((region) => (
                    <div
                      key={region}
                      className="add-address-location-option"
                      onClick={() => handleRegionSelect(region)}
                    >
                      {region}
                    </div>
                  ))
                }
                {activeTab === 'City' && selectedRegion &&
                  Object.keys(regionsData[selectedRegion]).map((city) => (
                    <div
                      key={city}
                      className="add-address-location-option"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))
                }
                {activeTab === 'Barangay' && selectedCity &&
                  regionsData[selectedRegion][selectedCity].map((barangay) => (
                    <div
                      key={barangay}
                      className="add-address-location-option"
                      onClick={() => handleBarangaySelect(barangay)}
                    >
                      {barangay}
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Postal Code */}
          <input
            type="text"
            placeholder="Postal Code"
            className={`add-address-modal-input ${postalError ? 'input-error' : ''}`}
            value={newAddress.postalCode}
            onChange={handlePostalCodeChange}
          />
          {postalError && <div className="add-address-postal-error">Invalid postal code</div>}

          {/* Street Details */}
          <input
            type="text"
            placeholder="Street Name, Building, House No."
            className="add-address-modal-input"
            value={newAddress.streetDetail || ''}
            onChange={(e) => setNewAddress({ ...newAddress, streetDetail: e.target.value })}
          />

          {/* Label */}
          <div className="add-address-modal-label-group">
            <label className="add-address-modal-radio">
              <input
                type="radio"
                name="addressLabel"
                value="Home"
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              />
              Home
            </label>
            <label className="add-address-modal-radio">
              <input
                type="radio"
                name="addressLabel"
                value="Work"
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              />
              Work
            </label>
          </div>

          {/* Set as Default */}
          <div className="add-address-modal-checkbox">
            <label className="add-address-modal-checkbox-label">
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
              />
              Set as Default Address
            </label>
          </div>

          {/* Buttons */}
          <div className="add-address-modal-buttons">
            <button onClick={onClose} className="add-address-modal-cancel-btn">Cancel</button>
            <button onClick={onSubmit} className="add-address-modal-submit-btn">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;
