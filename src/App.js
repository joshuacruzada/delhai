import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ItemHistory from './components/ItemHistory';
import LandingPage from './ecommerce/components/LandingPage';
import Shop from './ecommerce/components/Shop';
import ProductDetail from './ecommerce/components/ProductDetail';
import SocialLogin from './ecommerce/components/SocialLogin';
import Cart from './ecommerce/components/Cart';
import PaymentSuccess from './ecommerce/components/PaymentSuccess';
import PaymentCancel from './ecommerce/components/PaymentCancel';

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const location = useLocation();

  const isEcommerceRoute = [
    '/',
    '/shop',
    '/cart',
    '/productdetail/:productId',
    '/payment-success',
    '/payment-cancel',
    '/login'
  ].some((route) => location.pathname.startsWith(route));

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
    } catch (error) {
      console.error('Error logging in:', error);
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
        console.error('Error fetching user info:', error);
      }
    }

    const auditLogEntry = {
      userId: userId || 'Unknown ID',
      userName: userName || 'Unknown User',
      action: 'User Logged Out',
      timestamp: new Date().toISOString(),
    };

    try {
      await push(ref(database, 'auditTrail/'), auditLogEntry);
      setIsAuthenticated(false);
      setUserRole('');
      localStorage.clear();
      window.location.assign('/staff-login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const ProtectedRoute = ({ element: Component, allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    if (!token) return <Navigate to="/staff-login" />;
    if (allowedRoles.includes(role)) return <Component />;
    return <Navigate to="/403" />;
  };

  return (
    <div className="App">
      {!isEcommerceRoute && isAuthenticated && userRole === 'admin' && (
        <Sidebar onLogout={handleLogout} />
      )}
      {!isEcommerceRoute && isAuthenticated && userRole === 'employee' && (
        <SidebarEmployee onLogout={handleLogout} />
      )}

      <div className="content">
        <Routes>
          {/* Ecommerce / Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SocialLogin />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/productdetail/:productId" element={<ProductDetail />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

          {/* Auth */}
          <Route path="/staff-login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/signup-page" element={<SignUpForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Shared */}
          <Route path="/confirm-order" element={<OrderConfirmation />} />
          <Route path="/user/:userId/customer-order" element={<CustomerOrderForm />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} allowedRoles={['admin', 'employee']} />} />
          <Route path="/orders" element={<ProtectedRoute element={Orders} allowedRoles={['admin', 'employee']} />} />
          <Route path="/customers" element={<ProtectedRoute element={CustomerList} allowedRoles={['admin', 'employee']} />} />
          <Route path="/invoices" element={<ProtectedRoute element={Invoices} allowedRoles={['admin', 'employee']} />} />
          <Route path="/products" element={<ProtectedRoute element={Products} allowedRoles={['admin', 'employee']} />} />
          <Route path="/inventory" element={<ProtectedRoute element={Inventory} allowedRoles={['admin']} />} />
          <Route path="/analytics" element={<ProtectedRoute element={Analytics} allowedRoles={['admin']} />} />
          <Route path="/stock-details" element={<ProtectedRoute element={StockDetails} allowedRoles={['admin', 'employee']} />} />
          <Route path="/low-stocks" element={<ProtectedRoute element={LowStocksTable} allowedRoles={['admin', 'employee']} />} />
          <Route path="/out-stocks" element={<ProtectedRoute element={OutStockTable} allowedRoles={['admin', 'employee']} />} />
          <Route path="/add-product" element={<ProtectedRoute element={AddNewProduct} allowedRoles={['admin']} />} />
          <Route path="/edit-product/:id" element={<ProtectedRoute element={EditProduct} allowedRoles={['admin']} />} />
          <Route path="/settings" element={<ProtectedRoute element={Settings} allowedRoles={['admin']} />} />
          <Route path="/audit-trail" element={<ProtectedRoute element={AuditTrail} allowedRoles={['admin']} />} />
          <Route path="/stock-history" element={<ProtectedRoute element={StockHistory} allowedRoles={['admin', 'employee']} />} />
          <Route path="/item-history" element={<ProtectedRoute element={ItemHistory} allowedRoles={['admin', 'employee']} />} />
          <Route path="/request-orders" element={<ProtectedRoute element={RequestOrder} allowedRoles={['admin', 'employee']} />} />
          <Route path="/new-order-form" element={<ProtectedRoute element={NewOrderForm} allowedRoles={['admin', 'employee']} />} />
          <Route path="/nearly-expired" element={<ProtectedRoute element={NearlyExpiredProducts} allowedRoles={['admin', 'employee']} />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppWrapper;
