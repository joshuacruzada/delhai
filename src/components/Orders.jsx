import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import "./Orders.css";
import NewOrderForm from "./NewOrderForm";
import { FaCheck, FaTrashAlt, FaEllipsisV, FaLink } from "react-icons/fa";
import { database } from "../FirebaseConfig";
import { ref, get } from "firebase/database";
import { AuthContext } from "../AuthContext";
import OrderDetailsModal from './OrderDetailsModal';
import CustomerOrderLinkModal from "./CustomerOrderLinkModal";
import { IconShoppingCartQuestion } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { handlePaidOrder} from "../utils/orderActions";
import DeleteOrderWarning from "./DeleteOrderWarning";



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


  const openNewOrderForm = ({order}) => {
    navigate("/new-order-form", { state: { order } });
  }


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
  
  const navigate = useNavigate();

  const goToRequestOrders = () => {
    navigate('/request-orders');
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
  
  


  const fetchOrders = useCallback(async () => {
    try {
      const ordersRef = ref(database, `orders`);
      const customersRef = ref(database, `customers`);
      const stocksRef = ref(database, `stocks`);
  
      const [ordersSnapshot, customersSnapshot, stocksSnapshot] = await Promise.all([
        get(ordersRef),
        get(customersRef),
        get(stocksRef),
      ]);
  
      const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
      const customersData = customersSnapshot.exists() ? customersSnapshot.val() : {};
      const stocksData = stocksSnapshot.exists() ? stocksSnapshot.val() : {};
  
      // Flatten all orders under all user nodes
      const allOrders = Object.entries(ordersData).flatMap(([userId, userOrders]) =>
        Object.entries(userOrders).map(([orderId, order]) => {
          const customer = customersData[userId]?.[order.customerId] || {};
  
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
            id: orderId,
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
        })
      );
  
      console.log("All Orders Fetched:", allOrders);
      setOrderHistory(allOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error.message);
      setOrderHistory([]);
    }
  }, []);
  
  
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
    try {
      if (newStatus === "Paid") {
        await handlePaidOrder(user.uid, orderId);
      } else if (newStatus === "Cancelled")
  
      // Refresh Orders List
      fetchOrders();
      setActiveDropdown(null); 
    } catch (error) {
      console.error("❌ Error updating payment status:", error.message);
    }
  };
  

  // ** Open Delete Modal **
  const openDeleteModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
    setActiveDropdown(false)
  };


  // ** Handle Search Input Change **
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
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
            

          <div className="order-linktab-container">
            <div className="request-orders-tab" onClick={goToRequestOrders}>
              <IconShoppingCartQuestion stroke={2} color="gray" size={48} />
              <h6>Request Orders</h6>
            </div>

            <div className="customer-order-link-container">
              <button
                className="btn btn-primary customer-order-link-btn"
                onClick={openCustomerOrderLinkModal}
              >
                <FaLink /> Customer Order Link
              </button>
            </div>
          </div>
          
           {/* Filter Tabs */}
          <div className="filter-tabs">
            {["All", "Pending", "Paid"].map((status) => (
              <button
                key={status}
                className={`filter-tab ${activeTab === status ? "active" : ""}`}
                onClick={() => setActiveTab(status)}
              >
                {status}
              </button>
            ))}
          </div>


          

          <div className="order-history-container">
            {filteredOrders.length > 0 ? (
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
          <DeleteOrderWarning
            orderId={selectedOrderId} // Pass the selected order ID
            onClose={() => {
              setShowDeleteModal(false); // Close modal when action completes
              setSelectedOrderId(null); // Reset the selected order ID
            }}
          />
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