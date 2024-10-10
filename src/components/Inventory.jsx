import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventory.css';
import { fetchStocks, deleteProduct } from '../services/stockServices';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  // Fetch products from Firebase on component mount
  useEffect(() => {
    fetchStocks(setInventoryItems); // Fetch data and update state
  }, []);

  // Navigate to edit product page
  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  // Navigate to add new product page
  const handleAddNewProduct = () => {
    navigate('/add-product');
  };

  // Delete the product
  const handleDelete = (id) => {
    deleteProduct(id, () => fetchStocks(setInventoryItems));
  };

  // Filter by category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <div className="inventory-actions">
          <input type="text" placeholder="Search" className="search-input" />
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            <option value="Surgical">Surgical</option>
            <option value="Pharmaceutical">Pharmaceutical</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Medical Supplies">Medical Supplies</option>
          </select>
          <button className="new-product-btn" onClick={handleAddNewProduct}>
            + Add New Product
          </button>
        </div>
      </div>

      <div className="inventory-container">
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Stock</th>
                <th>Packaging</th>
                <th>Item Name & Description</th> 
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length > 0 ? (
                inventoryItems
                  .filter(
                    (item) =>
                      selectedCategory === 'All' || item.category === selectedCategory
                  )
                  .map((item) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        {/* Display product image */}
                        <td className="image-column">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="product-image"
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </td>
                        <td className="stock">{`${item.quantity} ${item.quantityUnit || ''}`}</td>
                        <td className="packaging">{item.packaging || 'N/A'}</td>
                        <td className="item-description">
                          <strong>{item.name}</strong>
                          <br />
                          {item.description || 'No description available'}
                        </td> {/* Display both the name and the description */}
                        <td className="category">{item.category || 'Uncategorized'}</td>
                        <td className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(item.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
              ) : (
                <tr>
                  <td colSpan="6">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
