import React  from 'react';

const EditProductModal = ({ currentProduct, setCurrentProduct, confirmEditProduct, cancelEditProduct }) => {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prevProduct => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    confirmEditProduct(currentProduct);
  };

  return (
    <div className="modal-overlay">
      <div className="edit-modal-content">
        <button className="modal-close" onClick={cancelEditProduct}>×</button>
        <h3 className="delmodal-header">Edit Product</h3>
        <form className="edit-product-form">
          
          <div className="form-group">
            <label>
              Quantity:
              <input
                type="number"
                name="quantity"
                value={currentProduct.quantity}
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>
            <label>
              Unit:
              <select
                name="quantityUnit"
                value={currentProduct.quantityUnit}
                onChange={handleInputChange}
                className="modal-select"
                required
              >
                <option value="" disabled>Select Unit</option>
                <option value="pcs">pcs</option>
                <option value="box">box</option>
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Measurement Value:
              <input
                type="number"
                name="measurementValue"
                value={currentProduct.measurementValue || ''}
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>
            <label>
              Measurement Unit:
              <select
                name="measurementUnit"
                value={currentProduct.measurementUnit || ''}
                onChange={handleInputChange}
                className="modal-select"
                required
              >
                <option value="" disabled>Select Unit</option>
                <option value="watts">Watts</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="inch">Inches (inch)</option>
                <option value="mm">Millimeters (mm)</option>
                {/* Add more units as needed */}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Category:
              <select
                name="category"
                value={currentProduct.category}
                onChange={handleInputChange}
                className="modal-select"
              >
                <option value="" disabled>Select Category</option>
                <option value="Electrical">Electrical</option>
                <option value="Civil">Civil</option>
                <option value="Production">Production</option>
                <option value="HVAC">HVAC</option>
              </select>
            </label>
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={currentProduct.date}
                onChange={handleInputChange}
                className="modal-input"
              />
            </label>
          </div>

          <label>
            Product Name:
            <input
              type="text"
              name="name"
              value={currentProduct.name}
              onChange={handleInputChange}
              className="modal-input"
            />
          </label>

          <div className="modal-actions">
            <button className="add" type="button" onClick={handleSaveChanges}>Save Changes</button>
            <button className="cancel" type="button" onClick={cancelEditProduct}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
