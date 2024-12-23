import { database } from "../FirebaseConfig"; // Import Firebase database instance
import { ref, get, remove } from "firebase/database";

export const cleanUpDuplicates = async (userId) => {
  const customersRef = ref(database, `customers/${userId}`);
  const snapshot = await get(customersRef);

  if (snapshot.exists()) {
    const customers = snapshot.val();
    const uniqueCustomers = {};
    Object.keys(customers).forEach((key) => {
      const customer = customers[key];
      if (!uniqueCustomers[customer.name]) {
        uniqueCustomers[customer.name] = key;
      } else {
        const duplicateRef = ref(database, `customers/${userId}/${key}`);
        remove(duplicateRef);
        console.log(`Removed duplicate customer: ${customer.name}`);
      }
    });
  }
};
