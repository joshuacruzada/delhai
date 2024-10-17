// SidebarEmployee.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Import your sidebar styles

const SidebarEmployee = ({ onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">
          <img src="/delhailogo.ico" alt="DELHAI Logo" className="delhai-logo-img" />
        </span>
        <span className="sidebar-text">DELHAI</span>
      </div>

      <div className="nav-links-wrapper">
        <nav className="nav flex-column">
          {/* Dashboard Link */}
          <NavLink className="nav-link" to="/employee-dashboard">
            <i className="bi bi-grid-fill"></i> <span>Dashboard</span>
          </NavLink>

          {/* Orders Link */}
          <NavLink className="nav-link" to="/orders">
            <i className="bi bi-list-check"></i> <span>Orders</span>
          </NavLink>

          {/* Invoices Link */}
          <NavLink className="nav-link" to="/invoices">
            <i className="bi bi-file-text-fill"></i> <span>Invoices</span>
          </NavLink>

          {/* Products List Link */}
          <NavLink className="nav-link" to="/products">
            <i className="bi bi-box-seam"></i> <span>Products List</span>
          </NavLink>

          {/* Logout Link */}
          <div className="nav-link logout-link" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SidebarEmployee;
