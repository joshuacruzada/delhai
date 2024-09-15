import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set } from 'firebase/database'; // Import Firebase database functions
import { database, storage } from '../FirebaseConfig'; // Import Firebase storage
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage functions
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
    imageUrl: '', // Image URL after upload
    pricePerTest: '', // New field for price per test
    pricePerBox: '',  // New field for price per box
  });

  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for feedback
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

      // Create a local URL for the image preview before upload
      const localImageUrl = URL.createObjectURL(file);
      setNewProduct({
        ...newProduct,
        imageUrl: localImageUrl, // Set the local image URL for preview
      });
    }
  };

  // Handle adding product
  const handleAddProduct = async () => {
    // Validate form
    if (!newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.pricePerTest || !newProduct.pricePerBox || !newProduct.expiryDate) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    setIsLoading(true);

    let downloadUrl = '';
    // Upload image to Firebase Storage if an image is selected
    if (imageFile) {
      const imageRef = storageRef(storage, `products/${imageFile.name}`);
      try {
        await uploadBytes(imageRef, imageFile);
        downloadUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrorMessage('Failed to upload image.');
        setIsLoading(false);
        return;
      }
    }

    // Update the product object with the image URL after the image upload
    const productWithImage = {
      ...newProduct,
      imageUrl: downloadUrl || newProduct.imageUrl, // Use Firebase Storage URL if available
    };

    // Firebase database reference
    const productRef = push(ref(database, 'stocks/'));

    // Add product to database with image URL
    set(productRef, productWithImage)
      .then(() => {
        console.log('Product added successfully');
        navigate('/inventory');
      })
      .catch((error) => {
        console.error('Error adding product:', error);
        setErrorMessage('Failed to add product.');
      })
      .finally(() => {
        setIsLoading(false);
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
              <label>Price Per Test:</label> {/* New field */}
              <input
                type="number"
                name="pricePerTest"
                value={newProduct.pricePerTest}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Price Per Box:</label> {/* New field */}
              <input
                type="number"
                name="pricePerBox"
                value={newProduct.pricePerBox}
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

        <button onClick={handleAddProduct} className="add-product-btn">
          {isLoading ? 'Adding Product...' : 'Add Product'}
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default AddNewProduct;
