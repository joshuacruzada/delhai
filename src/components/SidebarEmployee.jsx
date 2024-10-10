// SidebarEmployee.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const SidebarEmployee = ({ onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">
          <img src="/delhailogo.ico" alt="DELHAI Logo" className="delhai-logo-img" />
        </span>
        <span className="sidebar-text">Employee</span>
      </div>
      <div className="nav-links-wrapper">
        <nav className="nav flex-column">
          <NavLink className="nav-link" to="/employee-dashboard">
            <i className="bi bi-grid-fill"></i> <span>Dashboard</span>
          </NavLink>
          <NavLink className="nav-link" to="/orders">
            <i className="bi bi-list-check"></i> <span>Orders</span>
          </NavLink>
          <NavLink className="nav-link" to="/inventory">
            <i className="bi bi-archive"></i> <span>Inventory</span>
          </NavLink>
          <div className="nav-link logout-link" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SidebarEmployee;
