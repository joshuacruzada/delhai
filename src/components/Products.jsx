import React, { useState, useEffect } from 'react';
import './Products.css';
import { database } from '../FirebaseConfig'; // Adjust the import path based on your folder structure
import { ref, onValue } from 'firebase/database';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [expandedRows, setExpandedIndex] = useState(null); // Track which product is expanded

  useEffect(() => {
    const productsRef = ref(database, 'stocks/'); // Assuming 'stocks/' path contains product data in Firebase
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map(key => ({
          id: key,  // Add an ID for key purposes
          name: data[key].name || 'No Name',  // Display product name
          description: data[key].description || 'No description available',
          category: data[key].category,
          imageUrl: data[key].imageUrl || '',
          pricePerBox: data[key].pricePerBox || 0,
          pricePerTest: data[key].pricePerTest || 0,
          pricePerPiece: data[key].pricePerPiece || 'N/A', // Price per piece
          quantity: data[key].quantity || 0,
          criticalStock: data[key].criticalStock || 0,
          expiryDate: data[key].expiryDate || 'N/A',
          piecesPerBox: data[key].piecesPerBox || 'N/A', // Add pieces per box
          packaging: data[key].packaging || 'N/A',  // Add packaging type
        }));
        setProducts(items);
      }
    });
  }, []);

  // Function to toggle product expansion
  const toggleExpand = (index) => {
    setExpandedIndex(expandedRows === index ? null : index);
  };

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
                <th>Item Description</th>
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
                  <React.Fragment key={product.id}>
                  <tr className={product.quantity < product.criticalStock ? 'low-stock-highlight' : ''}>
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
                      {product.description}
                    </td>
                    <td className="products-price">
                      {product.pricePerBox ? `₱${Number(product.pricePerBox).toFixed(2)}` : '₱0.00'}
                    </td>
                    <td className="products-price">
                      {product.pricePerTest ? `₱${Number(product.pricePerTest).toFixed(2)}` : '₱0.00'}
                    </td>
                    <td className="products-stocks">{product.quantity}</td>
                    <td className="products-category">{product.category}</td>
                    <td className="products-expiry">{product.expiryDate}</td>
                    <td className="products-action">
                      <button className="toggle-btn" onClick={() => toggleExpand(index)}>
                        {expandedRows === index ? (
                          <i className="bi bi-chevron-up"></i> /* Up arrow icon */
                        ) : (
                          <i className="bi bi-chevron-down"></i> /* Down arrow icon */
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded row with additional details */}
                  {expandedRows === index && (
                    <tr>
                      <td colSpan="8" className="expanded-row">
                        <div className="expanded-content">
                          <p>
                            <strong>Packaging:</strong> {product.packaging}
                          </p>
                          <p>
                            <strong>Pieces Per Box:</strong> {product.piecesPerBox}
                          </p>
                          <p>
                            <strong>Critical Stock:</strong> {product.criticalStock}
                          </p>
                          <p>
                            <strong>Price Per Piece:</strong>{' '}
                            {Number.isFinite(Number(product.pricePerPiece))
                              ? `₱${Number(product.pricePerPiece).toFixed(2)}`
                              : 'N/A'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No products available.</td>
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
