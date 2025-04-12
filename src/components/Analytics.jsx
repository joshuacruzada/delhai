import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig';
import SalesChart from './SalesChart';
import InventoryChart from './InventoryChart';
import TargetAndSummary from './TargetAndSummary';
import GenerateReportModal from './GenerateReportModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Analytics.css';

const Analytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const salesRef = ref(database, 'sales/');
    const inventoryRef = ref(database, 'stocks/');
  
    // Fetch sales data
    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      let flattenedSalesData = [];
  
      if (data) {
        // Flatten data by iterating through userId and unique salesId
        Object.values(data).forEach((userSales) => {
          flattenedSalesData = [
            ...flattenedSalesData,
            ...Object.values(userSales), // Flatten sales under each userId
          ];
        });
      }
  
      setSalesData(flattenedSalesData); // Update the state
      console.log("Flattened Sales Data:", flattenedSalesData);
    });
  
    // Fetch inventory data
    onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val();
      const flattenedInventoryData = data ? Object.values(data) : [];
      setInventoryData(flattenedInventoryData);
      console.log("Flattened Inventory Data:", flattenedInventoryData);
    });
  }, []);
  

  const handleGenerateReport = (config) => {
    const { reportType, dateRange, fileType } = config;
  
    console.log("Report Type:", reportType);
    console.log("Date Range:", dateRange);
    console.log("File Type:", fileType);
    console.log("Sales Data:", salesData);
    console.log("Inventory Data:", inventoryData);
  
    let filteredData = [];
    
    if (reportType === "sales") {
      filteredData = salesData.filter((sale) => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0]; // Extract only the date part
        const startDate = dateRange.start; // Already in YYYY-MM-DD format
        const endDate = dateRange.end; // Already in YYYY-MM-DD format
        return saleDate >= startDate && saleDate <= endDate;
      });
      }else if (reportType === "inventory") {
      filteredData = inventoryData.map((item) => ({
        name: item.name,
        packaging: item.packaging,
        price: item.pricePerBox || item.pricePerPiece || 0, // Select price based on availability
        quantity: item.quantity,
      }));
    }
  
    console.log("Filtered Data:", filteredData);
  
    if (filteredData.length === 0) {
      alert("No data available for the selected filters.");
      return;
    }
  
    generateFile(filteredData, fileType, reportType);
  };
  
const generateFile = (data, fileType, reportType) => {
  if (data.length === 0) {
    alert("No data available for the selected filters.");
    return;
  }

  if (fileType === "csv") {
    exportToCSV(data, `${reportType}-report`, reportType);
  } else if (fileType === "xls") {
    exportToXLS(data, `${reportType}-report`, reportType);
  } else if (fileType === "pdf") {
    exportToPDF(data, `${reportType}-report`, reportType);
  }
};

const exportToCSV = (data, filename, reportType) => {
  let csvContent = `\uFEFFDELHAI ${
    reportType === "sales" ? "SALES" : "INVENTORY"
  } REPORT\n\n`;

  let grandTotal = 0; // Initialize grand total for all sales

  if (reportType === "sales") {
    data.forEach((sale) => {
      csvContent += `Date:,${new Date(sale.date).toLocaleDateString()}\n`;
      csvContent += "Product Name,Packaging,Price,Quantity,Amount\n";

      sale.products.forEach((product) => {
        csvContent += `"${product.name}","${product.packaging}",${product.price.toFixed(
          2
        )},${product.quantity},${(product.price * product.quantity).toFixed(2)}\n`;
      });

      csvContent += `,,,"Total Amount",${sale.totalAmount.toFixed(2)}\n\n`;
      grandTotal += sale.totalAmount; // Add to grand total
    });

    // Add grand total at the bottom
    csvContent += `\n,,,Grand Total for All Dates,${grandTotal.toFixed(2)}\n`;
  } else if (reportType === "inventory") {
    csvContent += "Product Name,Packaging,Price,Quantity\n";

    data.forEach((item) => {
      csvContent += `"${item.name}","${item.packaging}",${item.price.toFixed(
        2
      )},${item.quantity}\n`;
    });

    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
    csvContent += `,,Total Stocks Available,${totalQuantity}\n`;
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToXLS = (data, filename, reportType) => {
  const worksheetData = [
    [`DELHAI ${reportType === "sales" ? "SALES" : "INVENTORY"} REPORT`],
    [],
  ];

  let grandTotal = 0; // Initialize grand total for all sales

  if (reportType === "sales") {
    data.forEach((sale) => {
      worksheetData.push([`Date: ${new Date(sale.date).toLocaleDateString()}`]);
      worksheetData.push(["Product Name", "Packaging", "Price", "Quantity", "Amount"]);

      sale.products.forEach((product) => {
        worksheetData.push([
          product.name,
          product.packaging,
          product.price.toFixed(2),
          product.quantity,
          (product.price * product.quantity).toFixed(2),
        ]);
      });

      worksheetData.push([
        "",
        "",
        "",
        "Total Amount",
        `${sale.totalAmount.toFixed(2)}`,
      ]);

      grandTotal += sale.totalAmount; // Add to grand total
      worksheetData.push([]); // Add a blank row for spacing
    });

    // Add grand total at the bottom
    worksheetData.push([]);
    worksheetData.push(["", "", "", "Grand Total for All Dates", `${grandTotal.toFixed(2)}`]);

  } else if (reportType === "inventory") {
    worksheetData.push(["Product Name", "Packaging", "Price", "Quantity"]);

    data.forEach((item) => {
      worksheetData.push([
        item.name,
        item.packaging,
        item.price.toFixed(2),
        item.quantity,
      ]);
    });

    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
    worksheetData.push([]);
    worksheetData.push(["", "", "Total Stocks Available", totalQuantity]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType} Report`);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};



const exportToPDF = (data, filename, reportType) => { 
  const doc = new jsPDF();

  // Set Title
  doc.setFontSize(18);
  const title = reportType === "sales" ? "DELHAI SALES REPORT" : "DELHAI INVENTORY REPORT";
  doc.text(title, 10, 10);

  let y = 20; // Initial y-coordinate for table rendering
  let grandTotal = 0; // Initialize grand total for all sales

  if (reportType === "sales") {
    data.forEach((sale) => {
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 10, y);
      y += 10;

      const headers = [["Product Name", "Packaging", "Price", "Quantity", "Amount"]];
      const rows = sale.products.map((product) => [
        product.name,
        product.packaging,
        (Number(product.price) || 0).toFixed(2), // Safely handle price
        product.quantity,
        ((Number(product.price) || 0) * product.quantity).toFixed(2), // Safely calculate amount
      ]);

      doc.autoTable({
        startY: y,
        head: headers,
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
      });

      y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      const label = "Total Amount:";
      const totalAmount = sale.totalAmount.toFixed(2);
      grandTotal += sale.totalAmount; // Add to grand total

      // Calculate the width of the label
      const labelWidth = doc.getTextWidth(label);

      doc.text(label, 10, y); // Add the label
      doc.text(totalAmount, 10 + labelWidth + 135, y);
      y += 20; // Add spacing between sales
    });

    // Add grand total at the bottom
    doc.setFontSize(14);
    const grandTotalLabel = "Total Sales:";
    const grandTotalText = `${grandTotal.toFixed(2)}`;

    // Calculate the width of the label
    const grandTotalLabelWidth = doc.getTextWidth(grandTotalLabel);

    doc.text(grandTotalLabel, 10, y);
    doc.text(grandTotalText, 10 + grandTotalLabelWidth + 135, y);
  } else if (reportType === "inventory") {
    const headers = [["Product Name", "Packaging", "Price", "Quantity"]];
    const rows = data.map((item) => [
      item.name,
      item.packaging,
      (Number(item.price) || 0).toFixed(2), // Safely handle price
      item.quantity,
    ]);

    doc.autoTable({
      startY: y,
      head: headers,
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    const label = "Total Stocks:";
    const totalStocks = data.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Calculate the width of the label
    const labelWidth = doc.getTextWidth(label);

    doc.text(label, 10, y); // Add the label
    doc.text(`${totalStocks}`, 10 + labelWidth + 130, y); 
    y += 20; 
  }

  doc.save(`${filename}.pdf`);
};


   return (
    <div className="analytics-container">
      <h2>Analytics and Reports</h2>
      <button
        className="generate-report-button"
        onClick={() => setShowReportModal(true)}
      >
        Generate Report
      </button>

      <div className="grid-container">
        <div className="inventory-section">
          <InventoryChart inventoryData={inventoryData} />
        </div>
        <div className="sales-section">
          <SalesChart salesData={salesData} />
        </div>
      </div>

      <TargetAndSummary salesData={salesData} />

      {showReportModal && (
        <GenerateReportModal
          show={showReportModal}
          onClose={() => setShowReportModal(false)}
          onGenerate={handleGenerateReport}
        />
      )}
    </div>
  );
};

export default Analytics;
