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
    subCategory: '', // Added Subcategory
    packaging: '',
    quantity: '',
    expiryDate: '',
    date: new Date().toISOString().split('T')[0], // Set current date as default
    imageUrl: '',
    pricePerTest: '',
    pricePerBox: '',
    pricePerPiece: '',
    piecesPerBox: '',
    criticalStock: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Subcategories based on selected category
  const subCategoryOptions = {
    'Rapid Tests ': [
      'COVID Tests',
      'Dengue Tests',
      'HIV Tests',
      'Urine Strips',
      'RPR Tests',
      'HCV Tests', // New
      'Syphilis Tests', // New
      'Malaria Tests', // New
      'Troponin Tests', // New
      'HBsAg Tests', // New
      'HAV Tests', // New
      'Fecal Occult Blood', // New
    ],
    'X-Ray Products': [
      'Envelope',
      'Film (Fuji)',
      'Film (Pixel)',
      'Solutions',
      'Thermal Paper',
    ],
    'Laboratory Reagents ': [
      'Crescent Blood Chemistry Reagents',
      'ERBA',
    ],
    'Medical Supplies': [
      'Syringes',
      'Gloves',
      'Prepared Media Agar',
      'Cotton Products',
      'Specimen Containers',
      'Alcohol Products', // New
      'Pipette Tips', // New
      'Blood Collectors', // New
      'Glass Slides', // New
      'Micropore', // New
      'Typing Sera', // New
    ],
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });

    // Reset subCategory when category changes
    if (name === 'category') {
      setNewProduct({
        ...newProduct,
        category: value,
        subCategory: '', // Reset subcategory
      });
    }
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
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.subCategory ||
      !newProduct.quantity ||
      !newProduct.pricePerTest ||
      !newProduct.pricePerBox ||
      !newProduct.pricePerPiece ||
      !newProduct.piecesPerBox ||
      !newProduct.criticalStock ||
      !newProduct.expiryDate
    ) {
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
                {Object.keys(subCategoryOptions).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {newProduct.category && (
              <div className="form-group">
                <label>Subcategory:</label>
                <select
                  name="subCategory"
                  value={newProduct.subCategory}
                  onChange={handleInputChange}
                  className="input-underline"
                >
                  <option value="">Select Subcategory</option>
                  {subCategoryOptions[newProduct.category].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              <label>Pieces per Box:</label>
              <input
                type="number"
                name="piecesPerBox"
                value={newProduct.piecesPerBox}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
            <div className="form-group">
              <label>Critical Stock (Low Stock Trigger):</label>
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

