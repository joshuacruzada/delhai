import React, { useState, useEffect } from 'react';
import './Inventory.css';
import { database } from '../FirebaseConfig'; // Adjust the import path based on your folder structure
import { ref, onValue } from 'firebase/database';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    const inventoryRef = ref(database, 'stocks/');
    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Map through the data and format it for display
        const items = Object.keys(data).map(key => ({
          date: data[key].date,
          name: data[key].name,
          category: data[key].category,
        }));
        setInventoryItems(items);
      }
    });
  }, []);

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>Inventory</h2>
        <div className="inventory-controls">
          <input type="text" placeholder="Search" className="inventory-search" />
          <select className="category-inventory">
            <option value="">Category</option>
            <option value="Electrical">Electrical</option>
            <option value="Civil">Civil</option>
            <option value="Production">Production</option>
            <option value="HVAC">HVAC</option>
          </select>
        </div>
      </div>
      
      {/* Inventory Container */}
      <div className="inventory-container">
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item Name</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item, index) => (
                  <tr key={index}>
                    <td className="inventory-date">{item.date}</td>
                    <td className="inventory-itemname">{item.name}</td>
                    <td className="inventory-category">{item.category}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );  
};

export default Inventory;
