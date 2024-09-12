import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); // State to handle collapsed sidebar

  // Function to handle collapsing and expanding
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" onClick={toggleSidebar}>
        {/* Clicking the logo or the header triggers the collapse/expand */}
        <span className="sidebar-logo">
          <img src="/delhailogo.ico" alt="DELHAI Logo" className="delhai-logo-img" />
        </span>
        {!isCollapsed && (
          <span className="sidebar-text">
            DELHAI
          </span>
        )}
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
          <NavLink className="nav-link settings-link" to="/settings" activeClassName="active">
            <i className="bi bi-gear"></i> {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
