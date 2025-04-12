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
    
        const filteredItems = [];
    
        allStocks.forEach((item) => {
          if (!item.stockHistory) return; // Skip items without stockHistory
    
          const nearlyExpiredBatches = Object.values(item.stockHistory).filter((batch) => {
            if (!batch.expiryDate) return false;
    
            const expiryDate = new Date(batch.expiryDate);
            const currentDate = new Date();
            const timeDifference = expiryDate.getTime() - currentDate.getTime();
    
            return timeDifference <= 30 * 24 * 60 * 60 * 1000; // Expiring within 1 month
          });
    
          if (nearlyExpiredBatches.length > 0) {
            // Add item with nearly expired batches to the list
            filteredItems.push({
              ...item,
              nearlyExpiredBatches, // Attach the nearly expired batches
            });
          }
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
            <th>Batch ID</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {nearlyExpiredItems.length > 0 ? (
            nearlyExpiredItems.map((item) =>
              item.nearlyExpiredBatches.map((batch, index) => (
                <tr key={`${item.id}-${batch.batchId}-${index}`}>
                  <td className="image-column">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="product-image" />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{`${batch.quantityAdded} ${item.quantityUnit || ""}`}</td>
                  <td>{item.packaging || "N/A"}</td>
                  <td>{item.name}</td>
                  <td>{item.description || "No description available"}</td>
                  <td>{batch.batchId}</td>
                  <td>{batch.expiryDate}</td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="7">No nearly expired products in {category}.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NearlyExpiredProducts;
