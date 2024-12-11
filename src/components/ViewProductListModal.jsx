import React from "react";
import "./ViewProductListModal.css";

const ViewProductListModal = ({ products, onAddProduct, onClose }) => {
  return (
    <div className="product-list-modal">
      <div className="modal-content">
        <h3>Product List</h3>
        <button onClick={onClose}>Close</button>
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <p>{product.name}</p>
              <button onClick={() => onAddProduct(product)}>Add</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewProductListModal;
