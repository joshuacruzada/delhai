// src/components/ExportModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

const ExportModal = ({ show, handleClose, weeklyData, monthlyData, stockAgingData }) => {
  const [fileName, setFileName] = useState('Stock_Report');
  const [fileType, setFileType] = useState('xlsx');
  const [category, setCategory] = useState('all');

  const handleExport = () => {
    let dataToExport = [];

    if (category === 'all' || category === 'weekly') {
      const data = weeklyData.datasets[0].data.map((value, index) => ({
        Day: weeklyData.labels[index],
        StockLevel: value,
      }));
      dataToExport.push({ sheetName: 'Weekly Stock Levels', data });
    }

    if (category === 'all' || category === 'monthly') {
      const data = monthlyData.datasets[0].data.map((value, index) => ({
        Month: monthlyData.labels[index],
        StockLevel: value,
      }));
      dataToExport.push({ sheetName: 'Monthly Stock Levels', data });
    }

    const categories = ['electrical', 'civil', 'production', 'hvac'];
    categories.forEach(cat => {
      if (category === 'all' || category === cat) {
        const data = stockAgingData[cat].data.map((value, index) => ({
          AgingPeriod: stockAgingData[cat].labels[index],
          StockLevel: value,
        }));
        dataToExport.push({ sheetName: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Stock Aging`, data });
      }
    });

    if (fileType === 'xlsx') {
      exportToExcel(dataToExport, fileName);
    } else if (fileType === 'csv') {
      exportToCSV(dataToExport, fileName);
    }

    handleClose();
  };

  const exportToExcel = (dataToExport, fileName) => {
    const workbook = utils.book_new();
    dataToExport.forEach(sheet => {
      const worksheet = utils.json_to_sheet(sheet.data);
      utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const exportToCSV = (dataToExport, fileName) => {
    dataToExport.forEach(sheet => {
      const worksheet = utils.json_to_sheet(sheet.data);
      const csv = utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${fileName}_${sheet.sheetName}.csv`);
    });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="fileName">
            <Form.Label>File Name</Form.Label>
            <Form.Control
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
            />
          </Form.Group>
          <Form.Group controlId="fileType">
            <Form.Label>File Type</Form.Label>
            <Form.Control
              as="select"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All</option>
              <option value="weekly">Weekly Stock Levels</option>
              <option value="monthly">Monthly Stock Levels</option>
              <option value="electrical">Electrical Stock Aging</option>
              <option value="civil">Civil Stock Aging</option>
              <option value="production">Production Stock Aging</option>
              <option value="hvac">HVAC Stock Aging</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleExport}>
          Export
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;
