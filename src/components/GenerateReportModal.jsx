import React, { useState } from 'react';
import './GenerateReportModal.css';

const GenerateReportModal = ({ show, onClose, onGenerate }) => {
  const [reportConfig, setReportConfig] = useState({
    reportType: 'sales',
    dateRange: { start: '', end: '' },
    fileType: 'pdf',
    defaultOption: 'custom',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!show) return null;

  const handleDefaultOptionChange = (option) => {
    const today = new Date();
    let start = '';
    let end = '';

    if (option === 'today') {
      start = end = today.toISOString().split('T')[0];
    } else if (option === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (option === 'thisYear') {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
    }

    setReportConfig((prev) => ({
      ...prev,
      defaultOption: option,
      dateRange: { start, end },
    }));
  };

  
  const handleGenerate = () => {
    console.log("Report Config:", reportConfig);
    const { dateRange } = reportConfig;
  
    if (!dateRange.start || !dateRange.end) {
      alert('Please select a valid date range.');
      return;
    }
  
    if (new Date(dateRange.start) > new Date(dateRange.end)) {
      alert('Start date cannot be after the end date.');
      return;
    }
  
    setIsLoading(true);
    onGenerate(reportConfig); // Pass configuration to parent
    setIsLoading(false);
    onClose();
  };
  

  return (
    <div className="report-modal">
      <div className="report-modal-content">
        <h3>Generate Report</h3>
        <div className="report-modal-inputs">
          <div className="report-modal-field">
            <label>Report Type</label>
            <select
              value={reportConfig.reportType}
              onChange={(e) =>
                setReportConfig((prev) => ({ ...prev, reportType: e.target.value }))
              }
            >
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>

          <div className="report-modal-field">
            <label>Date Option</label>
            <select
              value={reportConfig.defaultOption}
              onChange={(e) => handleDefaultOptionChange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {reportConfig.defaultOption === 'custom' && (
            <div className="report-modal-field">
              <label>Custom Date Range</label>
              <div className="report-date-range">
                <input
                  type="date"
                  value={reportConfig.dateRange.start}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value },
                    }))
                  }
                />
                <input
                  type="date"
                  value={reportConfig.dateRange.end}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}

          <div className="report-modal-field">
            <label>File Type</label>
            <select
              value={reportConfig.fileType}
              onChange={(e) =>
                setReportConfig((prev) => ({ ...prev, fileType: e.target.value }))
              }
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="xls">XLS</option>
            </select>
          </div>
        </div>

        <div className="report-modal-actions">
          <button className="report-btn-confirm" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          <button className="report-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;
