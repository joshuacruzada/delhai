import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './UpperBar.css';

const ProfileDropdown = ({ user, handleLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const handleClick = () => {
    setShowDropdown((prev) => !prev);
  };

  // Optional: close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div
      className="user-profile-wrapper"
      ref={wrapperRef}
    >
      <div
        className="user-profile-button"
        onClick={handleClick}
      >
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" className="profile-picture" />
        )}
        <span className="profile-name">{user.displayName || user.email}</span>
      </div>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="dropdown-arrow" />
          <Link to="/my-account" className="dropdown-item">My Account</Link>
          <Link to="/my-account/my-purchase" className="dropdown-item">My Purchase</Link>
          <button onClick={handleLogout} className="dropdown-item logout-btn">Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
