import React, { useState, useEffect } from 'react';
import './Products.css';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Products after filtering
  const [expandedRows, setExpandedIndex] = useState(null); // Track which product is expanded
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const productsRef = ref(database, 'stocks/');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          id: key, // Add an ID for key purposes
          name: data[key].name || 'No Name', // Display product name
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
          packaging: data[key].packaging || 'N/A', // Add packaging type
        }));
        setProducts(items);
        setFilteredProducts(items); // Initially, all products are displayed
      }
    });
  }, []);

  // Function to toggle product expansion
  const toggleExpand = (index) => {
    setExpandedIndex(expandedRows === index ? null : index);
  };

  // Function to handle search
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterProducts(query, selectedCategory);
  };

  // Function to handle category filter
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterProducts(searchQuery, category);
  };

  // Function to filter products based on search and category
  const filterProducts = (query, category) => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory =
        !category || product.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products List</h2>
        <div className="products-controls">
          <input
            type="text"
            placeholder="Search"
            className="products-search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <select
            className="category-products"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Category</option>
            <option value="Rapid Tests & Diagnostic Products">Rapid Tests & Diagnostic Products</option>
            <option value="X-Ray & Imaging Products">X-Ray & Imaging Products</option>
            <option value="Laboratory Reagents & Supplies">Laboratory Reagents & Supplies</option>
            <option value="Medical Supplies">Medical Supplies</option>
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
                <th>Item Name</th>
                <th>Item Description</th>
                <th>Price Per Box</th>
                <th>Price Per Test</th>
                <th>Stocks</th>
                <th>Category</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const isLowStock =
                    product.quantity < product.criticalStock; // Low stock logic
                  const isNearlyExpired =
                    product.expiryDate !== 'N/A' &&
                    new Date(product.expiryDate).getTime() - new Date().getTime() <=
                      7 * 24 * 60 * 60 * 1000; // Within 7 days

                  return (
                    <React.Fragment key={product.id}>
                      <tr
                        className={`${isLowStock ? 'low-stock-highlight' : ''} ${
                          isNearlyExpired ? 'nearly-expired-highlight' : ''
                        }`}
                      >
                        <td className="products-image">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="product-image"
                            />
                          ) : (
                            'No Image'
                          )}
                        </td>
                        <td className="item-name">{product.name}</td>
                        <td className="item-description">{product.description}</td>
                        <td className="products-price">
                          {product.pricePerBox
                            ? `₱${Number(product.pricePerBox).toFixed(2)}`
                            : '₱0.00'}
                        </td>
                        <td className="products-price">
                          {product.pricePerTest
                            ? `₱${Number(product.pricePerTest).toFixed(2)}`
                            : '₱0.00'}
                        </td>
                        <td className="products-stocks">{product.quantity}</td>
                        <td className="products-category">{product.category}</td>
                        <td className="products-expiry">{product.expiryDate}</td>
                        <td className="products-action">
                          <button
                            className="toggle-btn"
                            onClick={() => toggleExpand(index)}
                          >
                            {expandedRows === index ? (
                              <i className="bi bi-chevron-up"></i>
                            ) : (
                              <i className="bi bi-chevron-down"></i>
                            )}
                          </button>
                        </td>
                      </tr>

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
                  );
                })
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
