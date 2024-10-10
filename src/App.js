import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    localStorage.setItem('authToken', 'your-token');
    localStorage.setItem('userRole', role); // Store user role in localStorage
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
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

            {/* Admin only routes */}
            <Route path="/" element={<ProtectedRoute element={Dashboard} allowedRoles={['admin', 'employee']} />} />
            <Route path="/invoices" element={<ProtectedRoute element={Invoices} allowedRoles={['admin', 'employee']} />} />
            <Route path="/products" element={<ProtectedRoute element={Products} allowedRoles={['admin', 'employee']} />} />
            <Route path="/analytics" element={<ProtectedRoute element={Analytics} allowedRoles={['admin']} />} />

            {/* Admin and Employee */}
            <Route path="/orders" element={<ProtectedRoute element={Orders} allowedRoles={['admin', 'employee']} />} />
            <Route path="/inventory" element={<ProtectedRoute element={Inventory} allowedRoles={['admin']} />} />
            <Route path="/stock-details" element={<ProtectedRoute element={StockDetails} allowedRoles={['admin', 'employee']} />} />

            {/* Admin only for adding/editing products */}
            <Route path="/add-product" element={<ProtectedRoute element={AddNewProduct} allowedRoles={['admin']} />} />
            <Route path="/edit-product/:id" element={<ProtectedRoute element={EditProduct} allowedRoles={['admin']} />} />

            {/* 403 page for forbidden access */}
            <Route path="/403" element={<Forbidden />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
