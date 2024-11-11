import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
import { database, storage } from '../FirebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import './AddNewProduct.css';

const AddNewProduct = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    packaging: '',
    quantity: '',
    expiryDate: '',
    date: new Date().toISOString().split('T')[0], // Set current date as default
    imageUrl: '', 
    pricePerTest: '',  
    pricePerBox: '',   
    pricePerPiece: '', 
    piecesPerBox: '',  // Added field for Pieces per Box
    criticalStock: '', // New field for Critical Stock
    description: '',   
  });

  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      const localImageUrl = URL.createObjectURL(file);
      setNewProduct({
        ...newProduct,
        imageUrl: localImageUrl,
      });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.pricePerTest || !newProduct.pricePerBox || !newProduct.pricePerPiece || !newProduct.piecesPerBox || !newProduct.criticalStock || !newProduct.expiryDate) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    setIsLoading(true);

    let downloadUrl = '';
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

    const productWithImage = {
      ...newProduct,
      imageUrl: downloadUrl || newProduct.imageUrl,
    };

    const productRef = push(ref(database, 'stocks/'));

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
    navigate('/inventory');
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <i className="bi bi-arrow-left back-arrow" onClick={handleBack}></i>
        <h2 className="add-product-header">Add New Product</h2>

        <div className="add-product-content">
          <div className="image-section">
            <div className="image-preview">
              {newProduct.imageUrl ? (
                <img src={newProduct.imageUrl} alt="Product" className="product-image" />
              ) : (
                <p className="photo-placeholder">Photo</p>
              )}
            </div>
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
                {/* Updated Categories to match the ones from the Dashboard */}
                <option value="Rapid Tests & Diagnostic Products">Rapid Tests & Diagnostic Products</option>
                <option value="X-Ray & Imaging Products">X-Ray & Imaging Products</option>
                <option value="Laboratory Reagents & Supplies">Laboratory Reagents & Supplies</option>
                <option value="Medical Supplies">Medical Supplies</option>
              </select>
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
              <label>Price Per Test:</label>
              <input
                type="number"
                name="pricePerTest"
                value={newProduct.pricePerTest}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Price Per Box:</label>
              <input
                type="number"
                name="pricePerBox"
                value={newProduct.pricePerBox}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Price Per Piece:</label>
              <input
                type="number"
                name="pricePerPiece"
                value={newProduct.pricePerPiece}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Pieces per Box:</label> {/* New field for Pieces per Box */}
              <input
                type="number"
                name="piecesPerBox"
                value={newProduct.piecesPerBox}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Critical Stock (Low Stock Trigger):</label> {/* Changed label for clarity */}
              <input
                type="number"
                name="criticalStock"
                value={newProduct.criticalStock}
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
            <div className="form-group">
              <label>Product Description:</label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                className="input-underline description-field"
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
                readOnly
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
