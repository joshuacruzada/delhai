
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SidebarEmployee from '../components/SidebarEmployee';

const StaffLayout = () => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/staff-login" />;

  return (
    <div className="App">
      {role === 'admin' && <Sidebar />}
      {role === 'employee' && <SidebarEmployee />}
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default StaffLayout;
