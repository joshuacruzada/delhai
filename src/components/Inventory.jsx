import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Inventory.css";
import { fetchStocks, deleteProduct } from "../services/stockServices";
import RestockModal from "./RestockModal"; // Import the RestockModal
import { logActivity } from "./LogActivity"; // Adjust the path if necessary
import { fetchUserProfile } from "../services/UserProfile";
import { getAuth } from "firebase/auth"; // Firebase Authentication
import { Dropdown } from "react-bootstrap";
const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [showRestockModal, setShowRestockModal] = useState(false); // State to control the modal visibility
  const [selectedProduct, setSelectedProduct] = useState(null); // State for the selected product
  const [currentUserProfile, setCurrentUserProfile] = useState(null); // User profile state
  const navigate = useNavigate();

  // Subcategories based on selected category
  const subCategoryOptions = {
    'Rapid Tests ': [
      'COVID Tests',
      'Dengue Tests',
      'HIV Tests',
      'Urine Strips',
      'RPR Tests',
      'HCV Tests', // New
      'Syphilis Tests', // New
      'Malaria Tests', // New
      'Troponin Tests', // New
      'HBsAg Tests', // New
      'HAV Tests', // New
      'Fecal Occult Blood', // New
    ],
    'X-Ray Products': [
      'Envelope',
      'Film (Fuji)',
      'Film (Pixel)',
      'Solutions',
      'Thermal Paper',
    ],
    'Laboratory Reagents ': [
      'Crescent Blood Chemistry Reagents',
      'ERBA',
    ],
    'Medical Supplies': [
      'Syringes',
      'Gloves',
      'Prepared Media Agar',
      'Cotton Products',
      'Specimen Containers',
      'Alcohol Products', // New
      'Pipette Tips', // New
      'Blood Collectors', // New
      'Glass Slides', // New
      'Micropore', // New
      'Typing Sera', // New
    ],
  };
  
  // Fetch the current user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid); // Fetch profile from database
          if (profile) {
            setCurrentUserProfile(profile); // Save user profile in state
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        console.error("No user is logged in.");
      }
    };

    fetchProfile();
  }, []);

  // Fetch products from Firebase on component mount
  useEffect(() => {
    fetchStocks(setInventoryItems); // Fetch data and update state
  }, []);

  // Navigate to edit product page
  const handleEdit = (id) => {
    const editedItem = inventoryItems.find((item) => item.id === id);
    if (editedItem && currentUserProfile) {
      // Log the Edit action
      logActivity(
        { name: currentUserProfile.name, role: currentUserProfile.role },
        "Edit",
        `Edited product: ${editedItem.name} (ID: ${id})`
      );
    }

    navigate(`/edit-product/${id}`);
  };

  // Open the restock modal for a specific product
  const handleRestock = (id) => {
    const restockedItem = inventoryItems.find((item) => item.id === id);
    if (restockedItem && currentUserProfile) {
      // Log the Restock action
      logActivity(
        { name: currentUserProfile.name, role: currentUserProfile.role },
        "Restock",
        `Restocked product: ${restockedItem.name} (ID: ${id})`
      );

      setSelectedProduct(restockedItem); // Set the selected product
      setShowRestockModal(true); // Show the restock modal
    }
  };

  // Close the restock modal
  const handleCloseRestockModal = () => {
    setShowRestockModal(false); // Hide the modal
  };

  // Delete the product
  const handleDelete = (id) => {
    const deletedItem = inventoryItems.find((item) => item.id === id);
    if (deletedItem && currentUserProfile) {
      deleteProduct(id, () => {
        fetchStocks(setInventoryItems); // Refresh inventory list

        // Log the Delete action
        logActivity(
          { name: currentUserProfile.name, role: currentUserProfile.role },
          "Delete",
          `Deleted product: ${deletedItem.name} (ID: ${id})`
        );
      });
    }
  };

  // Filter by category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("All"); // Reset subcategory filter
  };

  // Filter by subcategory
  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  // Navigate to add new product page
  const handleAddNewProduct = () => {
    if (currentUserProfile) {
      // Log the Add action
      logActivity(
        { name: currentUserProfile.name, role: currentUserProfile.role },
        "Add",
        "Added a new product"
      );
    }

    navigate("/add-product");
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <div className="inventory-actions">
          <input type="text" placeholder="Search" className="inventory-search" />
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All">Category</option>
            {Object.keys(subCategoryOptions).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {selectedCategory !== "All" && (
            <select
              className="subcategory-filter"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
            >
              <option value="All">Subcategory</option>
              {subCategoryOptions[selectedCategory]?.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
          <button className="new-product-btn" onClick={handleAddNewProduct}>
            + Add New Product
          </button>
        </div>
      </div>

      <div className="inventory-container">
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Stock</th>
                <th>Packaging</th>
                <th>Item Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {inventoryItems.length > 0 ? (
                  inventoryItems
                    .filter(
                      (item) =>
                        (selectedCategory === "All" || item.category === selectedCategory) &&
                        (selectedSubCategory === "All" || item.subCategory === selectedSubCategory)
                    )
                    .map((item) => {
                      const isLowStock =
                        item.quantity !== undefined &&
                        item.criticalStock !== undefined &&
                        item.quantity < item.criticalStock;

                      const isNearlyExpired =
                        item.expiryDate &&
                        new Date(item.expiryDate).getTime() - new Date().getTime() <=
                          7 * 24 * 60 * 60 * 1000; // Highlight if expiry date is within 7 days

                      return (
                        <tr
                          key={item.id}
                          className={`${isLowStock ? "low-stock-highlight" : ""} ${
                            isNearlyExpired ? "nearly-expired-highlight" : ""
                          }`}
                          onClick={() => navigate('/item-history', { state: { item } })}
                          style={{ cursor: "pointer" }} // Make the row look clickable
                        >
                          <td className="image-column">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="product-image"
                              />
                            ) : (
                              <span>No Image</span>
                            )}
                          </td>
                          <td className="stock">{`${item.stock} ${item.quantityUnit || ""}`}</td>
                          <td className="packaging">{item.packaging || "N/A"}</td>
                          <td className="item-name">{item.name}</td>
                          <td className="item-description">
                            {item.description || "No description available"}
                          </td>
                          <td className="category">{item.category || "Uncategorized"}</td>
                          <td className="subcategory">
                            {item.subCategory || "No Subcategory"}
                          </td>
                          <td className="actions">
                          <Dropdown
                            onClick={(e) => e.stopPropagation()} // Prevent propagation of click to the row
                          >
                            <Dropdown.Toggle
                              variant="link"
                              id="dropdown-basic"
                              className="actions-dropdown"
                            >
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                as="button"
                                className="action-btn restock-btn"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleRestock(item.id);
                                }}
                              >
                                <i className="bi bi-box-seam"></i> Restock
                              </Dropdown.Item>
                              <Dropdown.Item
                                as="button"
                                className="action-btn edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleEdit(item.id);
                                }}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </Dropdown.Item>
                              <Dropdown.Item
                                as="button"
                                className="action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  handleDelete(item.id);
                                }}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>

                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="8">No products available.</td>
                  </tr>
                )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Render RestockModal when showRestockModal is true */}
      {showRestockModal && (
        <RestockModal
          product={selectedProduct} // Pass the currently selected product
          onClose={handleCloseRestockModal} // Function to close the modal
        />
      )}
    </div>
  );
};

export default Inventory;
