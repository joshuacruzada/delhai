import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './Inventory.css';
import { fetchStocks, deleteProduct, duplicateProduct } from '../services/stockServices'; // Removed unused imports

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();  // Use navigate for routing

  // Fetch the stocks on mount
  useEffect(() => {
    fetchStocks(setInventoryItems);  // Fetch inventory items
  }, []);

  // Handle editing product by redirecting to the edit page
  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);  // Redirect to the edit product page with product ID
  };

  // Handle adding new product by redirecting to the add new product page
  const handleAddNewProduct = () => {
    navigate('/add-product');  // Redirect to the add new product page
  };

  // Handle duplicating product
  const handleDuplicate = (item) => {
    duplicateProduct(item, () => fetchStocks(setInventoryItems));  // Refresh after duplication
  };

  // Handle deleting product
  const handleDelete = (id) => {
    deleteProduct(id, () => {
      fetchStocks(setInventoryItems);  // Refresh after deletion
    });
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <div className="inventory-actions">
          <input type="text" placeholder="Search" className="search-input" />
          <select className="category-filter" value={selectedCategory} onChange={handleCategoryChange}>
            <option value="All">All Categories</option>
            <option value="Surgical">Surgical</option>
            <option value="Pharmaceutical">Pharmaceutical</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Medical Supplies">Medical Supplies</option>
          </select>
          <button className="new-product-btn" onClick={handleAddNewProduct}>+ Add New Product</button>
        </div>
      </div>

      <div className="inventory-container">
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Packaging</th>
                <th>Item Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length > 0 ? (
                inventoryItems
                  .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                  .map(item => (
                    <tr key={item.id}>
                      <td className="stock">{`${item.quantity} ${item.quantityUnit || ''}`}</td>
                      <td className="packaging">{item.packaging}</td> {/* Assuming packaging is included in the data */}
                      <td className="itemname">
                        {`${item.measurementValue ? `${item.measurementValue} ${item.measurementUnit} ` : ''}${item.name}`}
                      </td>
                      <td className="price">{`$${item.price}`}</td> {/* Assuming price is included in the data */}
                      <td className="category">{item.category}</td>
                      <td className="actions">
                        <button className="duplicate-btn" onClick={() => handleDuplicate(item)}>
                          <i className="bi bi-files"></i>
                        </button>
                        <button className="edit-btn" onClick={() => handleEdit(item.id)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
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
