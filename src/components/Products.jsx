import React, { useState, useEffect } from 'react';
import './Products.css';
import { database } from '../FirebaseConfig'; // Adjust the import path based on your folder structure
import { ref, onValue } from 'firebase/database';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const productsRef = ref(database, 'stocks/'); // Assuming 'stocks/' path contains product data in Firebase
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Map through the data and format it for display
        const items = Object.keys(data).map(key => ({
          date: data[key].date,
          name: data[key].name,
          category: data[key].category,
        }));
        setProducts(items);
      }
    });
  }, []);

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products List</h2>
        <div className="products-controls">
          <input type="text" placeholder="Search" className="products-search" />
          <select className="category-products">
            <option value="">Category</option>
            <option value="Pharmaceuticals">Pharmaceuticals</option>
            <option value="Medical Supplies">Medical Supplies</option>
            <option value="Laboratory Reagents">Laboratory Reagents</option>
            <option value="Medical Equipment">Medical Equipment</option>
          </select>
        </div>
      </div>

      {/* Products Container */}
      <div className="products-container">
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index}>
                    <td className="products-date">{product.date}</td>
                    <td className="products-name">{product.name}</td>
                    <td className="products-category">{product.category}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );  
};

export default Products;
