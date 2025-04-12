import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { database } from "../../FirebaseConfig";
import { ref, get } from "firebase/database";
import "./ProductDetail.css";
import UpperBar from "./UpperBar";
import ContactInfo from "./ContactInfo";
import { IconShoppingCartPlus } from "@tabler/icons-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const productRef = ref(database, `stocks/${productId}`);
      const snapshot = await get(productRef);

      if (snapshot.exists()) {
        setProduct(snapshot.val());
      } else {
        console.error("Product not found!");
      }
    };

    fetchProduct();
  }, [productId]);

  const increaseQty = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (!product) return <p>Loading product details...</p>;

  return (
    <div className="product-detail-page">
      <UpperBar />
      <div className="product-detail-wrapper">
        <div className="product-detail">
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            className="product-detail-image"
          />
          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="product-price">Price: ₱{product.pricePerBox}</p>
            <p className="product-category">Category: {product.category}</p>
            {product.subCategory && (
              <p className="product-subcategory">
                Subcategory: {product.subCategory}
              </p>
            )}

            <div className="quantity-wrapper">
              <label>Quantity</label>
              <div className="qty-box">
                <button onClick={decreaseQty}>−</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={increaseQty}>+</button>
              </div>
              <span className="stock-info">{product.stock} pieces available</span>
            </div>

            <div className="product-btn-group">
              <button
                className="add-to-cart-btn"
                disabled={product.stock === 0}
              >
                <IconShoppingCartPlus size={20} stroke={2} /> Add to Cart
              </button>
              <button className="buy-now-btn" disabled={product.stock === 0}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <ContactInfo />
    </div>
  );
};

export default ProductDetail;
