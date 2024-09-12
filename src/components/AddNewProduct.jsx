import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../FirebaseConfig'; // Import Firebase storage
import './AddNewProduct.css';

const AddNewProduct = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    packaging: '',
    pricePerTest: '',
    pricePerBox: '',
    measurementUnit: '',
    measurementValue: '',
    quantity: '',
    quantityUnit: '',
    vendor: '',
    batchNumber: '',
    imageUrl: '', // For storing the image URL after upload
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = () => {
    if (!imageFile) {
      setErrorMessage('Please select an image first');
      return;
    }

    const storageRef = ref(storage, `product-images/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Image upload error:', error);
        setErrorMessage('Failed to upload image');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setNewProduct((prevProduct) => ({
            ...prevProduct,
            imageUrl: downloadURL, // Save the image URL after upload
          }));
          setErrorMessage('');
        });
      }
    );
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.imageUrl) {
      setErrorMessage('Please fill all required fields and upload an image.');
      return;
    }

    console.log(newProduct);
    // Logic to add the product goes here (send data to the database)
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h2>Add New Medical Product</h2>

        <label>Product Name:</label>
        <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} />

        <label>Category:</label>
        <select name="category" value={newProduct.category} onChange={handleInputChange}>
          <option value="">Select Category</option>
          <option value="Surgical">Surgical</option>
          <option value="Pharmaceutical">Pharmaceutical</option>
          <option value="Laboratory">Laboratory</option>
          <option value="Diagnostic">Diagnostic</option>
          <option value="Medical Supplies">Medical Supplies</option>
        </select>

        <label>Packaging:</label>
        <input type="text" name="packaging" value={newProduct.packaging} onChange={handleInputChange} />

        <label>Price Per Test:</label>
        <input type="text" name="pricePerTest" value={newProduct.pricePerTest} onChange={handleInputChange} />

        <label>Price Per Box:</label>
        <input type="text" name="pricePerBox" value={newProduct.pricePerBox} onChange={handleInputChange} />

        <label>Measurement Unit:</label>
        <input type="text" name="measurementUnit" value={newProduct.measurementUnit} onChange={handleInputChange} />

        <label>Measurement Value:</label>
        <input type="text" name="measurementValue" value={newProduct.measurementValue} onChange={handleInputChange} />

        <label>Quantity:</label>
        <input type="text" name="quantity" value={newProduct.quantity} onChange={handleInputChange} />

        <label>Quantity Unit:</label>
        <input type="text" name="quantityUnit" value={newProduct.quantityUnit} onChange={handleInputChange} />

        <label>Vendor:</label>
        <input type="text" name="vendor" value={newProduct.vendor} onChange={handleInputChange} />

        <label>Batch Number:</label>
        <input type="text" name="batchNumber" value={newProduct.batchNumber} onChange={handleInputChange} />

        <label>Product Image:</label>
        <input type="file" onChange={handleImageChange} />
        <button onClick={handleImageUpload}>Upload Image</button>
        {uploadProgress > 0 && <progress value={uploadProgress} max="100">{uploadProgress}%</progress>}
        {newProduct.imageUrl && <img src={newProduct.imageUrl} alt="Product Preview" width="150" />}

        <button onClick={handleAddProduct}>Add Product</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default AddNewProduct;
