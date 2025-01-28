import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchStocks } from "../services/stockServices";
import "./NearlyExpiredProducts.css";

const NearlyExpiredProducts = () => {
  const [nearlyExpiredItems, setNearlyExpiredItems] = useState([]);
  const location = useLocation();
  const { category = "" } = location.state || {}; // Default to an empty string if category is undefined

  useEffect(() => {
    const fetchAndFilterStocks = () => {
      fetchStocks((allStocks) => {
        if (!Array.isArray(allStocks) || allStocks.length === 0) {
          console.warn("No stocks data found.");
          setNearlyExpiredItems([]); // Clear state if no data found
          return;
        }

        // Filter stocks based on category and expiry date
        const filteredItems = allStocks.filter((item) => {
          if (!item.expiryDate || !item.category) return false; // Skip invalid items

          const itemCategory = item.category.toLowerCase ? item.category.toLowerCase() : "";
          const activeCategory = category.toLowerCase ? category.toLowerCase() : "";

          if (itemCategory !== activeCategory) return false; // Match category

          const expiryDate = new Date(item.expiryDate);
          const currentDate = new Date();
          const timeDifference = expiryDate.getTime() - currentDate.getTime();
          return timeDifference <= 6 * 30 * 24 * 60 * 60 * 1000; // Items expiring within 6 months
        });

        setNearlyExpiredItems(filteredItems); // Update state with filtered items
      });
    };

    fetchAndFilterStocks();
  }, [category]); // Re-run the filtering whenever the category changes

  return (
    <div className="nearly-expired-container">
      <h2 className="nearly-expired-title">Nearly Expired Products in {category}</h2>
      <table className="nearly-expired-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Stock</th>
            <th>Packaging</th>
            <th>Item Name</th>
            <th>Description</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {nearlyExpiredItems.length > 0 ? (
            nearlyExpiredItems.map((item) => (
              <tr key={item.id}>
                <td className="image-column">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="product-image" />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td>{`${item.quantity} ${item.quantityUnit || ""}`}</td>
                <td>{item.packaging || "N/A"}</td>
                <td>{item.name}</td>
                <td>{item.description || "No description available"}</td>
                <td>{item.expiryDate || "No expiry date"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No nearly expired products in {category}.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NearlyExpiredProducts;
