import React from "react";
import "./ProductDetailsModal.css";

const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="product-details-modal-overlay" onClick={onClose}>
      <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Left Section: Image and Description */}
        <div className="modal-left">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="modal-product-image"
          />
          <p className="modal-description">{product.description}</p>
        </div>

        {/* Right Section: Product Details */}
        <div className="modal-right">
          <h3 className="modal-product-name">{product.name}</h3>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Subcategory:</strong> {product.subCategory}</p>
          <p><strong>Packaging:</strong> {product.packaging || "N/A"}</p>
          <p><strong>Pieces per Box:</strong> {product.piecesPerBox || "N/A"}</p>
          <p><strong>Price per Box:</strong> ₱{product.pricePerBox}</p>
          <p><strong>Price per Test:</strong> ₱{product.pricePerTest}</p>
          <p><strong>Price per Piece:</strong> ₱{product.pricePerPiece || "N/A"}</p>
          <p><strong>Critical Stock:</strong> {product.criticalStock}</p>
          <p><strong>Stocks:</strong> {product.quantity}</p>
          <p><strong>Expiry Date:</strong> {product.expiryDate}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
