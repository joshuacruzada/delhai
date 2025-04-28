import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { get, ref, onValue } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import './UpperBar.css';

import { IconSearch, IconShoppingCart, IconBuildingStore } from '@tabler/icons-react';
import ProfileDropdown from './ProfileDropdown'; // <<< NEW IMPORT

const UpperBar = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);

      if (user) {
        const cartRef = ref(database, `users/${user.uid}/cart`);
        onValue(cartRef, (snapshot) => {
          if (snapshot.exists()) {
            const cartItems = snapshot.val();
            const count = Object.keys(cartItems).length;
            setCartCount(count);
          } else {
            setCartCount(0);
          }
        });
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

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const products = snapshot.val();
      const filteredProducts = Object.values(products).filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredProducts);
    } else {
      setSearchResults([]);
    }
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

      {searchQuery && searchResults.length > 0 && (
        <div className="search-results">
          <ul>
            {searchResults.map((product, index) => (
              <li key={index}>
                <Link to={`/productdetail/${product.id}`}>{product.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ecommerce-nav-links">
        <Link to="/shop" title="Shop">
          <IconBuildingStore stroke={2} />
        </Link>
        <Link to="/cart" title="Cart" className="cart-icon-wrapper">
          <IconShoppingCart stroke={2} />
          {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <ProfileDropdown user={user} handleLogout={handleLogout} />
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
};

export default UpperBar;
