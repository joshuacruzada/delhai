// Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState({ name: '', role: '' });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const db = getDatabase();
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              name: userData.name || 'User',
              role: userData.role || 'Role',
            });
          } else {
            console.warn('No user data found in Firebase.');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    setUser({ name: '', role: '' }); // Clear user state on logout
    onLogout(); // Call the parent logout function
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header" onClick={toggleSidebar}>
        <span className="sidebar-logo">
          <img src="/delhailogo.ico" alt="DELHAI Logo" className="delhai-logo-img" />
        </span>
        {!isCollapsed && <span className="sidebar-text">DELHAI</span>}
      </div>
      
      {/* Navigation Links */}
      <div className="nav-links-wrapper">
        <nav className="nav flex-column">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-grid-fill"></i> {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink 
            to="/orders" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-list-check"></i> {!isCollapsed && <span>Orders</span>}
          </NavLink>

          <NavLink 
            to="/customers" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-people-fill"></i> {!isCollapsed && <span>Customers</span>}
          </NavLink>

          <NavLink 
            to="/products" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-box-seam"></i> {!isCollapsed && <span>Products</span>}
          </NavLink>

          <NavLink 
            to="/inventory" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-archive"></i> {!isCollapsed && <span>Inventory</span>}
          </NavLink>

          <NavLink 
            to="/invoices" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-receipt"></i> {!isCollapsed && <span>Invoices</span>}
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-bar-chart"></i> {!isCollapsed && <span>Reports</span>}
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-gear"></i> {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </nav>
      </div>

      {/* Account Section */}
      <div className="account-section">
        {!isCollapsed && (
          <>
            <i className="bi bi-person-circle account-avatar"></i>
            <div className="account-info">
              <span className="account-name">{user.name}</span>
              <span className="account-role">{user.role}</span>
            </div>
            <div className="logout-icon" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="logout-icon-collapsed" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
