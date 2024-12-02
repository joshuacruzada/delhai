import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState({ name: '', role: '' });

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
      <div className="sidebar-header" onClick={toggleSidebar}>
        <span className="sidebar-logo">
          <img src="/delhailogo.ico" alt="DELHAI Logo" className="delhai-logo-img" />
        </span>
        {!isCollapsed && <span className="sidebar-text">DELHAI</span>}
      </div>
      
      <div className="nav-links-wrapper">
        <nav className="nav flex-column">
          <NavLink className="nav-link" to="/" exact activeClassName="active">
            <i className="bi bi-grid-fill"></i> {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink className="nav-link" to="/orders" activeClassName="active">
            <i className="bi bi-list-check"></i> {!isCollapsed && <span>Orders</span>}
          </NavLink>
          <NavLink className="nav-link" to="/products" activeClassName="active">
            <i className="bi bi-box-seam"></i> {!isCollapsed && <span>Products</span>}
          </NavLink>
          <NavLink className="nav-link" to="/inventory" activeClassName="active">
            <i className="bi bi-archive"></i> {!isCollapsed && <span>Inventory</span>}
          </NavLink>
          <NavLink className="nav-link" to="/invoices" activeClassName="active">
            <i className="bi bi-receipt"></i> {!isCollapsed && <span>Invoices</span>}
          </NavLink>
          <NavLink className="nav-link" to="/analytics" activeClassName="active">
            <i className="bi bi-bar-chart"></i> {!isCollapsed && <span>Reports</span>}
          </NavLink>
          <NavLink className="nav-link" to="/settings" activeClassName="active">
            <i className="bi bi-gear"></i> {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </nav>
      </div>

      {/* Account section at the bottom */}
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
