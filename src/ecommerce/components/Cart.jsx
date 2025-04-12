import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { database } from "../../FirebaseConfig";
import { ref, get, set, remove } from "firebase/database";
import { Link } from "react-router-dom";
import { createCheckoutSession } from "../utils/createCheckoutSession";
import "./Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const userCartRef = ref(database, `users/${user.uid}/cart`);
      const snapshot = await get(userCartRef);

      if (snapshot.exists()) {
        const cartData = snapshot.val();
        const items = Object.entries(cartData).map(([id, data]) => ({
          id,
          ...data,
        }));
        setCartItems(items);
        setFilteredItems(items);
      }

      setLoading(false);
    };

    fetchCart();
  }, []);

  const handleDelete = async (itemId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const itemRef = ref(database, `users/${user.uid}/cart/${itemId}`);
    await remove(itemRef);

    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedItems);
    setFilteredItems(
      updatedItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    );
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  const handleQuantityChange = async (itemId, delta) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const updatedItems = cartItems.map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        const itemRef = ref(database, `users/${user.uid}/cart/${itemId}`);
        set(itemRef, { ...item, quantity: newQty });
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCartItems(updatedItems);
    setFilteredItems(
      updatedItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);

    const filtered = cartItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const totalPrice = filteredItems.reduce((sum, item) => {
    if (selectedItems.includes(item.id)) {
      return sum + item.pricePerBox * item.quantity;
    }
    return sum;
  }, 0);

  const handleCheckout = async () => {
    const cartToCheckout = cartItems
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({
        name: item.name,
        amount: item.pricePerBox * 100,  // Convert to cents for PayMongo
        quantity: item.quantity,
        currency: "PHP"
      }));
  
    if (cartToCheckout.length === 0) {
      alert("Checkout failed: Cart items are invalid or empty.");
      return;
    }
  
    // Compute totalAmount (in PHP) from selected items
    const totalAmount = cartToCheckout.reduce((sum, item) => {
      return sum + (item.amount / 100) * item.quantity;
    }, 0);
  
    // Save to localStorage for retrieval in PaymentSuccess.jsx
    localStorage.setItem("checkoutData", JSON.stringify({
      products: cartToCheckout,
      totalAmount,
    }));
  
    try {
      const checkoutUrl = await createCheckoutSession(cartToCheckout);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout failed:", error.message || error);
      alert("Checkout failed. See console for details.");
    }
  };
  
  

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="cart-page">
      <div className="cart-header-top">
        <h2 className="cart-title">
          <Link to="/" className="cart-home-link">
            Delhai Cart
          </Link>
        </h2>
        <input
          type="text"
          placeholder="Search in cart..."
          value={search}
          onChange={handleSearch}
          className="cart-search"
        />
      </div>

      <div className="cart-container">
        <div className="cart-header">
          <div className="cart-checkbox">
            <input
              type="checkbox"
              className="item-checkbox"
              checked={
                selectedItems.length === filteredItems.length &&
                filteredItems.length > 0
              }
              onChange={handleSelectAll}
            />
          </div>
          <span>Product</span>
          <span>Unit Price</span>
          <span>Quantity</span>
          <span>Total Price</span>
          <span>Actions</span>
        </div>

        {filteredItems.length === 0 ? (
          <p className="empty-msg">Your cart is empty or no match found.</p>
        ) : (
          filteredItems.map((item) => (
            <div className="cart-row" key={item.id}>
              <div className="cart-checkbox">
                <input
                  type="checkbox"
                  className="item-checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                />
              </div>
              <div className="cart-product">
                <img src={item.imageUrl} alt={item.name} />
                <span>{item.name}</span>
              </div>
              <div>
                <span>&#8369;{item.pricePerBox.toFixed(2)}</span>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                <span className="qty-display">{item.quantity}</span>
                <button className="qty-btn" onClick={() => handleQuantityChange(item.id, 1)}>+</button>
              </div>
              <div>
                <span>&#8369;{(item.quantity * item.pricePerBox).toFixed(2)}</span>
              </div>
              <div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-footer-left">
          <input
            type="checkbox"
            checked={
              selectedItems.length === filteredItems.length &&
              filteredItems.length > 0
            }
            onChange={handleSelectAll}
          />
          <span>Select All ({filteredItems.length})</span>
          <button
            className="footer-delete"
            onClick={() => selectedItems.forEach(handleDelete)}
          >
            Delete
          </button>
        </div>
        <div className="cart-footer-right">
          <span>
            Total ({selectedItems.length} item
            {selectedItems.length !== 1 ? "s" : ""}):
          </span>
          <span className="cart-total-price">
            &#8369;{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button className="checkout-btn" onClick={handleCheckout}>Check Out</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
