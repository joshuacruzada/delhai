import React, { useState, useEffect, useContext } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import "./NewOrderForm.css";
import { database } from "../FirebaseConfig";
import { ref, onValue, update } from "firebase/database";
import { completeOrderProcess } from "../services/orderUtils";
import { AuthContext } from "../AuthContext";

const NewOrderForm = ({ onBackToOrders }) => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  const [buyerInfo, setBuyerInfo] = useState({
    soldTo: "",
    address: "",
    tin: "",
    shippedTo: "",
    drNo: "",
    date: "",
    terms: "",
    salesman: "",
    poNo: "",
    email: "",
    userId: user.uid,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const productsRef = ref(database, "stocks/");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name || "",
          description: data[key].description || "No description available",
          price: parseFloat(data[key].pricePerBox) || 0,
          imageUrl: data[key].imageUrl || "",
          quantity: data[key].quantity || 0,
          criticalStock: data[key].criticalStock || 0,
        }));
        setProducts(items);
      }
    });
  }, []);

  useEffect(() => {
    const total = order.reduce((sum, item) => sum + item.editablePrice * item.quantity, 0);
    setTotalAmount(total);
  }, [order]);

  const handleBuyerInfoChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear the error for the field being edited
  };

  const validateFields = () => {
    const newErrors = {};
    const requiredFields = [
      "soldTo",
      "address",
      "tin",
      "shippedTo",
      "drNo",
      "date",
      "terms",
      "salesman",
      "poNo",
      "email",
    ];

    requiredFields.forEach((field) => {
      if (!buyerInfo[field]) {
        newErrors[field] = "This field is required.";
      }
    });

    // Additional validation for email format
    if (buyerInfo.email && !/\S+@\S+\.\S+/.test(buyerInfo.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Additional validation for complete address format
    if (buyerInfo.address) {
      const addressParts = buyerInfo.address.split(",");
      if (addressParts.length < 4) {
        newErrors.address =
          "Please enter a complete address (House No, Street Name, Barangay, City).";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }

    if (order.length === 0) {
      alert("No items in the order");
      return;
    }

    try {
      await completeOrderProcess(buyerInfo, order, totalAmount, products, setProducts);
      alert("Order process completed successfully!");
      onBackToOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    }
  };

  const addProductToOrder = (product) => {
    const existingProduct = order.find((item) => item.id === product.id);
    if (existingProduct) {
      setOrder(
        order.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setOrder([
        ...order,
        { ...product, quantity: 1, packaging: "pcs", editablePrice: product.price },
      ]);
    }
    setProducts(products.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p)));
  };

  const removeProductFromOrder = (productId) => {
    const productToRemove = order.find((item) => item.id === productId);
    if (productToRemove) {
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity + productToRemove.quantity } : p
        )
      );
    }
    setOrder(order.filter((item) => item.id !== productId));
  };

  const updateProductDetails = (productId, key, value) => {
    const updatedOrder = order.map((item) => {
      if (item.id === productId) {
        const updatedItem = { ...item };
        if (key === "quantity") {
          const newQuantity = Math.max(1, value);
          const quantityChange = newQuantity - item.quantity;
          const productRef = ref(database, `stocks/${productId}`);
          const product = products.find((p) => p.id === productId);
          if (product) {
            const updatedQuantity = Math.max(product.quantity - quantityChange, 0);
            update(productRef, { quantity: updatedQuantity })
              .then(() => {
                setProducts(
                  products.map((p) =>
                    p.id === productId ? { ...p, quantity: updatedQuantity } : p
                  )
                );
              })
              .catch((error) => {
                console.error("Error updating quantity in Firebase:", error);
              });
          }
          updatedItem.quantity = newQuantity;
        }

        if (key === "price") {
          const newPrice = parseFloat(value) || item.price;
          updatedItem.editablePrice = newPrice;
        }

        return updatedItem;
      }
      return item;
    });

    setOrder(updatedOrder);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="new-order-form">
      <div className="header-section">
        <button className="btn btn-link back-button" onClick={onBackToOrders}>
          ← Back
        </button>
      </div>

      <div className="order-container">
        <div className="product-list-section">
          <h4>Product List</h4>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search product"
              className="form-control search-product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="product-list">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`product-card ${
                  product.quantity < product.criticalStock ? "low-stock-order" : ""
                }`}
              >
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">₱{product.price.toFixed(2)}</p>
                </div>
                <div className="product-quantity">Stocks: {product.quantity}</div>
                <button
                  className="btn btn-success addto-order-btn"
                  onClick={() => addProductToOrder(product)}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="buyer-order-section">
          <div className="buyer-info-container">
            <h4>Buyer Information</h4>
            <form className="buyer-info-form">
              <div className="buyer-info-grid">
                {["soldTo", "address", "tin", "shippedTo", "drNo", "date", "terms", "salesman", "poNo", "email"].map(
                  (field) => (
                    <div className="buyer-form-group" key={field}>
                      <label htmlFor={field}>
                        {field}{" "}
                        <span className="required-asterisk">
                          {["soldTo", "address", "email", "tin", "shippedTo", "drNo", "date", "terms", "salesman", "poNo"].includes(
                            field
                          )
                            ? "*"
                            : ""}
                        </span>
                      </label>
                      <input
                        type={field === "date" ? "date" : field === "email" ? "email" : "text"}
                        id={field}
                        name={field}
                        className={`form-control ${errors[field] ? "is-invalid" : ""}`}
                        placeholder={`Enter ${field}`}
                        value={buyerInfo[field]}
                        onChange={handleBuyerInfoChange}
                      />
                      {/* Error Message */}
                      {errors[field] && <div className="error-message">{errors[field]}</div>}
                    </div>
                  )
                )}
                </div>
              </form>
            </div>


          <div className="order-details-section">
            <h4>Order Information</h4>
            {order.length === 0 ? (
              <p>No products in order</p>
            ) : (
              order.map((item) => (
                <div className="order-item" key={item.id}>
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="order-product-info">
                    <span className="product-name">{item.name}</span>
                    <span className="product-description">{item.description}</span>
                  </div>
                  <div className="quantity-control">
                    <button
                      onClick={() => updateProductDetails(item.id, "quantity", item.quantity - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateProductDetails(item.id, "quantity", parseInt(e.target.value, 10))
                      }
                      min="1"
                    />
                    <button
                      onClick={() => updateProductDetails(item.id, "quantity", item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="price-wrapper">
                    <span>₱</span>
                    <input
                      type="number"
                      value={item.editablePrice}
                      onChange={(e) =>
                        updateProductDetails(item.id, "price", parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <button onClick={() => removeProductFromOrder(item.id)}>
                    <RiDeleteBin6Line />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="total-amount-container">
            <strong>Total Amount:</strong> ₱{totalAmount.toFixed(2)}
            <button className="btn btn-primary" onClick={handleCreateInvoice}>
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderForm;
