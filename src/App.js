import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ref, push, get } from 'firebase/database';
import { database } from './FirebaseConfig';
import { getAuth } from 'firebase/auth';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Sidebar from './components/Sidebar';
import SidebarEmployee from './components/SidebarEmployee';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import CustomerList from './components/CustomerList';
import CustomerOrderForm from './components/CustomerOrderForm';
import Invoices from './components/Invoices';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Analytics from './components/Analytics';
import StockDetails from './components/StockDetails';
import LowStocksTable from './components/LowStocksTable';
import OutStockTable from './components/OutStockTable';
import AddNewProduct from './components/AddNewProduct';
import EditProduct from './components/EditProduct';
import LoginForm from './components/login';
import SignUpForm from './components/signup';
import ForgotPassword from './components/ForgotPassword';
import AuditTrail from './components/AuditTrail';
import Settings from './components/Settings';
import RequestOrder from './components/RequestOrder';
import OrderConfirmation from './components/OrderConfirmation';
import StockHistory from './components/StockHIstory';
import NewOrderForm from './components/NewOrderForm';
import NearlyExpiredProducts from './components/NearlyExpiredProducts';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (token) {
      setIsAuthenticated(true);
      setUserRole(role); 
    }
  }, []);

  const handleLogin = async (role, userId, userName) => {
    setIsAuthenticated(true);
    setUserRole(role);

    localStorage.setItem('authToken', 'your-token');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);

    const auditLogEntry = {
      userId,
      userName,
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
    const auth = getAuth();
    const currentUser = auth.currentUser;
    let userId = null;
    let userName = null;

    if (currentUser) {
      userId = currentUser.uid;

      try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          userName = userData.name || 'Unknown User';
        }
      } catch (error) {
        console.error('Error fetching user details during logout:', error);
      }
    }

    const auditLogEntry = {
      userId: userId || 'Unknown ID',
      userName: userName || 'Unknown User',
      action: 'User Logged Out',
      timestamp: new Date().toISOString(),
    };

    const auditRef = ref(database, 'auditTrail/');
    try {
      await push(auditRef, auditLogEntry);
      console.log('Logout audit log entry created successfully.');

      setIsAuthenticated(false);
      setUserRole('');
      localStorage.clear();

      window.location.assign('/login-page');
    } catch (error) {
      console.error('Error logging out:', error);
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
        {isAuthenticated && userRole === 'admin' && <Sidebar onLogout={handleLogout} />}
        {isAuthenticated && userRole === 'employee' && <SidebarEmployee onLogout={handleLogout} />}

        <div className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login-page" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup-page" element={<SignUpForm />} />
            <Route path="/confirm-order" element={<OrderConfirmation />} />
            <Route path="/user/:userId/customer-order" element={<CustomerOrderForm />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute element={Dashboard} allowedRoles={['admin', 'employee']} />} />
            <Route path="/invoices" element={<ProtectedRoute element={Invoices} allowedRoles={['admin', 'employee']} />} />
            <Route path="/products" element={<ProtectedRoute element={Products} allowedRoles={['admin', 'employee']} />} />
            <Route path="/analytics" element={<ProtectedRoute element={Analytics} allowedRoles={['admin']} />} />
            <Route path="/orders" element={<ProtectedRoute element={Orders} allowedRoles={['admin', 'employee']} />} />
            <Route path="/customers" element={<ProtectedRoute element={CustomerList} allowedRoles={['admin', 'employee']} />} />
            <Route path="/inventory" element={<ProtectedRoute element={Inventory} allowedRoles={['admin']} />} />
            <Route path="/stock-details" element={<ProtectedRoute element={StockDetails} allowedRoles={['admin', 'employee']} />} />
            <Route path="/low-stocks" element={<ProtectedRoute element={LowStocksTable} allowedRoles={['admin', 'employee']} />} />
            <Route path="/out-stocks" element={<ProtectedRoute element={OutStockTable} allowedRoles={['admin', 'employee']} />} />
            <Route path="/add-product" element={<ProtectedRoute element={AddNewProduct} allowedRoles={['admin']} />} />
            <Route path="/edit-product/:id" element={<ProtectedRoute element={EditProduct} allowedRoles={['admin']} />} />
            <Route path="/settings" element={<ProtectedRoute element={Settings} allowedRoles={['admin']} />} />
            <Route path="/audit-trail" element={<ProtectedRoute element={AuditTrail} allowedRoles={['admin']} />} />
            <Route path="/stock-history" element={<ProtectedRoute element={StockHistory} allowedRoles={['admin', 'employee']} />} />
            <Route path="/request-orders" element={<ProtectedRoute element={RequestOrder} allowedRoles={['admin', 'employee']} />} />
            <Route path="/new-order-form" element={<ProtectedRoute element={NewOrderForm} allowedRoles={['admin', 'employee']} />} />
            <Route path="/nearly-expired" element={<ProtectedRoute element={NearlyExpiredProducts} allowedRoles={['admin', 'employee']} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
