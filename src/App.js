//import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//import { ref, push, get } from 'firebase/database';
//import { database } from './FirebaseConfig';
//import { getAuth } from 'firebase/auth';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import StaffLayout from './layouts/StaffLayout';

// Components
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

function App() {



  return (
    <div className="App">
      <BrowserRouter>
        <div className="content">
          <Routes>
            {/* Ecommerce Routes (no sidebar) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<SocialLogin />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/productdetail/:productId" element={<ProductDetail />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />

            {/* Auth & Public */}
            <Route path="/login-page" element={<LoginForm />} />
            <Route path="/signup-page" element={<SignUpForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/confirm-order" element={<OrderConfirmation />} />
            <Route path="/user/:userId/customer-order" element={<CustomerOrderForm />} />

            {/* Staff-Only Layout with Sidebar */}
            <Route element={<StaffLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/audit-trail" element={<AuditTrail />} />
              <Route path="/stock-details" element={<StockDetails />} />
              <Route path="/low-stocks" element={<LowStocksTable />} />
              <Route path="/out-stocks" element={<OutStockTable />} />
              <Route path="/add-product" element={<AddNewProduct />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
              <Route path="/stock-history" element={<StockHistory />} />
              <Route path="/item-history" element={<ItemHistory />} />
              <Route path="/request-orders" element={<RequestOrder />} />
              <Route path="/new-order-form" element={<NewOrderForm />} />
              <Route path="/nearly-expired" element={<NearlyExpiredProducts />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
