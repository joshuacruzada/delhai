import React from 'react';

const AddNewProductModal = ({ newProduct, handleNewProductChange, confirmNewProduct, cancelNewProduct, errorMessage }) => {
  return (
    <div className="modal-overlay">
      <div className="add-modal-content">
        <button className="modal-close" onClick={cancelNewProduct}>×</button>
        <h3 className="delmodal-header">Add New Product</h3>
        <form className="new-product-form">
          
          <div className="form-group">
            <label>
              Quantity:
              <input
                type="number"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleNewProductChange}
                className="modal-input"
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </label>
            <label>
              Unit:
              <select
                name="quantityUnit"
                value={newProduct.quantityUnit}
                onChange={handleNewProductChange}
                className="modal-select"
                required
              >
                <option value="" disabled>Select Unit</option>
                <option value="pcs">pcs</option>
                <option value="box">box</option>
              </select>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </label>
            
          </div>

          <div className="form-group">
            <label>
              Measurement Value:
              <input
                type="number"
                name="measurementValue"
                value={newProduct.measurementValue}
                onChange={handleNewProductChange}
                className="modal-input"
              />
            </label>
            <label>
              Measurement Unit:
              <select
                name="measurementUnit"
                value={newProduct.measurementUnit}
                onChange={handleNewProductChange}
                className="modal-select"
                required
              >
                <option value="" disabled>Select Unit</option>
                <option value="watts">Watts (watts)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="inch">Inches (inch)</option>
                <option value="mm">Millimeters (mm)</option>
                <option value="L">Liters (L)</option>
                <option value="gal">Gallons (gal)</option>

                {/* Add more units as needed */}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Category:
              <select
                name="category"
                value={newProduct.category}
                onChange={handleNewProductChange}
                className="modal-select"
              >
                <option value="" disabled>Select Category</option>
                <option value="Electrical">Electrical</option>
                <option value="Civil">Civil</option>
                <option value="Production">Production</option>
                <option value="HVAC">HVAC</option>
              </select>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </label>
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={newProduct.date}
                onChange={handleNewProductChange}
                className="modal-input"
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </label>
          </div>

          <label>
            Product Name:
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleNewProductChange}
              className="modal-input"
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </label>

          <div className="modal-actions">
            <button className="add" type="button" onClick={confirmNewProduct}>Add Product</button>
            <button className="cancel" type="button" onClick={cancelNewProduct}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProductModal;
