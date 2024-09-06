import React, { useState, useEffect, useRef } from 'react';
import './Stocks.css';
import { fetchStocks, addNewProduct, updateProduct, deleteProduct, duplicateProduct } from '../services/stockServices';
import AddNewProductModal from './AddNewProductModal';
import EditProductModal from './EditProductModal';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [password, setPassword] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const passwordInputRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    measurementValue: '',
    measurementUnit: '',
    quantity: '',
    quantityUnit: '', 
    category: '',
    date: '',
  });

  useEffect(() => {
    fetchStocks(setStocks);
  }, []);

  useEffect(() => {
    if (showModal && passwordInputRef.current) {
      passwordInputRef.current.focus(); // Focus the password input when modal is shown
    }
  }, [showModal]);

  const handleEdit = (id) => {
    const productToEdit = stocks.find(stock => stock.id === id);
    setCurrentProduct({
      ...productToEdit,
      measurementValue: productToEdit.measurementValue || '',
      measurementUnit: productToEdit.measurementUnit || '',
    });
    setShowEditModal(true);
  };
  

  const handleDelete = (id) => {
    setDeleteItemId(id);
    setShowModal(true);
  };

  const handleDuplicate = (stock) => {
    duplicateProduct(stock, () => fetchStocks(setStocks));
  };

  const confirmEditProduct = (updatedProduct) => {
    updateProduct(updatedProduct, () => {
      setShowEditModal(false);
      fetchStocks(setStocks);
    });
  };

  const confirmDelete = () => {
    if (password === '123') {
      deleteProduct(deleteItemId, () => {
        setShowModal(false);
        setPassword('');
        fetchStocks(setStocks);
      });
    } else {
      alert('Password incorrect. Item not deleted.');
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setPassword('');
  };

  const handleAddNewProduct = () => {
    setShowNewProductModal(true);
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prevProduct => ({ ...prevProduct, [name]: value }));
  };

  const [errorMessage, setErrorMessage] = useState('');
  const confirmNewProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.quantityUnit || !newProduct.date) {
      setErrorMessage('This fields are required!');
      return;
    }

    const newProductData = {
      name: newProduct.name,
      measurementValue: newProduct.measurementValue,
      measurementUnit: newProduct.measurementUnit,
      category: newProduct.category,
      quantity: newProduct.quantity,
      quantityUnit: newProduct.quantityUnit || '',
      date: newProduct.date,
    };

    addNewProduct(newProductData, () => {
      setShowNewProductModal(false);
      fetchStocks(setStocks);
      setNewProduct({
        name: '',
        measurementValue: '',
        measurementUnit: '',
        quantity: '',
        quantityUnit: '',
        category: '',
        date: '',
      });
      setErrorMessage(''); 
    });
  };

  const cancelNewProduct = () => {
    setShowNewProductModal(false);
    setNewProduct({
      name: '',
      measurementValue: '',
      measurementUnit: '',
      quantity: '',
      quantityUnit: '',
      category: '',
      date: '',
    });
    setErrorMessage('');
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="stocks-page">
      <div className="stocks-header">
        <h2>Stocks</h2>
        <div className="stocks-actions">
          <input type="text" placeholder="Search" className="search-input" />
          <select className="category-filter" value={selectedCategory} onChange={handleCategoryChange}>
            <option value="All">Category</option>
            <option value="Electrical">Electrical</option>
            <option value="Civil">Civil</option>
            <option value="Production">Production</option>
            <option value="HVAC">HVAC</option>
          </select>
          <button className="new-product-btn" onClick={handleAddNewProduct}>+ New Product</button>
        </div>
      </div>

      <div className="stocks-container">
        <div className="stocks-table-container">
          <table className="stocks-table">
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Item Description</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length > 0 ? (
                stocks
                  .filter(stock => selectedCategory === '' || stock.category === selectedCategory) 
                  .map(stock => (
                    <tr key={stock.id}>
                      <td className="stocks">{`${stock.quantity} ${stock.quantityUnit || ''}`}</td> {/* Display quantity with unit */}
                      <td className="itemname">
                        {`${stock.measurementValue ? `${stock.measurementValue} ${stock.measurementUnit} ` : ''}${stock.name}`}
                      </td> {/* Display measurement with name */}
                      <td className="category">{stock.category}</td>

                      <td className="actions">
                        <button className="duplicate-btn" onClick={() => handleDuplicate(stock)}>
                          <i className="bi bi-files"></i> 
                        </button>
                        <button className="edit-btn" onClick={() => handleEdit(stock.id)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(stock.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td> 

                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="4">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={cancelDelete}>×</button>
            <h3 className="delmodal-header">Confirm Deletion</h3>
            <p>Enter your password to confirm deletion:</p>
            <input
              type="password"
              value={password}
              ref={passwordInputRef} // Attach the ref to the password input field
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  confirmDelete(); 
                }
              }}
              className="modal-password-input"
              placeholder="Password"
            />
          </div>
        </div>
      )}

      {showNewProductModal && (
        <AddNewProductModal
          newProduct={newProduct}
          handleNewProductChange={handleNewProductChange}
          confirmNewProduct={confirmNewProduct}
          cancelNewProduct={cancelNewProduct}
          errorMessage={errorMessage}
        />
      )}

      {showEditModal && (
        <EditProductModal
          currentProduct={currentProduct}
          setCurrentProduct={setCurrentProduct}
          confirmEditProduct={confirmEditProduct}
          cancelEditProduct={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Stocks;
