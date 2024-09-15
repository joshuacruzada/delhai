import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../services/stockServices';
import './AddNewProduct.css';  // Assuming the same style as AddNewProduct

const EditProduct = () => {
  const { id } = useParams();  // Get the product ID from the URL
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    measurementValue: '',
    measurementUnit: '',
    quantity: '',
    quantityUnit: '',
    category: '',
    date: '',
    packaging: '',
    pricePerTest: '',
    pricePerBox: '',
    expirationDate: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // To show a loading state during update

  // Fetch the product details when the component mounts
  useEffect(() => {
    fetchProductById(id, setProduct);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleUpdateProduct = () => {
    if (!product.name || !product.category || !product.quantity || !product.quantityUnit || !product.date) {
      setErrorMessage('Please fill in all required fields!');
      return;
    }

    setIsLoading(true);

    updateProduct(id, product, () => {
      setIsLoading(false);
      navigate('/inventory');  // Redirect to inventory after successful update
    });
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <i className="bi bi-arrow-left back-arrow" onClick={() => navigate('/inventory')}></i> {/* Back arrow */}
        <h2 className="add-product-header">Edit Product</h2>

        <div className="add-product-content">
          {/* Form Section */}
          <div className="form-section">
            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select
                name="category"
                value={product.category}
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
              <label>Packaging:</label>
              <input
                type="text"
                name="packaging"
                value={product.packaging}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Price Per Test:</label>
              <input
                type="number"
                name="pricePerTest"
                value={product.pricePerTest}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Price Per Box:</label>
              <input
                type="number"
                name="pricePerBox"
                value={product.pricePerBox}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Measurement Unit:</label>
              <input
                type="text"
                name="measurementUnit"
                value={product.measurementUnit}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Measurement Value:</label>
              <input
                type="text"
                name="measurementValue"
                value={product.measurementValue}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={product.quantity}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Quantity Unit:</label>
              <input
                type="text"
                name="quantityUnit"
                value={product.quantityUnit}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>

            <div className="form-group">
              <label>Expiration Date:</label>
              <input
                type="date"
                name="expirationDate"
                value={product.expirationDate}
                onChange={handleInputChange}
                className="input-underline"
              />
            </div>
          </div>
        </div>

        <button className="add-product-btn" onClick={handleUpdateProduct}>
          {isLoading ? 'Updating...' : 'Update Product'}
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default EditProduct;
