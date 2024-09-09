import React, { useState } from 'react';
import './AddNewProduct.css';

const AddNewProductModal = ({
  newProduct,
  handleNewProductChange,
  handleImageUpload,
  confirmNewProduct,
  cancelNewProduct,
  errorMessage
}) => {
  // State to manage the auto-fill feature
  const [autoFill, setAutoFill] = useState(true);

  // Simulated auto-fill data
  const categoryDefaults = {
    "Rapid Test": { packagingType: "box", measurementUnit: "pcs" },
    "ELISA": { packagingType: "tray", measurementUnit: "ml" },
    "Blood Chemistry": { packagingType: "vial", measurementUnit: "ml" },
    "Medical Supplies": { packagingType: "pack", measurementUnit: "pcs" },
    "Laboratory Reagents": { packagingType: "bottle", measurementUnit: "ml" }
  };

  // Auto-fill function
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    handleNewProductChange(e); // Update category

    // Apply auto-fill only if it's enabled
    if (autoFill && categoryDefaults[selectedCategory]) {
      handleNewProductChange({
        target: { name: "packagingType", value: categoryDefaults[selectedCategory].packagingType }
      });
      handleNewProductChange({
        target: { name: "measurementUnit", value: categoryDefaults[selectedCategory].measurementUnit }
      });
    }
  };

  // Toggle auto-fill feature on or off
  const toggleAutoFill = () => {
    setAutoFill(!autoFill);
  };

  return (
    <div className="modal-overlay">
      <div className="add-modal-content">
        <button className="modal-close" onClick={cancelNewProduct}>×</button>
        <h3 className="delmodal-header">Add New Product</h3>

        {/* Auto-fill Toggle */}
        <div className="form-group switch-container">
          <label className="switch-label">Auto-Fill:</label>
          <label className="switch">
            <input type="checkbox" checked={autoFill} onChange={toggleAutoFill} />
            <span className="slider round"></span>
          </label>
          <span>{autoFill ? "On" : "Off"}</span>
        </div>

        <form className="new-product-form" onSubmit={e => { e.preventDefault(); confirmNewProduct(); }}>
          {/* Product Name Field */}
          <div className="form-group">
            <label>
              Product Name:
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                className="modal-input"
                required
              />
            </label>
          </div>

          {/* Category Field with Auto-Fill Logic */}
          <div className="form-group">
            <label>
              Category:
              <select
                name="category"
                value={newProduct.category}
                onChange={handleCategoryChange}
                className="modal-select"
                required
              >
                <option value="">Select Category</option>
                <option value="Rapid Test">Rapid Test</option>
                <option value="ELISA">ELISA</option>
                <option value="Blood Chemistry">Blood Chemistry</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Laboratory Reagents">Laboratory Reagents</option>
              </select>
            </label>
          </div>

          {/* Packaging Type and Measurement */}
          <div className="form-group">
            <label>
              Packaging Type:
              <select
                name="packagingType"
                value={newProduct.packagingType}
                onChange={handleNewProductChange}
                className="modal-select"
                required
              >
                <option value="">Select Packaging Type</option>
                <option value="box">Box</option>
                <option value="tray">Tray</option>
                <option value="pcs">Pieces</option>
                <option value="pack">Pack</option>
                <option value="vial">Vial</option>
                <option value="bottle">Bottle</option>
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Measurement Unit:
              <select
                name="measurementUnit"
                value={newProduct.measurementUnit}
                onChange={handleNewProductChange}
                className="modal-select"
                required
              >
                <option value="">Select Unit</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="l">Liters (L)</option>
                <option value="gal">Gallons (gal)</option>
              </select>
            </label>
            <label>
              Measurement Value:
              <input
                type="number"
                name="measurementValue"
                value={newProduct.measurementValue}
                onChange={handleNewProductChange}
                className="modal-input"
                required
              />
            </label>
            <label>
              Total Quantity:
              <input
                type="number"
                name="totalQuantity"
                value={newProduct.totalQuantity}
                onChange={handleNewProductChange}
                className="modal-input"
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Price Per Unit:
              <input
                type="text"
                name="pricePerUnit"
                value={newProduct.pricePerUnit}
                onChange={handleNewProductChange}
                className="modal-input"
              />
            </label>
            <label>
              Price Per Box:
              <input
                type="text"
                name="pricePerBox"
                value={newProduct.pricePerBox}
                onChange={handleNewProductChange}
                className="modal-input"
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Product Image:
              <input
                type="file"
                onChange={handleImageUpload}
                className="modal-input"
              />
            </label>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="modal-actions">
            <button className="add" type="submit">Add Product</button>
            <button className="cancel" type="button" onClick={cancelNewProduct}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProductModal;
