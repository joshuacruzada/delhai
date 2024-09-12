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
    vendor: '',
    expirationDate: '',
    batchNumber: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('These fields are required!');
      return;
    }

    updateProduct(id, product, () => {
      navigate('/inventory');  // Redirect to inventory after successful update
    });
  };

  return (
    <div className="edit-product-page">
      <h2>Edit Medical Product</h2>
      <div className="product-form">
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Category:</label>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
          >
            <option value="">Select Category</option>
            <option value="Surgical">Surgical</option>
            <option value="Pharmaceutical">Pharmaceutical</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Medical Supplies">Medical Supplies</option>
          </select>
        </div>

        <div>
          <label>Packaging:</label>
          <input
            type="text"
            name="packaging"
            value={product.packaging}
            onChange={handleInputChange}
            placeholder="e.g., Box, 50's, 100ml"
          />
        </div>

        <div>
          <label>Price Per Test:</label>
          <input
            type="number"
            name="pricePerTest"
            value={product.pricePerTest}
            onChange={handleInputChange}
            placeholder="Enter price per test"
          />
        </div>

        <div>
          <label>Price Per Box:</label>
          <input
            type="number"
            name="pricePerBox"
            value={product.pricePerBox}
            onChange={handleInputChange}
            placeholder="Enter price per box"
          />
        </div>

        <div>
          <label>Measurement Unit:</label>
          <input
            type="text"
            name="measurementUnit"
            value={product.measurementUnit}
            onChange={handleInputChange}
            placeholder="e.g., mg, liters"
          />
        </div>

        <div>
          <label>Measurement Value:</label>
          <input
            type="text"
            name="measurementValue"
            value={product.measurementValue}
            onChange={handleInputChange}
            placeholder="Enter measurement value"
          />
        </div>

        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
          />
        </div>

        <div>
          <label>Quantity Unit:</label>
          <input
            type="text"
            name="quantityUnit"
            value={product.quantityUnit}
            onChange={handleInputChange}
            placeholder="e.g., boxes, pcs"
          />
        </div>

        <div>
          <label>Vendor:</label>
          <input
            type="text"
            name="vendor"
            value={product.vendor}
            onChange={handleInputChange}
            placeholder="Enter vendor name"
          />
        </div>

        <div>
          <label>Expiration Date:</label>
          <input
            type="date"
            name="expirationDate"
            value={product.expirationDate}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Batch Number:</label>
          <input
            type="text"
            name="batchNumber"
            value={product.batchNumber}
            onChange={handleInputChange}
            placeholder="Enter batch number"
          />
        </div>

        <button className="update-btn" onClick={handleUpdateProduct}>Update Product</button>
        <button className="cancel-btn" onClick={() => navigate('/inventory')}>Cancel</button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default EditProduct;
