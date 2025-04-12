import React, { useState, useEffect, useContext } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useLocation,  } from "react-router-dom";
import ViewProductListModal from "./ViewProductListModal";
import "./NewOrderForm.css";
import { database } from "../FirebaseConfig";
import { ref, onValue, update, getDatabase, get  } from "firebase/database";
import { completeOrderProcess } from "../services/orderUtils";
import { cleanUpDuplicates } from "../services/customerCleanup";
import { findCustomerByName, addNewCustomer } from "../services/orderUtils";
import { getAuth } from 'firebase/auth';
import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

const NewOrderForm = () => {
  const [step, setStep] = useState(1); // Tracks form step (1: Buyer Info, 2: Order Info)
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [customers, setCustomers] = useState([]); // All customers
  const [filteredCustomers, setFilteredCustomers] = useState([]); // Matched customers
  const [isSearching, setIsSearching] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { user } = useContext(AuthContext); // user contains user ID and role
  const { state } = useLocation();
  const navigate = useNavigate(); 

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
    tin: '',    
  });

  const placeholders = {
    shippedTo: "Shipped To (optional)",
    tin: "Tin #",
    drNo: "DR.#",
    poNo: "P.O #",
    terms: "Terms",
    salesman: "Salesman",
    email: "Email",
   };
   useEffect(() => {
    if (state?.order) {
      const buyerDetails = state.order.buyerInfo || {};
      const orderDetails = state.order.order || [];
      const addressParts = buyerDetails.completeAddress?.split(", ") || [];
  
      setBuyerInfo({
        name: buyerDetails.name || "",
        email: buyerDetails.email || "",
        phone: buyerDetails.phone || "",
        street: addressParts[0] || "",
        barangay: addressParts[1] || "",
        city: addressParts[2] || "",
        province: addressParts[3] || "",
        zipCode: addressParts[4] || "",
        tin: buyerDetails.tin || "",
        poNo: buyerDetails.poNo || "",
        drNo: buyerDetails.drNo || "",
        terms: buyerDetails.terms || "",
        salesman: buyerDetails.salesman || "",
        date: state.order.createdAt
          ? new Date(state.order.createdAt).toLocaleDateString("en-US")
          : "",
      });
  
      // Add `editablePrice` while setting the order
      const formattedOrderDetails = orderDetails.map((item) => ({
        id: item.id || "",
        name: item.name || "",
        packaging: item.packaging || "",
        quantity: item.quantity || 0,
        price: item.price || 0, // Original price
        editablePrice: item.price || 0, // Make it editable
        total: (item.price || 0) * (item.quantity || 0),
        imageUrl: item.imageUrl || "",
      }));
  
      setOrder(formattedOrderDetails);
  
      const total = formattedOrderDetails.reduce((sum, item) => sum + item.total, 0);
      setTotalAmount(total);
    }
  }, [state]);
  
  
  

   useEffect(() => {
    const fetchCustomers = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated.");
        return;
      }
  
      const db = getDatabase();
      const customersRef = ref(db, `customers/${user.uid}`);
  
      try {
        const customerSnapshot = await get(customersRef);
  
        if (customerSnapshot.exists()) {
          const customerList = Object.entries(customerSnapshot.val()).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );
          console.log("Customers retrieved:", customerList);
          setCustomers(customerList);
        } else {
          console.log("No customers found for the current user.");
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
  
    fetchCustomers();
  }, []);
  
  useEffect(() => {
      const productsRef = ref(database, "stocks/");
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const items = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name || "",
            packaging: data[key].packaging || "N/A",
            price: parseFloat(data[key].pricePerBox) || 0, // Correctly map pricePerBox to price
            imageUrl: data[key].imageUrl || "",
            quantity: data[key].quantity || 0,
          }));
          setProducts(items);
        }
      });
  }, [user]);

  useEffect(() => {
    const total = order.reduce((sum, item) => sum + item.editablePrice * item.quantity, 0);
    setTotalAmount(total);
  }, [order]);

  
  const handleCreateOrder = async () => {
  console.log("Order Data:", order);
  console.log("Buyer Info:", buyerInfo);

  if (order.length === 0) {
    alert("No items in the order");
    return;
  }
  
  try {
    const userId = user?.uid; // Get the user ID from the authenticated user
    if (!userId) {
      throw new Error("User ID is missing. Cannot save the order.");
    }

    console.log("User ID:", userId);

    // Clean up duplicate customers in the database
    await cleanUpDuplicates(userId);

    // Check if customer already exists in the database
    const existingCustomer = await findCustomerByName(buyerInfo.name, userId);
    console.log("Existing Customer:", existingCustomer);

    if (!existingCustomer) {
      console.log("Customer not found. Adding as a new customer.");
      await addNewCustomer(buyerInfo);
    } else {
      console.log("Customer already exists:", existingCustomer.name);

      // Update existing customer with new terms
      const db = getDatabase();
      const customerRef = ref(db, `customers/${userId}/${existingCustomer.id}`);

      await update(customerRef, {
        terms: buyerInfo.terms || "", // Update terms if available
      });

      console.log("Customer terms updated successfully:", buyerInfo.terms);
    }

    // Complete the order process
    await completeOrderProcess(buyerInfo, order, totalAmount, products, setProducts, userId);

    alert("Order created successfully!");
    navigate('/orders'); // Call the parent callback to refresh and close form
  } catch (error) {
    console.error("Error creating order:", error);
    alert("Failed to create order. Please try again.");
  }
};

  
  
const [noRecordFound, setNoRecordFound] = useState(false); // New state for "No record" logic

const handleBuyerInfoChange = (e) => {
  const { name, value } = e.target;

  setBuyerInfo((prevInfo) => ({
    ...prevInfo,
    [name]: value,
  }));

  if (name === "name" && value.trim() !== "") {
    setIsSearching(true);
    setTimeout(() => {
      const matches = customers.filter((customer) =>
        customer.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(matches);
      setIsSearching(false);

      // Set noRecordFound based on matches
      setNoRecordFound(matches.length === 0);
    }, 500);
  } else if (name === "name") {
    setFilteredCustomers([]);
    setIsSearching(false);
    setNoRecordFound(false); // Clear "No record" message when input is empty
  }
};
  

  
  

  const validateBuyerInfo = () => {
    const requiredFields = [
      "name",
      "province",
      "city",
      "street",
      "barangay",
      "zipCode",
      "tin",
      "drNo",
      "poNo",
      "terms",
      "salesman",
      "email",
    ];
    return requiredFields.every((field) => buyerInfo[field]?.trim() !== "");
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
        item.id === productId
          ? { ...item, editablePrice: newPrice || 0 } // Default to 0 if newPrice is invalid
          : item
      )
    );
  };

  const addProductToOrder = (product) => {
    const existingProduct = order.find((item) => item.id === product.id);
  
    if (existingProduct) {
      setOrder(
        order.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrder([
        ...order,
        {
          ...product,
          quantity: 1,
          packaging: product.packaging || "N/A",
          editablePrice: parseFloat(product.pricePerBox) || 0, // Use pricePerBox here
          imageUrl: product.imageUrl || "placeholder.png",
        },
      ]);
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
  const handleCustomerSelect = (customer) => {
    setBuyerInfo({
      name: customer.name,
      province: customer.province || "",
      city: customer.city || "",
      street: customer.street || "",
      barangay: customer.barangay || "",
      zipCode: customer.zipCode || "",
      tin: customer.tin || "",
      drNo: customer.drNo || "",
      poNo: customer.poNo || "",
      terms: customer.terms || "", 
      shippedTo: customer.shippedTo || "",
      salesman: customer.salesman || "",
      email: customer.email || "",
    });
    
    setFilteredCustomers([]);
    setIsSearching(false);
    
  };

  const onBackToOrders = () => {
    navigate("/orders"); // Adjust the path to match your orders route
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
                autoComplete="off"
                className="form-input"
              />

            {/* Dropdown with loading and no-record feedback */}
            {buyerInfo.name.trim() !== "" && (
                <div className="suggestion-popup">
                  {isSearching ? (
                    <div className="loading-item">Searching...</div>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="suggestion-item"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        {customer.name}
                      </div>
                    ))
                  ) : (
                    noRecordFound && <div className="no-record-item">No customer record</div>
                  )}
                </div>
              )}


            </div>
            <h3 className="address-section-title">Address</h3>
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
            <h3 className="other-section-title">Other Information</h3>
            <div className="form-grid">
              {["shippedTo","tin", "drNo", "poNo", "terms", "salesman", "email"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  placeholder={placeholders[field]}
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
          <div className="order-info-section">
            <button className="back-to-buyer-btn" onClick={handlePreviousStep}>
              ← Previous
            </button>
            <div className="order-info-header">
              <h2 className="order-info-title">Order Information</h2>
            </div>
            <div className="view-product-btn-container">
              <button className="view-product-btn" onClick={() => setIsProductModalOpen(true)}>
                  View Product List
              </button>
            </div>
              <div className="order-items-container">
              {order.map((item) => (
                <div key={item.id} className="order-item-container">
                  <img src={item.imageUrl || "placeholder.png"} alt={item.name} className="order-item-image" />
                  <div className="order-item-details">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-packaging">{item.packaging}</p>
                  </div>
                  <div className="order-quantity-control">
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <input
                      type="text"
                      value={item.quantity}
                      readOnly
                      className="order-quantity-input"
                    />
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <input
                    type="text"
                    value={(item.editablePrice || 0).toFixed(2)} 
                    onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                    className="order-editable-price-input"
                  />
                  <button
                    className="remove-order-item-btn"
                    onClick={() => removeProductFromOrder(item.id)}
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              ))}
            </div>

            <div className="total-section">
              <div className="total-amount-wrapper">
                <strong className="total-label">Total Amount:</strong>
                <p className="total-value">₱{(totalAmount || 0).toFixed(2)}</p>
              </div>
              <button className="create-order-btn" onClick={handleCreateOrder }>
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
