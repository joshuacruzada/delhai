import React, { useState, useEffect, useCallback } from "react";
import "./Products.css";
import { database } from "../FirebaseConfig";
import { ref, onValue } from "firebase/database";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");

  const subCategoryOptions = {
    "Rapid Tests": ["COVID Tests", "Dengue Tests", "Urine Strips", "RPR Tests"],
    "X-Ray Products": ["Envelope", "Film (Fuji)", "Film (Pixel)", "Solutions"],
    "Laboratory Reagents": ["Crescent Blood Chemistry Reagents", "ERBA"],
    "Medical Supplies": ["Syringes", "Gloves", "Prepared Media Agar"],
  };

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, "stocks/");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name || "No Name",
          description: data[key].description || "No description available",
          category: data[key].category,
          subCategory: data[key].subCategory || "No Subcategory",
          imageUrl: data[key].imageUrl || "",
          pricePerBox: data[key].pricePerBox || 0,
          pricePerTest: data[key].pricePerTest || 0,
          quantity: data[key].quantity || 0,
          criticalStock: data[key].criticalStock || 0,
          expiryDate: data[key].expiryDate || "N/A",
        }));
        setProducts(items);
        setFilteredProducts(items); // Initialize filteredProducts
      }
    });
  }, []);

  // Function to filter products
  const filterProducts = useCallback(
    (query, category, subCategory) => {
      const filtered = products.filter((product) => {
        const productCategory = (product.category || "").trim().toLowerCase();
        const productSubCategory = (product.subCategory || "").trim().toLowerCase();

        const matchesSearch =
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase());

        const matchesCategory =
          category === "All" || productCategory === category.trim().toLowerCase();
        const matchesSubCategory =
          subCategory === "All" || productSubCategory === subCategory.trim().toLowerCase();

        return matchesSearch && matchesCategory && matchesSubCategory;
      });

      setFilteredProducts(filtered);
    },
    [products]
  );
  
  
  // Trigger filtering whenever dependencies change
  useEffect(() => {
    filterProducts(searchQuery, selectedCategory, selectedSubCategory);
  }, [filterProducts, searchQuery, selectedCategory, selectedSubCategory]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubCategory("All"); // Reset subcategory when category changes
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products List</h2>
        <div className="products-controls">
          <input
            type="text"
            placeholder="Search"
            className="products-search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
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
          {selectedCategory !== "All" && (
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
          )}
        </div>
      </div>

      <div className="products-container">
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th> </th>
                <th>Item Name</th>
                <th>Item Description</th>
                <th>Price Per Box</th>
                <th>Price Per Test</th>
                <th>Stocks</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="products-image">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.description}</td>
                      <td>{`₱${Number(product.pricePerBox || 0).toFixed(2)}`}</td>
                      <td>{`₱${Number(product.pricePerTest || 0).toFixed(2)}`}</td>
                      <td>{product.quantity}</td>
                      <td>{product.category}</td>
                      <td>{product.subCategory || "N/A"}</td>
                      <td>{product.expiryDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No products available.</td>
                  </tr>
                )}
              </tbody>

           </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
