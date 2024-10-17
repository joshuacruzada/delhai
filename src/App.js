import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ref, push } from 'firebase/database'; // Firebase ref and push functions
import { database } from './FirebaseConfig'; // Firebase config
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/Sidebar';
import SidebarEmployee from './components/SidebarEmployee';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Invoices from './components/Invoices';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Analytics from './components/Analytics';
import StockDetails from './components/StockDetails';
import AddNewProduct from './components/AddNewProduct';
import EditProduct from './components/EditProduct';
import LoginForm from './components/login';
import SignUpForm from './components/signup';
import Forbidden from './components/Forbidden';
import AuditTrail from './components/AuditTrail';
import Settings from './components/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (token) {
      setIsAuthenticated(true);
      setUserRole(role); // Store user role in state
    }
  }, []);

  const handleLogin = async (role, userId, userName) => {
    setIsAuthenticated(true);
    setUserRole(role); // Set role in state

    localStorage.setItem('authToken', 'your-token'); // Store mock token
    localStorage.setItem('userRole', role); // Store role in localStorage
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);

    const auditLogEntry = {
      userId: userId,
      userName: userName,
      action: 'User Logged In',
      timestamp: new Date().toISOString(),
    };

    const auditRef = ref(database, 'auditTrail/');
    try {
      await push(auditRef, auditLogEntry);
      console.log('Login audit log entry created successfully.');
    } catch (error) {
      console.error('Error creating login audit log entry:', error);
    }
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    const auditLogEntry = {
      userId: userId,
      userName: userName,
      action: 'User Logged Out',
      timestamp: new Date().toISOString(),
    };

    const auditRef = ref(database, 'auditTrail/');
    try {
      await push(auditRef, auditLogEntry);
      console.log('Logout audit log entry created successfully.');

      // Clear state and local storage
      setIsAuthenticated(false);
      setUserRole('');
      localStorage.clear();

      // Redirect to login page
      window.location.assign('/login-page');
    } catch (error) {
      console.error('Error logging out and creating audit entry:', error);
    }
  };

  const ProtectedRoute = ({ element: Component, allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (!token) return <Navigate to="/login-page" />;
    if (allowedRoles.includes(role)) return <Component />;
    return <Navigate to="/403" />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        {/* Conditionally render sidebars based on the user's role */}
        {isAuthenticated && userRole === 'admin' && <Sidebar onLogout={handleLogout} />}
        {isAuthenticated && userRole === 'employee' && <SidebarEmployee onLogout={handleLogout} />}

        <div className="content">
          <Routes>
            <Route path="/login-page" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/signup-page" element={<SignUpForm />} />
            <Route path="/" element={<ProtectedRoute element={Dashboard} allowedRoles={['admin', 'employee']} />} />
            <Route path="/invoices" element={<ProtectedRoute element={Invoices} allowedRoles={['admin', 'employee']} />} />
            <Route path="/products" element={<ProtectedRoute element={Products} allowedRoles={['admin', 'employee']} />} />
            <Route path="/analytics" element={<ProtectedRoute element={Analytics} allowedRoles={['admin']} />} />
            <Route path="/orders" element={<ProtectedRoute element={Orders} allowedRoles={['admin', 'employee']} />} />
            <Route path="/inventory" element={<ProtectedRoute element={Inventory} allowedRoles={['admin']} />} />
            <Route path="/stock-details" element={<ProtectedRoute element={StockDetails} allowedRoles={['admin', 'employee']} />} />
            <Route path="/add-product" element={<ProtectedRoute element={AddNewProduct} allowedRoles={['admin']} />} />
            <Route path="/edit-product/:id" element={<ProtectedRoute element={EditProduct} allowedRoles={['admin']} />} />
            <Route path="/settings" element={<ProtectedRoute element={Settings} allowedRoles={['admin']} />} />
            <Route path="/audit-trail" element={<ProtectedRoute element={AuditTrail} allowedRoles={['admin']} />} />
            <Route path="/403" element={<Forbidden />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
