// Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './Sidebar.css';
import { IconLogout } from '@tabler/icons-react';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { IconShoppingBagCheck } from '@tabler/icons-react';
import { IconUsersPlus } from '@tabler/icons-react';
import { IconBox } from '@tabler/icons-react';
import { IconArchive } from '@tabler/icons-react';
import { IconFileInvoice } from '@tabler/icons-react';
import { IconChartHistogram } from '@tabler/icons-react';
import { IconSettings } from '@tabler/icons-react';
import { IconUserCircle } from '@tabler/icons-react';
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
    onLogout(); 
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
            to="/dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i><IconLayoutDashboard stroke={2} /></i> {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink 
            to="/orders" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
           <i><IconShoppingBagCheck stroke={2} /></i> {!isCollapsed && <span>Orders</span>}
          </NavLink>

          <NavLink 
            to="/customers" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i><IconUsersPlus stroke={2} /></i> {!isCollapsed && <span>Customers</span>}
          </NavLink>

          <NavLink 
            to="/products" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
           <i><IconBox stroke={2} /> </i>{!isCollapsed && <span>Products</span>}
          </NavLink>

          <NavLink 
            to="/inventory" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i><IconArchive stroke={2} /></i> {!isCollapsed && <span>Inventory</span>}
          </NavLink>

          <NavLink 
            to="/invoices" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
          <i><IconFileInvoice stroke={2} /></i> {!isCollapsed && <span>Invoices</span>}
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
          <i> <IconChartHistogram stroke={2} /></i> {!isCollapsed && <span>Reports</span>}
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
          <i><IconSettings stroke={2} /></i> {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </nav>
      </div>

      {/* Account Section */}
      <div className="account-section">
        {!isCollapsed && (
          <>
            <i><IconUserCircle stroke={2} color="white" size={45}/></i>
            <div className="account-info">
              <span className="account-name">{user.name}</span>
              <span className="account-role">{user.role}</span>
            </div>
            <div className="logout-icon" onClick={handleLogout}>
              <IconLogout stroke={2} />
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="logout-icon-collapsed" onClick={handleLogout}>
            <IconLogout stroke={2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
