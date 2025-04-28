import React, { useState, useEffect } from 'react';
import { auth, database } from '../../../FirebaseConfig';
import { ref, get, push, set, update, remove, child } from 'firebase/database';
import AddAddressModal from './AddAddressModal';
import './AddressesSection.css';

const AddressesSection = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    postalCode: '',
    label: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    const user = auth.currentUser;
    if (user) {
      const addressesRef = ref(database, `users/${user.uid}/addresses`);
      const snapshot = await get(addressesRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedAddresses = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setAddresses(formattedAddresses);
      } else {
        setAddresses([]);
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNewAddress = async () => {
    const user = auth.currentUser;
    if (user) {
      const addressesRef = ref(database, `users/${user.uid}/addresses`);
      const newAddressRef = push(addressesRef);
      await set(newAddressRef, newAddress);
      setShowAddModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine: '',
        postalCode: '',
        label: '',
        isDefault: false,
      });
      fetchAddresses(); // Refresh after add
    }
  };

  const handleDeleteAddress = async (id) => {
    const user = auth.currentUser;
    if (user) {
      const addressRef = ref(database, `users/${user.uid}/addresses/${id}`);
      await remove(addressRef);
      fetchAddresses(); // Refresh after delete
    }
  };

  const handleEditAddress = (address) => {
    setCurrentAddressId(address.id);
    setNewAddress({
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      postalCode: address.postalCode,
      label: address.label,
      isDefault: address.isDefault || false,
    });
    setShowEditModal(true);
  };

  const handleUpdateAddress = async () => {
    const user = auth.currentUser;
    if (user && currentAddressId) {
      const addressRef = ref(database, `users/${user.uid}/addresses/${currentAddressId}`);
      await update(addressRef, newAddress);
      setShowEditModal(false);
      setCurrentAddressId(null);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine: '',
        postalCode: '',
        label: '',
        isDefault: false,
      });
      fetchAddresses(); // Refresh after edit
    }
  };

  const handleSetAsDefault = async (addressId) => {
    const user = auth.currentUser;
    if (!user) return;
  
    const userRef = ref(database, `users/${user.uid}`);
  
    try {
      const snapshot = await get(child(userRef, 'addresses'));
      if (snapshot.exists()) {
        const updates = {};
  
        // Set isDefault = true for selected address
        updates[`addresses/${addressId}/isDefault`] = true;
  
        // Set isDefault = false for other addresses
        const addresses = snapshot.val();
        Object.keys(addresses).forEach((id) => {
          if (id !== addressId) {
            updates[`addresses/${id}/isDefault`] = false;
          }
        });
  
        // Update defaultAddressId and address fields
        updates['defaultAddressId'] = addressId;
        updates['address'] = addresses[addressId].addressLine;
  
        await update(userRef, updates);
  
        alert('Default address updated successfully!');
        window.location.reload(); // Optional: refresh after update
      }
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };
  

  return (
    <div className="addresses-container">
      <div className="addresses-header">
        <h2>My Addresses</h2>
        <button onClick={() => setShowAddModal(true)} className="add-new-address-button">
          + Add New Address
        </button>
      </div>

      <div className="address-list">
        {addresses.length === 0 ? (
          <p>No addresses found.</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="address-card">
                <div>
                    <strong>{addr.fullName}</strong> ({addr.phone})
                    <p>{addr.addressLine}</p>
                    <p>{addr.postalCode}</p>
                    {addr.isDefault && <span className="default-badge">Default</span>}
                </div>

                <div className="address-actions">
                    {!addr.isDefault && (
                    <button onClick={() => handleSetAsDefault(addr.id)} className="set-default-btn">
                    Set as Default
                  </button>
                    )}
                    <button onClick={() => handleEditAddress(addr)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="delete-btn">Delete</button>
                </div>
            </div>

          ))
        )}
      </div>

      {/* Modal for Adding */}
      {showAddModal && (
        <AddAddressModal
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          onSubmit={handleAddNewAddress}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal for Editing */}
      {showEditModal && (
        <AddAddressModal
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          onSubmit={handleUpdateAddress}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default AddressesSection;
