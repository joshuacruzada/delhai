import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import './UpperBar.css';

import { IconSearch, IconShoppingCart, IconBuildingStore } from '@tabler/icons-react';

const UpperBar = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user || null);

      if (user) {
        const cartRef = ref(database, `users/${user.uid}/cart`);
        const snapshot = await get(cartRef);
        if (snapshot.exists()) {
          const cartItems = snapshot.val();
          const count = Object.keys(cartItems).length;
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Add real search logic here
  };

  return (
    <div className="ecommerce-upperbar">
      <div className="ecommerce-logo">
        <span className="upperbar-logo">
          <img src="/bluedelhailogo.png" alt="DELHAI Logo" className="delhai-logo-img" />
        </span>
        <Link to="/" className="delhai-link">DELHAI</Link>
      </div>

      <form className="ecommerce-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          <IconSearch stroke={2} />
        </button>
      </form>

      <div className="ecommerce-nav-links">
        <Link to="/shop" title="Shop">
          <IconBuildingStore stroke={2} />
        </Link>
        <Link to="/cart" title="Cart" className="cart-icon-wrapper">
          <IconShoppingCart stroke={2} />
          {cartCount > 0 && (
            <span className="cart-count-badge">{cartCount}</span>
          )}
        </Link>
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
};

export default UpperBar;
