import React, { useState, useEffect, useContext} from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import './NewOrderForm.css';
import { database } from '../FirebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { completeOrderProcess } from '../services/orderUtils';
import { AuthContext } from '../AuthContext';

const NewOrderForm = ({ onBackToOrders, onNext = () => {} }) => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('order');
  const { user } = useContext(AuthContext); // Get the logged-in user

  // Buyer information state
  const [buyerInfo, setBuyerInfo] = useState({
    soldTo: '',
    address: '',
    tin: '',
    shippedTo: '',
    drNo: '',
    date: '',
    terms: '',
    salesman: '',
    poNo: '',
    email: '',
    userId: user.uid,
  });

  // Fetch products from Firebase
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
          quantity: data[key].quantity || 0,
          minStockBox: data[key].minStockBox || 0,
          minStockPcs: data[key].minStockPcs || 0,
          packagingOptions: ['pcs', 'box'],
        }));
        setProducts(items);
      }
    });
  }, []);

  // Automatically update total amount when the order changes
  useEffect(() => {
    updateTotalAmount(order);
  }, [order]);

  // Function to calculate and update the total amount based on order
  const updateTotalAmount = (updatedOrder) => {
    const total = updatedOrder.reduce((sum, item) => sum + item.editablePrice * item.quantity, 0);
    setTotalAmount(total);
  };

  // Handle buyer info input changes
  const handleBuyerInfoChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  // Function to check if the product is below its minimum stock
  const isBelowMinStock = (product) => {
    const minStockBox = parseInt(product.minStockBox, 10) || 0;
    const minStockPcs = parseInt(product.minStockPcs, 10) || 0;
    const minStockLevel = Math.max(minStockBox, minStockPcs);

    return product.quantity < minStockLevel;
  };

  // Handle form submission and complete the order processimport { completeOrderProcess } from '../services/orderUtils';

  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    if (order.length === 0) {
      alert('No items in the order');
      return;
    }

    try {
      await completeOrderProcess(buyerInfo, order, totalAmount, products, setProducts);
      alert('Order process completed successfully!');
      onBackToOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    }
  };


  // Switch to buyer info page
  const goToBuyerInfo = () => {
    setCurrentPage('buyerInfo');
  };

  // Go back to order page
  const goToOrderPage = (e) => {
    e.preventDefault();
    setCurrentPage('order');
  };

  // Back to order history
  const handleBackClick = () => {
    onBackToOrders();
  };

  // Add product to order and decrease quantity in Firebase
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

    // Decrease quantity in Firebase
    const productRef = ref(database, `stocks/${product.id}`);
    const updatedQuantity = Math.max(product.quantity - 1, 0);
    update(productRef, { quantity: updatedQuantity })
      .then(() => {
        setProducts(products.map((p) => (p.id === product.id ? { ...p, quantity: updatedQuantity } : p)));
      })
      .catch((error) => {
        console.error('Error updating quantity in Firebase:', error);
      });
  };

  // Update product details like quantity or price
  const updateProductDetails = (productId, key, value) => {
    const updatedOrder = order.map((item) => {
      if (item.id === productId) {
        const updatedItem = { ...item };
        if (key === 'quantity') {
          const newQuantity = Math.max(1, value);
          const quantityChange = newQuantity - item.quantity;

          const productRef = ref(database, `stocks/${productId}`);
          const product = products.find((p) => p.id === productId);
          if (product) {
            const updatedQuantity = Math.max(product.quantity - quantityChange, 0);
            update(productRef, { quantity: updatedQuantity })
              .then(() => {
                setProducts(products.map((p) => (p.id === productId ? { ...p, quantity: updatedQuantity } : p)));
              })
              .catch((error) => {
                console.error('Error updating quantity in Firebase:', error);
              });
          }

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
  };

  // Remove product from order and return quantity back to Firebase
  const removeProductFromOrder = (productId) => {
    const productToRemove = order.find((item) => item.id === productId);
    if (productToRemove) {
      const productRef = ref(database, `stocks/${productId}`);
      const product = products.find((p) => p.id === productId);
      if (product) {
        const updatedQuantity = product.quantity + productToRemove.quantity;
        update(productRef, { quantity: updatedQuantity })
          .then(() => {
            setProducts(products.map((p) => (p.id === productId ? { ...p, quantity: updatedQuantity } : p)));
          })
          .catch((error) => {
            console.error('Error updating quantity in Firebase:', error);
          });
      }
    }

    const updatedOrder = order.filter((item) => item.id !== productId);
    setOrder(updatedOrder);
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
        <div className="product-list-section">
          <div className="product-header-container">
            <h4>Product List</h4>
          </div>

          <div className="search-container">
            <i className="bi bi-search search-icon"></i>
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
                <div
                  className={`product-card ${isBelowMinStock(product) ? 'low-stock-order' : ''}`}
                  key={product.id}
                >
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">₱{Number.isFinite(product.price) ? product.price.toFixed(2) : 'N/A'}</p>
                  </div>
                  <div className="product-quantity">Stocks: {product.quantity}</div>
                  <button className="btn btn-success addto-order-btn" onClick={() => addProductToOrder(product)}>
                    +
                  </button>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </div>

        <div className={`flip-container ${currentPage === 'buyerInfo' ? 'flipped' : ''}`}>
          <div className="flipper">
            <div className="front">
              <div className="order-details-section">
                <div className="order-header">
                  <h4>Order Information</h4>
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
                      <div className="order-product-info">
                        <span className="product-name">{item.name}</span>
                        <span className="product-description">{item.description}</span>
                      </div>

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

                      <button className="remove-item-button" onClick={() => removeProductFromOrder(item.id)}>
                        <RiDeleteBin6Line />
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

            <div className="back">
              <div className="buyer-info-container">
                <h4>Buyer Information</h4>
                <button className="btn previous-btn" onClick={goToOrderPage}>
                  Previous
                </button>

                <form className="buyer-info-form" onSubmit={handleCreateInvoice}>
                    <div className="form-group">
                      <label htmlFor="soldTo">Sold To</label>
                      <input
                        type="text"
                        id="soldTo"
                        name="soldTo"
                        className="form-control"
                        placeholder="Enter buyer name"
                        value={buyerInfo.soldTo}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        className="form-control"
                        placeholder="Enter buyer address"
                        value={buyerInfo.address}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="tin">TIN</label>
                      <input
                        type="text"
                        id="tin"
                        name="tin"
                        className="form-control"
                        placeholder="Enter buyer TIN"
                        value={buyerInfo.tin}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippedTo">Shipped To</label>
                      <input
                        type="text"
                        id="shippedTo"
                        name="shippedTo"
                        className="form-control"
                        placeholder="Enter shipping address"
                        value={buyerInfo.shippedTo}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="drNo">DR No.</label>
                      <input
                        type="text"
                        id="drNo"
                        name="drNo"
                        className="form-control"
                        placeholder="Enter delivery receipt number"
                        value={buyerInfo.drNo}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="form-control"
                        value={buyerInfo.date}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="terms">Terms</label>
                      <input
                        type="text"
                        id="terms"
                        name="terms"
                        className="form-control"
                        placeholder="Enter payment terms"
                        value={buyerInfo.terms}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="salesman">Salesman</label>
                      <input
                        type="text"
                        id="salesman"
                        name="salesman"
                        className="form-control"
                        placeholder="Enter salesman name"
                        value={buyerInfo.salesman}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="poNo">PO No.</label>
                      <input
                        type="text"
                        id="poNo"
                        name="poNo"
                        className="form-control"
                        placeholder="Enter purchase order number"
                        value={buyerInfo.poNo}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter buyer email"
                        value={buyerInfo.email}
                        onChange={handleBuyerInfoChange}
                      />
                    </div>
                    <div className="action-buttons">
                      <button className="btn btn-primary" type="submit">
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
