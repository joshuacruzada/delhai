import React, { useEffect, useState } from 'react';
import { database } from '../../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Link } from "react-router-dom";
import ContactInfo from '../components/ContactInfo';
import './LandingPage.css';

import landingImage from '../pictures/landing-image.png'; // 🛠️ Import the fixed landing image
import rapidTestsImg from '../pictures/rapid-test.png';
import xrayProductsImg from '../pictures/xray-product.png';
import labReagentsImg from '../pictures/cholesterol liquid.webp';
import medicalSuppliesImg from '../pictures/medical-supplies.png';
import UpperBar from './UpperBar';

const categories = [
  { name: 'Rapid Tests', image: rapidTestsImg },
  { name: 'X-Ray Products', image: xrayProductsImg },
  { name: 'Laboratory Reagents', image: labReagentsImg },
  { name: 'Medical Supplies', image: medicalSuppliesImg }
];

const LandingPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const productsRef = ref(database, 'stocks');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const fetchedProducts = snapshot.val();
      if (fetchedProducts) {
        const productList = Object.keys(fetchedProducts).map((id) => ({
          id,
          ...fetchedProducts[id]
        }));
        setProducts(productList);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="main-container">
      <UpperBar />
      <div className="landing-container">
        {/* Hero Section */}
        <div className="landing-hero-section">
          <div className="landing-hero-content">
            <h1>Welcome to DELHAI Medical Enterprise</h1>
            <p>Discover the best selection of medical supplies at unbeatable prices. Whether you're looking for syringes, gloves, or diagnostic tests, we've got you covered.</p>
            <Link to="/shop" className="landing-shop-btn">Shop Now</Link>
          </div>
          <div className="landing-hero-image">
            {/* 🛠️ Always use the fixed image */}
            <img src={landingImage} alt="DELHAI Medical Enterprise" />
          </div>
        </div>

        {/* Categories */}
        <div className="landing-categories">
          <h2>Categories</h2>
          <div className="category-container">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <img src={category.image} alt={category.name} />
                <p>{category.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="landing-featured-products">
          <h2>Featured Products</h2>
          <div className="landing-products-container">
            {products.map(product => (
              <div key={product.id} className="landing-product-card">
                <img src={product.imageUrl || '/path/to/placeholder.png'} alt={product.name} />
                <h3>{product.name}</h3>
                <p>Price: ₱{product.pricePerBox}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="landing-about-section">
        <h2>About Us</h2>
        <p>
          We are dedicated to providing high-quality healthcare products to hospitals, clinics, and laboratories worldwide. 
          Our company specializes in offering a wide range of medical supplies, from essential diagnostic tools to high-precision laboratory reagents. 
          We are committed to affordability without compromising quality, ensuring that healthcare providers have access to reliable medical solutions. 
          Our mission is to enhance healthcare accessibility by delivering safe, and effective products to the industry. 
          With DELHAI, you can trust that your medical supply needs are met with professionalism and excellence.
        </p>
      </div>

      {/* Contact Info */}
      <ContactInfo />
    </div>
  );
};

export default LandingPage;
