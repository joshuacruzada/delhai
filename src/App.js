import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ref, push } from 'firebase/database'; // Import ref and push for Firebase
import { database } from './FirebaseConfig'; // Ensure this path is correct
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/Sidebar';
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
import AuditTrail from './components/AuditTrail'; // Import AuditTrail
import Settings from './components/Settings'; // Import Settings

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (role, userId, userName) => {
    // Set authentication state
    setIsAuthenticated(true);
    localStorage.setItem('authToken', 'your-token'); // Store a mock token
    localStorage.setItem('userRole', role); // Store user role
    localStorage.setItem('userId', userId); // Store user ID
    localStorage.setItem('userName', userName); // Store user name

    // Create a new audit log entry for successful login
    const auditLogEntry = {
      userId: userId,
      userName: userName,
      action: "User Logged In",
      timestamp: new Date().toISOString() // Use ISO format for consistency
    };

    // Reference to your audit trail in Firebase
    const auditRef = ref(database, 'auditTrail/');
    try {
      await push(auditRef, auditLogEntry); // Use push to add a new log entry
      console.log('Login audit log entry created successfully.');
    } catch (error) {
      console.error('Error creating login audit log entry:', error);
    }
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('userId'); // Get user ID from localStorage
    const userName = localStorage.getItem('userName'); // Get user name from localStorage

    // Create a new audit log entry for logout
    const auditLogEntry = {
      userId: userId,
      userName: userName,
      action: "User Logged Out",
      timestamp: new Date().toISOString() // Use ISO format for consistency
    };

    // Reference to your audit trail in Firebase
    const auditRef = ref(database, 'auditTrail/');
    try {
      await push(auditRef, auditLogEntry); // Use push to add a new log entry
      console.log('Logout audit log entry created successfully.');

      // Proceed to logout
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId'); // Clear user ID
      localStorage.removeItem('userName'); // Clear user name
    } catch (error) {
      console.error('Error logging out and creating audit entry:', error);
    }
  };

  const ProtectedRoute = ({ element: Component, allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!token) return <Navigate to="/login-page" />;
    if (allowedRoles.includes(userRole)) return <Component />;
    return <Navigate to="/403" />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        {isAuthenticated && <Sidebar onLogout={handleLogout} />}
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
