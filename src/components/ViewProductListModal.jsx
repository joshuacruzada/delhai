import React, { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../FirebaseConfig";
import "./ViewProductListModal.css";

const ViewProductListModal = ({ onAddProduct, onClose }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const modalRef = useRef(null);

  const categories = [
    "ALL",
    "Rapid Tests",
    "X-Ray Products",
    "Laboratory Reagents",
    "Medical Supplies",
  ];

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, "stocks/");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productList);
        setFilteredProducts(productList); // Initialize filtered products
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Filter products based on search term and selected category
  useEffect(() => {
    const filterProducts = () => {
      let filtered = [...products];

      // Filter by category if it's not "ALL"
      if (selectedCategory !== "ALL") {
        filtered = filtered.filter(
          (product) =>
            product.category &&
            product.category.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase()
        );
      }

      // Further filter by search term
      if (searchTerm) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle category button click
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose(); // Close modal on outside click
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, [onClose]);

  return (
    <div className="modal-overlay">
  <div className="product-list-modal" ref={modalRef}>
    {/* Modal Header */}
    <div className="modal-header d-flex justify-content-between align-items-center">
      <h3 className="modal-title">Product List</h3>
      <button className="close-modal-btn" onClick={onClose}>
        &times;
      </button>
    </div>

    {/* Search Bar */}
    <div className="search-container">
      <input
        type="text"
        placeholder="Search product..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
    </div>

    {/* Category List */}
    <div className="category-list">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => handleCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>

    {/* Product List */}
        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`product-card ${
                  product.stock < product.criticalStock ? "low-stock-order" : ""
                }`}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="productlistmodal-image"
                />
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">₱{product.pricePerBox}</p>
                  <p className="product-packaging">
                    Packaging: {product.packaging}
                  </p>
                  <p className="product-quantity">Stocks: {product.stock}</p>
                </div>
                <button
                  className="btn btn-success addto-order-btn"
                  onClick={() => onAddProduct(product)}
                >
                  Add to Order
                </button>
              </div>
            ))
          ) : (
            <p className="no-products-message">No products found.</p>
          )}
        </div>
      </div>
    </div>

  );
};

export default ViewProductListModal;
