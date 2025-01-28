import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { IconEdit } from '@tabler/icons-react'; // Import Tabler Icon
import './TargetAndSummary.css';

const TargetAndSummary = () => {
  const [salesData, setSalesData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [userSales, setUserSales] = useState([]);
  const [target, setTarget] = useState(1000000); // Editable Target Sales
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const salesRef = ref(database, 'sales');
    const usersRef = ref(database, 'users');

    // Fetch sales data
    onValue(salesRef, (snapshot) => {
      if (snapshot.exists()) {
        const sales = snapshot.val();
        setSalesData(sales);
      }
    });

    // Fetch user data
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        setUserData(users);
      }
    });
  }, []);

  useEffect(() => {
    if (salesData && userData) {
      const userSalesSummary = Object.entries(userData).map(([userId, user]) => {
        const userSales = salesData[userId];
        const totalSales = userSales
          ? Object.values(userSales).reduce((acc, sale) => acc + (sale.totalAmount || 0), 0)
          : 0;

        return {
          userId,
          name: user.name || 'Unnamed User',
          totalSales,
        };
      });

      setUserSales(userSalesSummary);
    }
  }, [salesData, userData]);

  const handleEditTarget = () => {
    setIsEditing(true);
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();
    const newTarget = e.target.targetValue.value;
    if (!isNaN(newTarget) && newTarget > 0) {
      setTarget(parseInt(newTarget, 10));
    }
    setIsEditing(false);
  };

  return (
    <div className="target-summary">
      <div className="target-sales">
        <div className="circle">
          <p className="circle__title">Target Sales</p>
          {!isEditing ? (
            <div className="circle__value-container">
              <h2 className="circle__value">{target.toLocaleString()}</h2>
              <IconEdit
                stroke={2}
                className="edit-icon"
                onClick={handleEditTarget}
                title="Edit Target Sales"
              />
            </div>
          ) : (
            <form onSubmit={handleSaveTarget}>
              <input
                type="number"
                name="targetValue"
                defaultValue={target}
                className="edit-input"
                min="0"
              />
              <button type="submit" className="save-button">
                Save
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="sales-summary">
        {userSales.map((user, index) => {
          const percentage = ((user.totalSales / target) * 100).toFixed(1);
          return (
            <div key={index} className="summary-item">
              <div className="percentage-circle">{percentage || '0'}%</div>
              <div className="summary-details">
                <p className="summary-details__name">
                  <strong>{user.name}</strong>
                </p>
                <p className="summary-details__text">
                  Total Sales: ₱{user.totalSales.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetAndSummary;
