import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';
import SalesChart from './SalesChart';
import InventoryChart from './InventoryChart';
import TargetAndSummary from './TargetAndSummary';
import './Analytics.css';

const Analytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [salesView, setSalesView] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const salesRef = ref(database, 'sales/');
    const inventoryRef = ref(database, 'inventory/');

    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      setSalesData(data ? Object.values(data) : []);
      setLoading(false);
    });

    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      setInventoryData(data ? Object.values(data) : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p>Loading Analytics Data...</p>;
  }

  return (
    <div className="analytics-container">
      <h2>Analytics and Reports</h2>
      <div className="grid-container">
        {/* Sales Section */}
        <div className="sales-section">
         
          <SalesChart salesData={salesData} view={salesView} setView={setSalesView} />
        </div>

        {/* Inventory Section */}
        <div className="inventory-section">
          
          <InventoryChart inventoryData={inventoryData} />
        </div>

        {/* Combined Target Sales & Sales Summary */}
        <div className="target-summary-section">
          <TargetAndSummary salesData={salesData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
