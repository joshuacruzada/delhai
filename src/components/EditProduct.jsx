import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../services/stockServices'; // Import service functions
import { storage } from '../FirebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import './AddNewProduct.css'; // Import CSS for consistent styling

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    category: '',
    subCategory: '', // Added Subcategory
    packaging: '',
    quantity: '',
    expiryDate: '',
    date: '',
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
  
  // Fetch product details when the component mounts
  useEffect(() => {
    fetchProductById(id, (data) => {
      if (data) {
        setProduct(data);
      } else {
        setErrorMessage('Product not found');
      }
    });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle category change and reset subcategory
    if (name === 'category') {
      setProduct((prevProduct) => ({
        ...prevProduct,
        category: value,
        subCategory: '', // Reset subcategory when category changes
      }));
    } else {
      setProduct((prevProduct) => ({
        ...prevProduct,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create a local URL for preview before upload
      const localImageUrl = URL.createObjectURL(file);
      setProduct((prevProduct) => ({
        ...prevProduct,
        imageUrl: localImageUrl,
      }));
    }
  };

  const handleUpdateProduct = async () => {
    if (
      !product.name ||
      !product.category ||
      !product.subCategory || // Ensure subcategory is selected
      !product.pricePerTest ||
      !product.pricePerBox ||
      !product.pricePerPiece ||
      !product.piecesPerBox ||
      !product.criticalStock ||
      !product.expiryDate
    ) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    setIsLoading(true);

    let downloadUrl = product.imageUrl; // Retain current image if not updated

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

    const updatedProduct = { ...product, imageUrl: downloadUrl, id }; // Include `id`

    updateProduct(id, updatedProduct)
      .then(() => {
        setIsLoading(false);
        navigate('/inventory'); // Redirect to inventory after update
      })
      .catch((error) => {
        console.error('Error updating product:', error);
        setErrorMessage('Failed to update product.');
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
        <h2 className="add-product-header">Edit Product</h2>

        <div className="add-product-content">
          <div className="image-section">
            <div className="image-preview">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="Product" className="product-image" />
              ) : (
                <p className="photo-placeholder">No image available</p>
              )}
            </div>
            <div className="file-input-wrapper">
              <input type="file" id="fileInput" onChange={handleImageChange} className="file-input" />
              <label htmlFor="fileInput" className="custom-file-label">
                Choose File
              </label>
              <span className="file-name">{imageFile ? imageFile.name : 'No file chosen'}</span>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Item Name:</label>
              <input type="text" name="name" value={product.name} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select name="category" value={product.category} onChange={handleInputChange} className="input-underline">
                <option value="">Select Category</option>
                {Object.keys(subCategoryOptions).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {product.category && (
              <div className="form-group">
                <label>Subcategory:</label>
                <select
                  name="subCategory"
                  value={product.subCategory}
                  onChange={handleInputChange}
                  className="input-underline"
                >
                  <option value="">Select Subcategory</option>
                  {subCategoryOptions[product.category].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Packaging:</label>
              <input type="text" name="packaging" value={product.packaging} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Price Per Test:</label>
              <input type="number" name="pricePerTest" value={product.pricePerTest} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Price Per Box:</label>
              <input type="number" name="pricePerBox" value={product.pricePerBox} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Price Per Piece:</label>
              <input type="number" name="pricePerPiece" value={product.pricePerPiece} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Pieces per Box:</label>
              <input type="number" name="piecesPerBox" value={product.piecesPerBox} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Critical Stock (Low Stock Trigger):</label>
              <input type="number" name="criticalStock" value={product.criticalStock} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Expiry Date:</label>
              <input type="date" name="expiryDate" value={product.expiryDate} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Stocks:</label>
              <input type="number" name="quantity" value={product.quantity} onChange={handleInputChange} className="input-underline" />
            </div>
            <div className="form-group">
              <label>Product Description:</label>
              <textarea name="description" value={product.description} onChange={handleInputChange} classname="description" className="input-underline description-field"/>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={product.date}
              onChange={handleInputChange}
              className="input-underline"
              readOnly
            />
          </div>
        </div>
      </div>

      <button onClick={handleUpdateProduct} className="add-product-btn">
        {isLoading ? "Updating..." : "Update Product"}
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  </div>
);
};

export default EditProduct;
