import React, { useState, useEffect, useContext } from "react";
import { database } from "../FirebaseConfig";
import { ref, get, push } from "firebase/database";
import { useParams } from 'react-router-dom';
import { AuthContext } from "../AuthContext";
import ViewProductListModal from './ViewProductListModal';
import "./CustomerOrderForm.css";
import { RiDeleteBin6Line } from "react-icons/ri";
import "bootstrap/dist/css/bootstrap.min.css";

// ✅ Removed unused imports
// import { RiDeleteBin6Line } from "react-icons/ri"; 
// import { ProductModal } from "somewhere"; 

const CustomerOrderForm = () => {
  const [step, setStep] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    zipCode: "",
    shippedTo: "",
    tin: "",
    drNo: "",
    poNo: "",
    terms: "",
    salesman: "",
    email: "",
  });

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [noRecordFound, setNoRecordFound] = useState(false);
    const { userId } = useParams();
    const { user } = useContext(AuthContext);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false); // Modal state
    const [order, setOrder] = useState([]); // List of ordered products
    const [products, setProducts] = useState([]); // All available products
    const [totalAmount, setTotalAmount] = useState(0); // Total amount for the order


  // 🔄 Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!userId) return; // Ensure userId is present
  
      const customersRef = ref(database, `customers/${userId}`);
      try {
        const snapshot = await get(customersRef);
        if (snapshot.exists()) {
          const customerList = Object.entries(snapshot.val()).map(([id, value]) => ({
            id,
            ...value,
          }));
          setFilteredCustomers(customerList);
        } else {
          console.warn('No customers found for this user.');
        }
      } catch (error) {
        console.error('Error fetching customers:', error.message);
      }
    };
  
    fetchCustomers();
  }, [userId]);
  
  
    const addProductToOrder = (product) => {
        setOrder((prevOrder) => {
        const existingProduct = prevOrder.find((item) => item.id === product.id);
        if (existingProduct) {
            return prevOrder.map((item) =>
            item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
        } else {
            return [
            ...prevOrder,
            {
                ...product,
                quantity: 1,
                packaging: product.packaging || "N/A",
                price: parseFloat(product.pricePerBox || product.price || 0),
                imageUrl: product.imageUrl || "placeholder.png",
            },
            ];
        }
        });
    };
  
  

  const updateQuantity = (productId, amount) => {
    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(item.quantity + amount, 0) }
          : item
      )
    );
  };
  const removeProductFromOrder = (productId) => {
    setOrder((prevOrder) => prevOrder.filter((item) => item.id !== productId));
  };
  
  useEffect(() => {
    const total = order.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    setTotalAmount(total);
  }, [order]);
  
  
  useEffect(() => {
    const fetchProducts = async () => {
      const productsRef = ref(database, "stocks/");
      try {
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
          const productList = Object.entries(snapshot.val()).map(([id, value]) => ({
            id,
            name: value.name || "",
            packaging: value.packaging || "N/A",
            price: parseFloat(value.pricePerBox || value.price || 0), // Map price correctly
            imageUrl: value.imageUrl || "placeholder.png",
            quantity: 0,
          }));
          setProducts(productList);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
  
    fetchProducts();
  }, []);
  
  

  // 🔍 Search Customer by Name
  const handleBuyerInfoChange = (e) => {
    const { name, value } = e.target;
    setBuyerInfo((prev) => ({ ...prev, [name]: value }));
  
    if (name === 'name') {
      setIsSearching(true);
      setTimeout(() => {
        const matches = filteredCustomers.filter((customer) =>
          customer.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCustomers(matches);
        setIsSearching(false);
        setNoRecordFound(matches.length === 0);
      }, 500);
    }
  };
  

  const handleCustomerSelect = (customer) => {
    setBuyerInfo({
      ...buyerInfo,
      name: customer.name,
      phone: customer.phone || "",
      province: customer.province || "",
      city: customer.city || "",
      barangay: customer.barangay || "",
      street: customer.street || "",
      zipCode: customer.zipCode || "",
      tin: customer.tin || "",
      drNo: customer.drNo || "",
      poNo: customer.poNo || "",
      terms: customer.terms || "",
      salesman: customer.salesman || "",
      email: customer.email || "",
    });
    setFilteredCustomers([]);
    setIsSearching(false);
    setNoRecordFound(false);
  };



useEffect(() => {
  console.log("AuthContext User:", user);
  if (!user) {
    console.warn("User is not authenticated. Redirecting to login...");
    // Optional: Redirect to login
    // navigate('/login');
  }
}, [user]);


  const handleNextStep = () => setStep(2);
  const handlePreviousStep = () => setStep(1);


  console.log('User ID from URL:', userId);

  const handleRequestOrder = async () => {
    try {
      if (!userId) {
        throw new Error("Invalid access. User ID is missing in the link.");
      }
  
      // Create the order with a status "pending"
      const orderRef = ref(database, `requestOrders/${userId}`);
      await push(orderRef, {
        userId,
        order,
        totalAmount,
        status: "pending", // Initial status is 'pending'
        createdAt: new Date().toISOString(),
        expiry: new Date().getTime() + 24 * 60 * 60 * 1000, 
        phone: buyerInfo.phone || "", 
      });
  
      alert("Order successfully submitted. Please confirm your order.");
  
    } catch (error) {
      console.error("Error submitting order:", error.message);
      alert(`Failed to submit order: ${error.message}`);
    }
  };
  
  
  


  return (
    <div className="container customer-order-form">
      {/* Header */}
      <div className="d-flex align-items-center customer-form-header mb-4">
        <div className="d-flex align-items-center customer-form-logo">
          <img src="/bluedelhailogo.png" alt="DELHAI Logo" className="logo-img me-3" />
          <div className="customer-logo-title">
            <h2 className="fw-bold mb-0">DELHAI</h2>
            <p className="mb-0">Medical Enterprise</p>
          </div>
        </div>
      </div>

      {/* ORDER FORM Title */}
        <div className="text-center mb-4">
          <h4 className="fw-bold order-form-title">ORDER FORM</h4>
        </div>

      {/* Step 1 */}
      {step === 1 && (
        <>
          <h6>Name:</h6>
          <input
            name="name"
            className="form-control"
            placeholder="Customer Name"
            value={buyerInfo.name}
            onChange={handleBuyerInfoChange}
          />
          {/* Dropdown with loading and no-record feedback */}
            {buyerInfo.name.trim() !== "" && (
            <div className="customer-suggestion-popup">
                {isSearching ? (
                <div className="customer-loading-item">Searching...</div>
                ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                    <div
                    key={customer.id}
                    className="customer-suggestion-item"
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

          {/* Address */}
          <h6 className="mt-4"><strong>Address:</strong></h6>
          <div className="row">
            {["province", "city", "barangay", "street", "zipCode"].map((field) => (
              <div key={field} className="col-md-6 mb-2">
                <input
                  type="text"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={buyerInfo[field]}
                  onChange={handleBuyerInfoChange}
                  className="form-control"
                />
              </div>
            ))}
          </div>

          
         {/* Contact Information */}
          <h6 className="mt-4"><strong>Contact Information:</strong></h6>
          <div className="row">
            {/* Email Input */}
            <div className="col-md-6 mb-2">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={buyerInfo.email}
                onChange={handleBuyerInfoChange}
                className="form-control"
              />
            </div>

            {/* Phone Input */}
            <div className="col-md-6 mb-2">
              
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder="Phone Number"
                value={buyerInfo.phone}
                onChange={handleBuyerInfoChange}
                className="form-control"
              />
            </div>
          </div>


          {/* Other Information */}
          <h6 className="mt-4"><strong>Other Information:</strong></h6>
          <div className="row">
            {["shippedTo", "tin", "drNo", "poNo", "terms", "salesman"].map((field) => (
              <div key={field} className="col-md-6 mb-2">
                <input
                  type="text"
                  name={field}
                  placeholder={
                    field === "shippedTo"
                      ? "Shipped To (optional)"
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={buyerInfo[field]}
                  onChange={handleBuyerInfoChange}
                  className="form-control"
                />
              </div>
            ))}
          </div>

          <div className="customer-form-nextbtn-container">
            <button className="btn btn-primary mt-4 customer-form-nextbtn" onClick={handleNextStep}>
                Next
            </button>
          </div>

        </>
      )}

      {/* Step 2 */}
        {step === 2 && (
        <div className="customer-order-step2">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold">ORDER INFORMATION</h4>
            <button
                className="btn btn-outline-primary"
                onClick={() => setIsProductModalOpen(true)}
            >
                View Product List
            </button>
            </div>

            {/* Order Items Section */}
            <div className="order-items-container mb-4">
            {order.map((item) => (
                <div key={item.id} className="order-item d-flex align-items-center justify-content-between mb-2 p-2 border rounded">
                {/* Item Details */}
                <div className="d-flex align-items-center">
                    <img
                    src={item.imageUrl || "placeholder.png"}
                    alt={item.name}
                    className="order-item-image me-2"
                    />
                    <div>
                    <p className="mb-0 fw-bold">{item.name}</p>
                    <p className="mb-0 text-muted">{item.packaging}</p>
                    <p className="mb-0 text-success">₱{(item.price || 0).toFixed(2)}</p>

                    </div>
                </div>

                {/* Quantity Controls */}
                <div className="d-flex align-items-center">
                    <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => updateQuantity(item.id, -1)}
                    >
                    -
                    </button>
                    <input
                    type="text"
                    value={item.quantity}
                    readOnly
                    className="form-control form-control-sm text-center mx-1"
                    style={{ width: "50px" }}
                    />
                    <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => updateQuantity(item.id, 1)}
                    >
                    +
                    </button>
                </div>

                {/* Remove Button */}
                <button
                     className="customer-removebtn"
                        onClick={() => removeProductFromOrder(item.id)}
                                  >
                        <RiDeleteBin6Line />
                </button>
                </div>
            ))}
            </div>

            {/* Total Amount Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold">Total Amount:</h5>
            <h5 className="fw-bold">₱{(totalAmount || 0).toFixed(2)}</h5>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between">
            <button
                className="btn btn-secondary"
                onClick={handlePreviousStep}
            >
                Back
            </button>
            <button
                className="btn btn-success"
                onClick={handleRequestOrder}
            >
                Submit Order
            </button>
            </div>
        </div>
        )}

    {isProductModalOpen && (
    <ViewProductListModal
        products={products} // Pass available products
        onAddProduct={addProductToOrder} // Add selected product to order
        onClose={() => setIsProductModalOpen(false)}
    />
    )}


    </div>
  );
};

export default CustomerOrderForm;
