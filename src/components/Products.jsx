import React, { useState, useEffect } from "react";
import "./Products.css";
import { database } from "../FirebaseConfig";
import { ref, onValue } from "firebase/database";
import ProductDetailsModal from "./ProductDetailsModal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const subCategoryOptions = {
    "Rapid Tests": [
      'COVID Tests',
      'Dengue Tests',
      'HIV Tests',
      'Urine Strips',
      'RPR Tests',
      'HCV Tests', 
      'Syphilis Tests', 
      'Malaria Tests', 
      'Troponin Tests', 
      'HBsAg Tests', 
      'HAV Tests', 
      'Fecal Occult Blood',],

    "X-Ray Products": [
      'Envelope',
      'Film (Fuji)',
      'Film (Pixel)',
      'Solutions',
      'Thermal Paper',],

    "Laboratory Reagents": ["Crescent Blood Chemistry Reagents", "ERBA"],
    "Medical Supplies": [
      'Syringes',
      'Gloves',
      'Prepared Media Agar',
      'Cotton Products',
      'Specimen Containers',
      'Alcohol Products', 
      'Pipette Tips', 
      'Blood Collectors', 
      'Glass Slides', 
      'Micropore',
      'Typing Sera',],
  };

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, "stocks/");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name || "No Name",
          description: data[key].description || "No description available",
          category: data[key].category || "N/A",
          subCategory: data[key].subCategory || "N/A",
          imageUrl: data[key].imageUrl || "/placeholder.png",
          pricePerBox: data[key].pricePerBox || 0,
          pricePerTest: data[key].pricePerTest || 0,
          pricePerPiece: data[key].pricePerPiece || "N/A",
          packaging: data[key].packaging || "N/A",
          piecesPerBox: data[key].piecesPerBox || "N/A",
          stock: data[key].stock || 0,
          criticalStock: data[key].criticalStock || 0,
          expiryDate: data[key].expiryDate || "N/A",
        }));
        setProducts(items);
        setFilteredProducts(items);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Filter products
  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category?.trim().toLowerCase() === selectedCategory.toLowerCase();

      const matchesSubCategory =
        selectedSubCategory === "All" ||
        product.subCategory?.trim().toLowerCase() === selectedSubCategory.toLowerCase();

      return matchesSearch && matchesCategory && matchesSubCategory;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedSubCategory, products]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("All");
  };
  const handleSubCategoryChange = (e) => setSelectedSubCategory(e.target.value);
  const openProductDetails = (product) => setSelectedProduct(product);
  const closeProductDetails = () => setSelectedProduct(null);

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <h2>Products List</h2>
        <div className="products-controls">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search"
            className="products-search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          
          {/* Category Dropdown */}
          <select
            className="category-products"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All">All Categories</option>
            {Object.keys(subCategoryOptions).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Subcategory Dropdown (Always Visible) */}
          <select
            className="subcategory-products"
            value={selectedSubCategory}
            onChange={handleSubCategoryChange}
          >
            <option value="All">All Subcategories</option>
            {subCategoryOptions[selectedCategory]?.map((subCategory) => (
              <option key={subCategory} value={subCategory}>
                {subCategory}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* Product Grid */}
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`product-card ${
                product.stock < product.criticalStock ? "low-stock-order" : ""
              }`}
              onClick={() => openProductDetails(product)}
            >
              <img src={product.imageUrl} alt={product.name} className="productlist-image" />
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₱{product.pricePerBox}</p>
                <p className="product-quantity">Stocks: {product.stock}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>

        {/* Product Details Modal */}
      <ProductDetailsModal product={selectedProduct} onClose={closeProductDetails} />
    </div>
  );
};

export default Products;
