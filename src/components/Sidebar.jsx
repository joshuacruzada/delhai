import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">
          <img src="/delhailogo.ico" alt="DELHAI Logo" className="delhai-logo-img" />
          DELHAI
        </span>
      </div>
      <div className="nav-links-wrapper">
        <nav className="nav flex-column">
          <NavLink className="nav-link" to="/" exact activeClassName="active">
            <i className="bi bi-grid-fill"></i> Dashboard
          </NavLink>
          <NavLink className="nav-link" to="/orders" activeClassName="active">
            <i className="bi bi-list-check"></i> Orders
          </NavLink>
          <NavLink className="nav-link" to="/products" activeClassName="active">
            <i className="bi bi-box-seam"></i> Products
          </NavLink>
          <NavLink className="nav-link" to="/inventory" activeClassName="active">
            <i className="bi bi-archive"></i> Inventory
          </NavLink>
          <NavLink className="nav-link" to="/invoices" activeClassName="active">
            <i className="bi bi-receipt"></i> Invoices
          </NavLink>
          <NavLink className="nav-link" to="/analytics" activeClassName="active">
            <i className="bi bi-bar-chart"></i> Analytics
          </NavLink>
          <NavLink className="nav-link settings-link" to="/settings" activeClassName="active">
            <i className="bi bi-gear"></i> Settings
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
