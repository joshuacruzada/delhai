import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import "./Orders.css";
import NewOrderForm from "./NewOrderForm";
import { FaCheck, FaTimes, FaTrashAlt, FaBan, FaEllipsisV, FaLink } from "react-icons/fa";
import { database } from "../FirebaseConfig";
import { ref, get, update, remove } from "firebase/database";
import { AuthContext } from "../AuthContext";
import OrderDetailsModal from './OrderDetailsModal';
import CustomerOrderLinkModal from "./CustomerOrderLinkModal";
import RequestOrder from "./RequestOrder";


const Orders = () => {
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCustomerOrderLinkModal, setShowCustomerOrderLinkModal] = useState(false);

  const { user } = useContext(AuthContext);
  
  const dropdownRef = useRef(null); 
  const modalRef = useRef(null);
  const openCustomerOrderLinkModal = () => setShowCustomerOrderLinkModal(true);
  const closeCustomerOrderLinkModal = () => setShowCustomerOrderLinkModal(false);


  const openNewOrderForm = () => setShowNewOrderForm(true);
  //const closeNewOrderForm = () => setShowNewOrderForm(false);

  
  const handleOrderCreated = () => {
    fetchOrders(); // Refresh the order list
    setShowNewOrderForm(false); // Close the form
  };

  const openOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
    setActiveDropdown(null); // Ensure dropdown closes
  };
  
  
  const closeOrderDetailsModal = () => {
    setSelectedOrder(null);
    setShowOrderDetailsModal(false);
  };
  

  // ** Filter Orders **
  const filterOrders = useCallback(() => {
    const filtered = orderHistory.filter((order) => {
      const matchesStatus =
        activeTab === "All" ||
        (activeTab === "Pending" && order.paymentStatus === "Pending") ||
        (activeTab === "Paid" && order.paymentStatus === "Paid") ||
        (activeTab === "Unpaid" && order.paymentStatus === "Unpaid") ||
        (activeTab === "Cancelled" && order.paymentStatus === "Cancelled");
  
      const matchesSearch =
        order.customerName?.toLowerCase().includes(searchTerm) ||
        order.customerAddress?.toLowerCase().includes(searchTerm);
  
      return matchesStatus && matchesSearch;
    });
  
    console.log("Filtered Orders:", filtered); // Debug filtered results
    setFilteredOrders(filtered);
  }, [orderHistory, searchTerm, activeTab]);
  
  


  // ** Fetch Orders and Merge Customer Information **
  const fetchOrders = useCallback(async () => {
    try {
      if (!user?.uid) throw new Error("User not authenticated");
  
      // References
      const ordersRef = ref(database, `orders/${user.uid}`);
      const customersRef = ref(database, `customers/${user.uid}`);
      const stocksRef = ref(database, `stocks`);
  
      // Fetch data concurrently
      const [ordersSnapshot, customersSnapshot, stocksSnapshot] = await Promise.all([
        get(ordersRef),
        get(customersRef),
        get(stocksRef),
      ]);
  
      const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
      const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {};
      const stocksData = stocksSnapshot.exists() ? stocksSnapshot.val() : {};
  
      // Map through orders and enrich data
      const allOrders = Object.keys(ordersData).map((key) => {
        const order = ordersData[key];
        const customer = customersData[order.customerId] || {};
  
        // Map products with stock data
        const products = (order.products || []).map((product) => {
          const stock = stocksData[product.id] || {};
  
          return {
            id: product.id || 'N/A',
            name: stock.name || product.name || 'N/A',
            quantity: product.quantity || 0,
            price: product.price || 0,
            imageUrl: stock.imageUrl || product.imageUrl || '/placeholder.png',
          };
        });
  
        return {
          id: key,
          ...order,
          customerName: customer.name || 'N/A',
          customerAddress: customer.completeAddress || 'N/A',
          tin: customer.tin || 'N/A',
          shippedTo: customer.shippedTo || '',
          drNo: customer.drNo || 'N/A',
          poNo: customer.poNo || 'N/A',
          terms: customer.terms || 'N/A',
          salesman: customer.salesman || 'N/A',
          email: customer.email || 'N/A',
          products,
        };
      });
  
      console.log("Fetched and Merged Orders with Stocks:", allOrders);
      setOrderHistory(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      setOrderHistory([]);
    }
  }, [user]);
  


  // ** Fetch Orders From Database ** 
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  // ** Apply Filters Whenever searchTerm, filterStatus, or orderHistory changes **
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);


  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Close Dropdown if clicking outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
  
      // Close Modal if clicking outside the modal content
      if (
        showOrderDetailsModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        closeOrderDetailsModal();
      }
    };
  
    document.addEventListener('mousedown', handleOutsideClick);
  
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showOrderDetailsModal]);
  
  
  

  // ** Update Payment Status **
  const updatePaymentStatus = async (orderId, newStatus) => {
    const orderRef = ref(database, `orders/${user.uid}/${orderId}`);
  
    try {
      await update(orderRef, { paymentStatus: newStatus });
      console.log(`Order ${orderId} payment status updated to ${newStatus}`);
  
      // Close the dropdown after clicking an action
      setActiveDropdown(null);
  
      // Refresh the order list
      fetchOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };
  

  // ** Delete an Order **
  const deleteOrder = async (orderId) => {
    const orderRef = ref(database, `orders/${user.uid}/${orderId}`);

    try {
      await remove(orderRef);
      console.log(`Order ${orderId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  // ** Open Delete Modal **
  const openDeleteModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
    setActiveDropdown(false)
  };

  // ** Confirm Deletion **
  const confirmDelete = () => {
    if (selectedOrderId) {
      deleteOrder(selectedOrderId);
      setShowDeleteModal(false);
      setSelectedOrderId(null);
    }
  };

  // ** Close Delete Modal **
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedOrderId(null);
  };

  // ** Handle Search Input Change **
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // ** Handle Filter Status Change **
  const handleFilterChange = (status) => {
    setActiveTab(status);
  };

  // ** Toggle Dropdown Menu **
  const toggleDropdown = (orderId, event) => {
    if (event) {
      event.stopPropagation(); 
    }
    setActiveDropdown((prev) => (prev === orderId ? null : orderId));
  };
  
  

  return (
    <div className="orders-section">
      {!showNewOrderForm ? (
        <>
          <div className="page-header">
            <h3>Order List</h3>
            <div className="order-controls">
              <input
                type="text"
                placeholder="Search"
                className="order-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="new-order-button" onClick={openNewOrderForm}>
                + Create Order
              </button>
            </div>
          </div>
            
          <div className="customer-order-link-container">
            <button className="btn btn-primary customer-order-link-btn" onClick={openCustomerOrderLinkModal}>
              <FaLink /> Customer Order Link
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {["All", "Pending", "Paid", "Unpaid", "Cancelled", "Request Orders"].map(
              (status) => (
                <button
                  key={status}
                  className={`filter-tab ${
                    activeTab === status ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange(status)}
                >
                  {status}
                </button>
              )
            )}
          </div>


          

          <div className="order-history-container">
          {activeTab === "Request Orders" ? (
          <RequestOrder userId={user?.uid} /> ):
            filteredOrders.length > 0 ? (
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                     <tr key={order.id} onClick={() => openOrderDetailsModal(order)} style={{ cursor: "pointer" }}>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{order.customerName || "N/A"}</td>
                      <td>{order.customerAddress || "N/A"}</td>
                      <td>₱{order.totalAmount?.toFixed(2) || "0.00"}</td>
                      <td className={`status ${order.paymentStatus?.toLowerCase()}`}>
                        {order.paymentStatus || "Pending"}
                      </td>
                      <td>
                      <div className="actions-container">
                          <button
                            className="action-button"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              toggleDropdown(order.id, e);
                            }}
                          >
                            <FaEllipsisV />
                          </button>
                          {activeDropdown === order.id && (
                            <div className="order-dropdown-menu" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                              <button
                                className="btn-paid"
                                onClick={() => updatePaymentStatus(order.id, "Paid")}
                              >
                                <FaCheck /> Paid
                              </button>
                              <button
                                className="btn-unpaid"
                                onClick={() => updatePaymentStatus(order.id, "Unpaid")}
                              >
                                <FaTimes /> Unpaid
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={() => updatePaymentStatus(order.id, "Cancelled")}
                              >
                                <FaBan /> Cancel
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => openDeleteModal(order.id)}
                              >
                                <FaTrashAlt /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-order-history">No order history available.</div>
            )}
          </div>
        </>
      ) : (
        <NewOrderForm onBackToOrders={handleOrderCreated} />
      )}

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this order?</p>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={confirmDelete}>
                Yes
              </button>
              <button className="btn-order-cancel" onClick={closeDeleteModal}>
                No
              </button>
            </div>
          </div>
        </div>      
      )}


       {/* Order Details Modal */}
       {showOrderDetailsModal && (
          <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
              <OrderDetailsModal
                order={selectedOrder}
                onClose={closeOrderDetailsModal}
              />
            </div>
          </div>
        )}

    <CustomerOrderLinkModal 
      show={showCustomerOrderLinkModal} 
      onClose={closeCustomerOrderLinkModal} 
    />


    </div>
  );
};

export default Orders;