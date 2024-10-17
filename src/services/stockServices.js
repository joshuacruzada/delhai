import { database } from '../FirebaseConfig'; 
import { ref, set, push, onValue, get } from 'firebase/database';

// Fetch stocks from the database
export const fetchStocks = (callback) => {
  const stocksRef = ref(database, 'stocks/');
  onValue(stocksRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const formattedData = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
        quantityUnit: data[key].quantityUnit || '', // Ensure default unit is an empty string if not specified
        measurementValue: data[key].measurementValue || '', // Ensure default value if not specified
        measurementUnit: data[key].measurementUnit || '', // Ensure default value if not specified
      }));
      callback(formattedData);
    } else {
      callback([]); // Return an empty array if no data exists
    }
  });
};

// Fetch a single product by ID
export const fetchProductById = (id, callback) => {
  const stockRef = ref(database, `stocks/${id}`);
  
  get(stockRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        console.log("No data available");
        callback(null); // Call with null if no data found
      }
    })
    .catch((error) => {
      console.error('Error fetching product:', error);
    });
};

// Add a new product to the database
export const addNewProduct = (newProduct, callback) => {
  const stocksRef = ref(database, 'stocks/');
  const newStockRef = push(stocksRef);

  const productData = {
    name: newProduct.name || 'Unnamed Product', // Handle missing names
    measurementValue: newProduct.measurementValue || '', // Default if undefined
    measurementUnit: newProduct.measurementUnit || '',
    category: newProduct.category || 'Uncategorized', // Default category
    quantity: newProduct.quantity || 0,
    quantityUnit: newProduct.quantityUnit || '',
    date: newProduct.date || '', // Default date handling
    expiryDate: newProduct.expiryDate || '',
    packaging: newProduct.packaging || 'N/A', // Handle missing packaging
    imageUrl: newProduct.imageUrl || '', // Handle missing image
  };

  set(newStockRef, productData)
    .then(() => {
      console.log('New product added successfully!');
      if (callback) callback();
    })
    .catch((error) => {
      console.error('Error adding new product:', error);
    });
};


export const updateProduct = (id, updatedProduct) => {
  const stockRef = ref(database, `stocks/${id}`);

  return set(stockRef, {
    ...updatedProduct,
    date: updatedProduct.date || new Date().toISOString(),
  });
};


// Delete a product from the database
export const deleteProduct = (id, callback) => {
  const stockRef = ref(database, `stocks/${id}`);
  
  set(stockRef, null)
    .then(() => {
      console.log(`Deleted item with id ${id}`);
      if (callback) callback();
    })
    .catch((error) => {
      console.error('Error deleting item:', error);
    });
};

// Duplicate a product in the database
export const duplicateProduct = (stock, callback) => {
  const stocksRef = ref(database, 'stocks/');
  const newStockRef = push(stocksRef);

  const newStockData = {
    name: stock.name,
    measurementValue: stock.measurementValue || '', // Ensure measurement value is duplicated
    measurementUnit: stock.measurementUnit || '', // Ensure measurement unit is duplicated
    category: stock.category,
    quantity: stock.quantity,
    quantityUnit: stock.quantityUnit || '', // Ensure unit is duplicated as well
    date: stock.date,
  };

  set(newStockRef, newStockData)
    .then(() => {
      console.log('Product duplicated successfully!');
      if (callback) callback();
    })
    .catch((error) => {
      console.error('Error duplicating product:', error);
    });
};
