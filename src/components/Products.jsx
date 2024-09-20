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
          description: data[key].description || data[key].name, // Add product description (or fallback to name)
          category: data[key].category,
          imageUrl: data[key].imageUrl || '', // Add image URL
          pricePerBox: data[key].pricePerBox || 0, // Add price per box
          pricePerTest: data[key].pricePerTest || 0, // Add price per test
          quantity: data[key].quantity || 0, 
          expiryDate: data[key].expiryDate || '', 
          measurementValue: data[key].measurementValue || '', 
          measurementUnit: data[key].measurementUnit || '', 
          name: data[key].name || '', 
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
                <th> </th>
                <th>Item Description</th> {/* Updated header */}
                <th>Price Per Box</th>
                <th>Price Per Test</th>
                <th>Stocks</th>
                <th>Category</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index}>
                    <td className="products-image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="item-description">
                      <strong>{product.name}</strong>
                      <br />
                      {product.description || 'No description available'} {/* Display description */}
                    </td> {/* Updated to include description */}
                    <td className="products-price">
                      {product.pricePerBox ? `₱${Number(product.pricePerBox).toFixed(2)}` : '₱0.00'}
                    </td>
                    <td className="products-price">
                      {product.pricePerTest ? `₱${Number(product.pricePerTest).toFixed(2)}` : '₱0.00'}
                    </td>
                    <td className="products-stocks">{product.quantity}</td>
                    <td className="products-category">{product.category}</td>
                    <td className="products-expiry">{product.expiryDate || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No products available.</td>
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
