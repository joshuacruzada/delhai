import React, { useState, useEffect, useContext } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import ViewProductListModal from "./ViewProductListModal";
import "./NewOrderForm.css";
import { database } from "../FirebaseConfig";
import { ref, onValue, update } from "firebase/database";
import { completeOrderProcess } from "../services/orderUtils";
import { AuthContext } from "../AuthContext";

const NewOrderForm = ({ onBackToOrders }) => {
  const [step, setStep] = useState(1); // Tracks form step (1: Buyer Info, 2: Order Info)
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { user } = useContext(AuthContext); // user contains user ID and role

  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    province: "",
    city: "",
    street: "",
    barangay: "",
    zipCode: "",
    shippedTo: "",
    drNo: "",
    poNo: "",
    terms: "",
    salesman: "",
    email: "",
  });

  useEffect(() => {
    const productsRef = ref(database, "stocks/");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data)
          .map((key) => ({
            id: key,
            name: data[key].name || "",
            description: data[key].description || "No description available",
            price: parseFloat(data[key].pricePerBox) || 0,
            imageUrl: data[key].imageUrl || "",
            quantity: data[key].quantity || 0,
            criticalStock: data[key].criticalStock || 0,
            userId: data[key].userId || null, // Ensure each product is tied to a user
          }))
          // Filter products based on the user's ID (if not an admin)
          .filter((product) => user.role === "admin" || product.userId === user.id);

        setProducts(items);
      }
    });
  }, [user]);

  useEffect(() => {
    const total = order.reduce((sum, item) => sum + item.editablePrice * item.quantity, 0);
    setTotalAmount(total);
  }, [order]);

  const handleBuyerInfoChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const validateBuyerInfo = () => {
    const requiredFields = [
      "name",
      "province",
      "city",
      "street",
      "barangay",
      "zipCode",
      "shippedTo",
      "drNo",
      "poNo",
      "terms",
      "salesman",
      "email",
    ];
    return requiredFields.every((field) => buyerInfo[field].trim() !== "");
  };

  const handleNextStep = () => {
    if (validateBuyerInfo()) {
      setStep(2);
    } else {
      alert("Please fill out all required fields.");
    }
  };

  const handlePreviousStep = () => setStep(1);

  const updateQuantity = (productId, amount) => {
    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(item.quantity + amount, 0) }
          : item
      )
    );
  };

  const updatePrice = (productId, newPrice) => {
    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.id === productId ? { ...item, editablePrice: newPrice } : item
      )
    );
  };

  const addProductToOrder = (product) => {
    const existingProduct = order.find((item) => item.id === product.id);
    const productRef = ref(database, `stocks/${product.id}`);

    if (existingProduct) {
      setOrder(
        order.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      update(productRef, { quantity: product.quantity - 1 });
    } else {
      setOrder([
        ...order,
        { ...product, quantity: 1, packaging: "pcs", editablePrice: product.price },
      ]);
      update(productRef, { quantity: product.quantity - 1 });
    }
  };

  const removeProductFromOrder = (productId) => {
    const productToRemove = order.find((item) => item.id === productId);
    if (productToRemove) {
      const productRef = ref(database, `stocks/${productToRemove.id}`);
      update(productRef, { quantity: productToRemove.quantity + productToRemove.quantity });
    }
    setOrder(order.filter((item) => item.id !== productId));
  };

  const handleCreateInvoice = async () => {
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

  return (
    <div>
      <button className="back-btn" onClick={onBackToOrders}>
        ← Back
      </button>
      <div className="new-order-form-container">
      
      <div className="new-order-form">
        {step === 1 && (
          <div className="buyer-info-page">
            <div className="form-header">
              <h2 className="form-title">Add New Order Form</h2>
              <p className="form-date">{new Date().toLocaleDateString()}</p>
            </div>
            <h3 className="section-title">Buyer Information</h3>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={buyerInfo.name}
                onChange={handleBuyerInfoChange}
                className="form-input"
              />
            </div>
            <h3 className="section-title">Address</h3>
            <div className="form-grid">
              {["province", "city", "street", "barangay", "zipCode"].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={buyerInfo[field]}
                  onChange={handleBuyerInfoChange}
                  className="form-input"
                />
              ))}
            </div>
            <h3 className="section-title">Other Information</h3>
            <div className="form-grid">
              {["shippedTo", "drNo", "poNo", "terms", "salesman", "email"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={buyerInfo[field]}
                  onChange={handleBuyerInfoChange}
                  className="form-input"
                />
              ))}
            </div>
            <div className="form-footer">
              <button className="btn-primary" onClick={handleNextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="order-info-page">
            <button className="back-btn" onClick={handlePreviousStep}>
              ← Previous
            </button>
            <div className="form-header">
              <h2 className="form-title">Order Information</h2>
              <p className="form-date">{new Date().toLocaleDateString()}</p>
            </div>
            <button className="btn-secondary" onClick={() => setIsProductModalOpen(true)}>
              View Product List
            </button>
            <div className="order-list">
              {order.map((item) => (
                <div key={item.id} className="order-item">
                  <p className="order-item-name">{item.name}</p>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <input
                      type="text"
                      value={item.quantity}
                      readOnly
                      className="quantity-input"
                    />
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <input
                    type="text"
                    value={item.editablePrice.toFixed(2)}
                    onChange={(e) =>
                      updatePrice(item.id, parseFloat(e.target.value) || 0)
                    }
                    className="editable-price-input"
                  />
                  <button
                    className="remove-item-button"
                    onClick={() => removeProductFromOrder(item.id)}
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              ))}
            </div>
            <div className="total-section">
              <strong>Total Amount:</strong>
              <p>₱{totalAmount.toFixed(2)}</p>
              <button className="btn-primary" onClick={handleCreateInvoice}>
                Create Order
              </button>
            </div>
          </div>
        )}

        {isProductModalOpen && (
          <ViewProductListModal
            products={products}
            onAddProduct={addProductToOrder}
            onClose={() => setIsProductModalOpen(false)}
          />
        )}
      </div>
    </div>

    </div>
    
  );
};

export default NewOrderForm;
