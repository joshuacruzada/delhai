import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { database } from "../../FirebaseConfig";
import { createCheckoutSession } from "../utils/createCheckoutSession";
import "./ProductDetail.css";
import UpperBar from "./UpperBar";
import ContactInfo from "./ContactInfo";
import { IconShoppingCartPlus } from "@tabler/icons-react";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const auth = getAuth();

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
    if (product && quantity < product.totalAddedStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!auth.currentUser) return alert("Please login first!");

    const cartRef = ref(database, `users/${auth.currentUser.uid}/cart/${productId}`);
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      const existing = snapshot.val();
      await set(cartRef, { ...existing, quantity: existing.quantity + quantity });
    } else {
      await set(cartRef, {
        id: productId,
        name: product.name,
        pricePerBox: product.pricePerBox,
        imageUrl: product.imageUrl || "/placeholder.png",
        packaging: product.packaging || '',
        quantity,
      });
    }

    // Sync localStorage
    const cartItemsRaw = localStorage.getItem("cartItems");
    let cartItems = cartItemsRaw ? JSON.parse(cartItemsRaw) : [];

    const existingLocalItem = cartItems.find(item => item.id === productId);
    if (existingLocalItem) {
      existingLocalItem.quantity += quantity;
    } else {
      cartItems.push({
        id: productId,
        name: product.name,
        pricePerBox: product.pricePerBox,
        imageUrl: product.imageUrl || "/placeholder.png",
        packaging: product.packaging || '',
        quantity,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  };

  const handleBuyNow = async () => {
    if (!auth.currentUser) return alert("Please login first!");

    const checkoutItem = {
      id: productId,
      name: product.name,
      pricePerBox: product.pricePerBox,
      quantity,
      imageUrl: product.imageUrl || '',
      packaging: product.packaging || '',
      amount: product.pricePerBox * 100,
      currency: "PHP"
    };

    // Save the checkout data to localStorage (optional if you need backup)
    localStorage.setItem("checkoutData", JSON.stringify({
      products: [checkoutItem],
      totalAmount: product.pricePerBox * quantity,
    }));

    try {
      const checkoutUrl = await createCheckoutSession([checkoutItem]);
      window.location.href = checkoutUrl; // Redirect to PayMongo
    } catch (error) {
      console.error("Checkout failed:", error.message || error);
      alert("Checkout failed. See console for details.");
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
              <p className="product-subcategory">Subcategory: {product.subCategory}</p>
            )}

            <div className="quantity-wrapper">
              <label>Quantity</label>
              <div className="qty-box">
                <button onClick={decreaseQty}>−</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={increaseQty}>+</button>
              </div>
              <span className="stock-info">{product.stock} available</span>
            </div>

            <div className="product-btn-group">
              <button
                className="add-to-cart-btn"
                disabled={product.totalAddedStock === 0}
                onClick={handleAddToCart}
              >
                <IconShoppingCartPlus size={20} stroke={2} /> Add to Cart
              </button>
              <button
                className="buy-now-btn"
                disabled={product.totalAddedStock === 0}
                onClick={handleBuyNow}
              >
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
