import React, { useEffect, useState } from 'react';
import { auth, database } from '../../../FirebaseConfig';
import { ref, get, update } from 'firebase/database';
import './ProfileSection.css';
import defaultAvatar from '../../pictures/default-avatar.png';


const ProfileSection = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    name: '',
    phone: '',
    gender: '',
    address: '',
    dateOfBirth: '',
  });

  const [profileImage, setProfileImage] = useState(defaultAvatar); 

  useEffect(() => {
    const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user) {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
      
          if (snapshot.exists()) {
            const data = snapshot.val();
      
            // Default address logic
            let defaultAddress = '';
            if (data.addresses) {
              const addressesArray = Object.values(data.addresses);
              const defaultAddr = addressesArray.find((addr) => addr.isDefault === true);
              if (defaultAddr) {
                defaultAddress = defaultAddr.addressLine || '';
              }
            }
      
            setUserData({
              username: user.displayName || '',
              email: user.email || '',
              name: data.name || '',
              phone: data.phone || '',
              gender: data.gender || '',
              address: defaultAddress || data.address || '',  // <<< If default found, prioritize it
              dateOfBirth: data.dateOfBirth || '',
            });
      
            if (data.photoURL) {
              setProfileImage(data.photoURL);
            }
          } else {
            setUserData((prev) => ({
              ...prev,
              username: user.displayName || '',
              email: user.email || '',
            }));
          }
        }
      };      

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, {
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender,
        address: userData.address,
      });
      alert('Profile updated successfully!');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // Later you can upload the file to Firebase Storage if needed
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-header">My Profile</h2>
      <p className="profile-subheader">Manage and protect your account</p>
      <div className="profile-divider" />

      <div className="profile-form">
        <div className="profile-form-left">
          <div className="profile-form-group">
            <label>Username</label>
            <input type="text" value={userData.username} disabled />
          </div>

          <div className="profile-form-group">
            <label>Name</label>
            <input type="text" name="name" value={userData.name} onChange={handleChange} />
          </div>

          <div className="profile-form-group">
            <label>Email</label>
            <input type="email" value={userData.email} disabled />
          </div>

          <div className="profile-form-group">
            <label>Phone Number</label>
            <input type="text" name="phone" value={userData.phone} onChange={handleChange} />
          </div>

          <div className="profile-form-group">
            <label>Gender</label>
            <div className="profile-gender-options">
              <label><input type="radio" name="gender" value="male" checked={userData.gender === 'male'} onChange={handleChange} /> Male</label>
              <label><input type="radio" name="gender" value="female" checked={userData.gender === 'female'} onChange={handleChange} /> Female</label>
              <label><input type="radio" name="gender" value="other" checked={userData.gender === 'other'} onChange={handleChange} /> Other</label>
            </div>
          </div>

          <div className="profile-form-group">
            <label>Address</label>
            <input type="text" name="address" value={userData.address} onChange={handleChange} />
          </div>

          <div className="profile-form-group">
            <label>Date of Birth</label>
            <input type="text" value={userData.dateOfBirth ? userData.dateOfBirth : '**/**/****'} disabled />
          </div>

          <div className="profile-form-actions">
            <button onClick={handleSave} className="profile-save-button">Save</button>
          </div>
        </div>

        <div className="profile-form-right">
          <div className="profile-avatar-placeholder">
            <img src={profileImage} alt="Profile" className="profile-avatar-img" />
            <input
              type="file"
              accept="image/*"
              id="upload-profile-image"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="upload-profile-image" className="profile-avatar-button">
              Select Image
            </label>
            <p className="profile-avatar-info">File size: maximum 1MB<br />File extension: .JPEG, .PNG</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
