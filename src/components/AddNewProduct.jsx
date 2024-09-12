import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set } from 'firebase/database'; // Import Firebase database functions
import { database } from '../FirebaseConfig'; // Import your initialized Firebase database
import './AddNewProduct.css';

const AddNewProduct = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    packaging: '',
    measurementUnit: '',
    measurementValue: '',
    quantity: '',
    expiryDate: '',
    date: '',
    imageUrl: '', // Image URL after upload (optional)
  });

  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Use navigate for routing

  // Handle input change for form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create a URL for the selected image file to display as a preview
      const imageUrl = URL.createObjectURL(file);
      setNewProduct((prevProduct) => ({
        ...prevProduct,
        imageUrl: imageUrl, // Set the image URL to display the preview
      }));
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.quantity) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    // Firebase database reference
    const productRef = push(ref(database, 'stocks/')); // "stocks/" is the node where we store products

    // Set the new product in Firebase
    set(productRef, newProduct)
      .then(() => {
        console.log('Product added successfully');
        navigate('/inventory'); // Navigate back to inventory after successful product addition
      })
      .catch((error) => {
        console.error('Error adding product:', error);
        setErrorMessage('Failed to add product.');
      });
  };

  const handleBack = () => {
    navigate('/inventory'); // Navigate to inventory or previous page
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <i className="bi bi-arrow-left back-arrow" onClick={handleBack}></i> {/* Back arrow */}
        <h2 className="add-product-header">Add New Product</h2>

        <div className="add-product-content">
          {/* Image Section */}
          <div className="image-section">
            <div className="image-preview">
              {newProduct.imageUrl ? (
                <img src={newProduct.imageUrl} alt="Product" className="product-image" />
              ) : (
                <p className="photo-placeholder">Photo</p>
              )}
            </div>
            
            {/* Custom File Input */}
            <div className="file-input-wrapper">
              <input
                type="file"
                id="fileInput"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="fileInput" className="custom-file-label">
                Choose File
              </label>
              <span className="file-name">
                {imageFile ? imageFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="form-group">
              <label>Item Name:</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className="input-underline"
              >
                <option value="">Select Category</option>
                <option value="Surgical">Surgical</option>
                <option value="Pharmaceutical">Pharmaceutical</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="Medical Supplies">Medical Supplies</option>
              </select>
            </div>
            <div className="form-group">
              <label>Measurement Value:</label>
              <input
                type="text"
                name="measurementValue"
                value={newProduct.measurementValue}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Measurement Unit:</label>
              <input
                type="text"
                name="measurementUnit"
                value={newProduct.measurementUnit}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Packaging:</label>
              <input
                type="text"
                name="packaging"
                value={newProduct.packaging}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={newProduct.date}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Expiry Date:</label>
              <input
                type="date"
                name="expiryDate"
                value={newProduct.expiryDate}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Stocks:</label>
              <input
                type="text"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
          </div>
        </div>

        <button onClick={handleAddProduct} className="add-product-btn">Add Product</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default AddNewProduct;
