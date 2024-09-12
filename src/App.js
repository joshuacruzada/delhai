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
<<<<<<< HEAD
import AddNewProduct from './components/AddNewProduct';
import EditProduct from './components/EditProduct';  // New edit product component

=======
import LoginForm from './components/login';
import SignUpForm from './components/signup';
>>>>>>> 4128c6b37d1a86cc74edcd7cc2130f9531704c52
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
<<<<<<< HEAD
            <Route path="/add-product" element={<AddNewProduct />} />  {/* Route for adding product */}
            <Route path="/edit-product/:id" element={<EditProduct />} />  {/* Route for editing product */}
=======
            <Route path="/login-page" element={<LoginForm />} />
            <Route path="/signup-page" element={<SignUpForm />} />
>>>>>>> 4128c6b37d1a86cc74edcd7cc2130f9531704c52
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
