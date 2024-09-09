import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import LoginForm from './components/login';
import SignUpForm from './components/signup';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/stock-details" element={<StockDetails />} />
            <Route path="/login-page" element={<LoginForm />} />
            <Route path="/signup-page" element={<SignUpForm />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
