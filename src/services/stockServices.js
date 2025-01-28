import { database } from '../FirebaseConfig'; 
import { ref, set, push, onValue, get } from 'firebase/database';

// Fetch stocks from the database
export const fetchStocks = (callback = () => {}) => {
  const stocksRef = ref(database, 'stocks/');
  onValue(
    stocksRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        if (typeof callback === "function") {
          callback(formattedData);
        } else {
          console.warn("Callback is not a valid function:", callback);
        }
      } else {
        if (typeof callback === "function") {
          callback([]);
        } else {
          console.warn("Callback is not a valid function:", callback);
        }
      }
    },
    (error) => {
      console.error('Error fetching stocks:', error);
      if (typeof callback === "function") {
        callback([]);
      }
    }
  );
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
