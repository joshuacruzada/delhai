import React from 'react';
import './TargetAndSummary.css';

const TargetAndSummary = ({ salesData = [] }) => {
  // Ensure salesData is an array
  const validSalesData = Array.isArray(salesData) ? salesData : [];

  const target = 1000000; 
  const currentSales = validSalesData.reduce((acc, sale) => acc + (sale.amount || 0), 0);
  const percentage = ((currentSales / target) * 100).toFixed(1);

  return (
    <div className="target-summary">
      {/* Top Section: Target Sales */}
      <div className="target-sales">
        <div className="circle">
          <p className="circle__title">Target Sales</p>
          <h2 className="circle__value">{target.toLocaleString()}</h2>
        </div>
      </div>

      {/* Bottom Section: Sales Summary */}
      <div className="sales-summary">
        {validSalesData.slice(0, 3).map((sale, index) => (
          <div key={index} className="summary-item">
            <div className="percentage-circle">
              {percentage || '0'}%
            </div>
            <div className="summary-details">
              <p className="summary-details__name">
                <strong>{sale.name || 'Unnamed Sale'}</strong>
              </p>
              <p className="summary-details__text">Total sales Everyday</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetAndSummary;
