import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set, get } from "firebase/database";
import { auth, database } from "../../FirebaseConfig";
import "./Shop.css";
import UpperBar from "./UpperBar";
import ContactInfo from "./ContactInfo";
import { IconShoppingCartPlus, IconBuildingStore } from "@tabler/icons-react";

const categories = {
  "Rapid Tests": ["COVID Tests", "Dengue Tests", "HIV Tests", "Urine Strips", "RPR Tests", "HCV Tests", "Syphilis Tests", "Malaria Tests", "Troponin Tests", "HBsAg Tests", "HAV Tests", "Fecal Occult Blood"],
  "X-Ray Products": ["Envelope", "Film (Fuji)", "Film (Pixel)", "Solutions", "Thermal Paper"],
  "Laboratory Reagents": ["Crescent Blood Chemistry Reagents", "ERBA"],
  "Medical Supplies": ["Syringes", "Gloves", "Prepared Media Agar", "Cotton Products", "Specimen Containers", "Alcohol Products", "Pipette Tips", "Blood Collectors", "Glass Slides", "Micropore", "Typing Sera"]
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const productsRef = ref(database, "stocks");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const fetchedProducts = snapshot.val();
      if (fetchedProducts) {
        const productList = Object.keys(fetchedProducts).map((id) => ({ id, ...fetchedProducts[id] }));
        setProducts(productList);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleSubCategory = (subCategory) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategory) ? prev.filter((sc) => sc !== subCategory) : [...prev, subCategory]
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesSubCategory = selectedSubCategories.length === 0 || selectedSubCategories.includes(product.subCategory);
    return matchesCategory && matchesSubCategory;
  });

  const handleAddToCart = async (product) => {
    if (!auth.currentUser) return alert("Please login to add items to cart.");

    const cartRef = ref(database, `users/${auth.currentUser.uid}/cart/${product.id}`);
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      const existing = snapshot.val();
      await set(cartRef, { ...existing, quantity: existing.quantity + 1 });
    } else {
      await set(cartRef, {
        name: product.name,
        pricePerBox: product.pricePerBox,
        imageUrl: product.imageUrl || "/placeholder.png",
        quantity: 1
      });
    }
  };

  return (
    <div className="shop-page">
      <UpperBar />
      <div className="shop-container">
        <div className="shop-sidebar">
          <h4>By Category</h4>
          <ul>
            {Object.keys(categories).map((category) => (
              <li key={category}>
                <label>
                  <input
                    type="checkbox"
                    value={category}
                    onChange={() => toggleCategory(category)}
                    checked={selectedCategories.includes(category)}
                  />
                  {category}
                </label>
                {selectedCategories.includes(category) && (
                  <ul className="shop-subcategories">
                    {categories[category].map((subCategory) => (
                      <li key={subCategory}>
                        <label>
                          <input
                            type="checkbox"
                            value={subCategory}
                            onChange={() => toggleSubCategory(subCategory)}
                            checked={selectedSubCategories.includes(subCategory)}
                          />
                          {subCategory}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="shop-products">
          <h2><IconBuildingStore stroke={2} /> Shop Products</h2>
          <div className="shop-products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="shop-product-card"
                  onClick={() => navigate(`/productdetail/${product.id}`)}
                >
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="shop-product-image"
                  />
                  <h4>{product.name}</h4>
                  <p>Price: ₱{product.pricePerBox.toFixed(2)}</p>

                  <button
                    className="cart-icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    title="Add to Cart"
                  >
                    <IconShoppingCartPlus className="cart-icon" size={24} stroke={2} />
                  </button>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>
      </div>
      <ContactInfo />
    </div>
  );
};

export default Shop;