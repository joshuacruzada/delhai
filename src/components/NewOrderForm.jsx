import React, { useState, useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import './NewOrderForm.css';
import { database } from '../FirebaseConfig';
import { ref, onValue, update } from 'firebase/database';

const NewOrderForm = ({ onBackToOrders, onNext }) => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('order'); // Tracks whether to show order or buyer info page

  useEffect(() => {
    const productsRef = ref(database, 'stocks/');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name || '',
          description: data[key].description || 'No description available',
          price: parseFloat(data[key].pricePerBox) || 0,
          imageUrl: data[key].imageUrl || '',
          stock: data[key].quantity || 0,
          packagingOptions: ['pcs', 'box'],
        }));
        setProducts(items);
      }
    });
  }, []);

  // Function to handle switching to the buyer information page
  const goToBuyerInfo = () => {
    setCurrentPage('buyerInfo');
  };

  // Function to handle going back to the order page
  const goToOrderPage = (e) => {
    e.preventDefault(); // Prevent form submission
    setCurrentPage('order');
  };

  // Use the passed prop to go back to the order history
  const handleBackClick = () => {
    onBackToOrders(); // Calls the function to show the order history
  };

  // Add product to order
  const addProductToOrder = (product) => {
    const existingProduct = order.find((item) => item.id === product.id);
    if (existingProduct) {
      const updatedOrder = order.map((item) => {
        if (item.id === product.id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      setOrder(updatedOrder);
    } else {
      const updatedOrder = [...order, { ...product, quantity: 1, packaging: 'pcs', editablePrice: product.price }];
      setOrder(updatedOrder);
    }
    updateTotalAmount();
    updateStock(product.id, -1); // Decrease stock when added to order
  };

  // Update stock in Firebase
  const updateStock = (productId, quantityChange) => {
    const productRef = ref(database, `stocks/${productId}`);
    const product = products.find((p) => p.id === productId);

    if (product) {
      const currentStock = Number(product.stock) || 0;
      const updatedStock = Math.max(currentStock + quantityChange, 0);

      if (!isNaN(updatedStock)) {
        update(productRef, { stock: updatedStock })
          .then(() => {
            setProducts(products.map((p) => (p.id === productId ? { ...p, stock: updatedStock } : p)));
          })
          .catch((error) => {
            console.error('Error updating stock:', error);
          });
      } else {
        console.error('Invalid stock value detected:', updatedStock);
      }
    }
  };

  // Update total amount
  const updateTotalAmount = (updatedOrder = order) => {
    const total = updatedOrder.reduce((sum, item) => sum + item.editablePrice * item.quantity, 0);
    setTotalAmount(total);
  };

  // Update product quantity or price
  const updateProductDetails = (productId, key, value) => {
    const updatedOrder = order.map((item) => {
      if (item.id === productId) {
        const updatedItem = { ...item };

        if (key === 'quantity') {
          const newQuantity = Math.max(1, value);
          const quantityChange = newQuantity - item.quantity;
          updateStock(productId, -quantityChange);
          updatedItem.quantity = newQuantity;
        }

        if (key === 'price') {
          const newPrice = parseFloat(value) || item.price;
          updatedItem.editablePrice = newPrice;
        }

        return updatedItem;
      }
      return item;
    });

    setOrder(updatedOrder);
    updateTotalAmount(updatedOrder);
  };

  // Remove product from order
  const removeProductFromOrder = (productId) => {
    const productToRemove = order.find((item) => item.id === productId);
    if (productToRemove) {
      updateStock(productId, productToRemove.quantity);
    }
    const updatedOrder = order.filter((item) => item.id !== productId);
    setOrder(updatedOrder);
    updateTotalAmount(updatedOrder);
  };

  // Update packaging selection
  const updateProductPackaging = (productId, newPackaging) => {
    const updatedOrder = order.map((item) => {
      if (item.id === productId) {
        return { ...item, packaging: newPackaging };
      }
      return item;
    });
    setOrder(updatedOrder);
  };

  // Search and filter products
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
    <div className="new-order-form">
      <div className="header-section">
        <button className="btn btn-link back-button" onClick={handleBackClick}>
          ← Back
        </button>
      </div>

      <div className="order-container full-screen">
        {/* Left Section: Product List */}
        <div className="product-list-section">
          
          <div className="product-header-container">
            <h4>Product List</h4>
          </div>
          
          <div className="search-container">
            <i className="bi bi-search search-icon"></i> {/* Bootstrap search icon */}
              <input
                type="text"
                placeholder="Search product"
                className="form-control search-product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>


          <div className="product-list">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">₱{Number.isFinite(product.price) ? product.price.toFixed(2) : 'N/A'}</p>
                  </div>
                  <div className="product-stock">Stock: {product.stock}</div>
                  <button className="btn btn-success addto-order-btn" onClick={() => addProductToOrder(product)}>+</button>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>

        {/* Right Section: Flip Effect */}
        <div className={`flip-container ${currentPage === 'buyerInfo' ? 'flipped' : ''}`}>
          <div className="flipper">
            {/* Order Page (front) */}
            <div className="front">
              <div className="order-details-section">
                <div className="order-header">
                  <h4>Order</h4>
                  <div className="next-btn-container">
                    <button className="btn next-btn" onClick={goToBuyerInfo}>
                      Next Page
                    </button>
                  </div>
                </div>
                {order.length === 0 ? (
                  <p>No products in order</p>
                ) : (
                  order.map((item) => (
                    <div className="order-item" key={item.id}>
                      <img src={item.imageUrl} alt={item.name} className="order-item-image-small" />
                      <span>{item.name}</span>

                      {/* Packaging Dropdown */}
                      <select
                        className="form-control packaging-dropdown-wide"
                        value={item.packaging}
                        onChange={(e) => updateProductPackaging(item.id, e.target.value)}
                      >
                        {item.packagingOptions.map((option, i) => (
                          <option key={i} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      {/* Quantity Control */}
                      <div className="quantity-control">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateProductDetails(item.id, 'quantity', item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => updateProductDetails(item.id, 'quantity', parseInt(e.target.value, 10))}
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateProductDetails(item.id, 'quantity', item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="price-wrapper">
                        <span>₱</span>
                        <input
                          type="number"
                          className="form-control editable-price-input"
                          value={item.editablePrice}
                          onChange={(e) => updateProductDetails(item.id, 'price', e.target.value)}
                        />
                      </div>

                      {/* Remove button */}
                      <button className="remove-item-button" onClick={() => removeProductFromOrder(item.id)}>
                        <RiDeleteBin6Line style={{ color: 'red', fontSize: '1.5em' }} />
                      </button>
                    </div>
                  ))
                )}
                  <div className="total-amount-container">
                    <div className="total-amount">
                      <strong>Total Amount:</strong>
                      <span>₱{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

              </div>
            </div>

            {/* Buyer Info Page (back) */}
            <div className="back">
              <div className="buyer-info-container">
                <h4>Buyer Information</h4>
                <form className="buyer-info-form">
                  <div className="form-group">
                    <label htmlFor="buyerName">Buyer Name</label>
                    <input type="text" id="buyerName" className="form-control" placeholder="Enter buyer name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="buyerAddress">Buyer Address</label>
                    <input type="text" id="buyerAddress" className="form-control" placeholder="Enter buyer address" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="buyerPhone">Buyer Phone</label>
                    <input type="text" id="buyerPhone" className="form-control" placeholder="Enter buyer phone" />
                  </div>

                  <div className="action-buttons">
                    <button className="btn btn-secondary" onClick={goToOrderPage}>
                      Previous
                    </button>
                    <button className="btn btn-primary" onClick={onNext}>
                      Create Invoice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default NewOrderForm;
