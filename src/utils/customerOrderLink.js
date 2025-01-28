import { getAuth } from 'firebase/auth';

/**
 * Generates a customer-specific order form link.
 * @returns {string|null} The dynamic URL for the customer order form or null if no user is authenticated.
 */
export const getCustomerOrderFormLink = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    const userId = currentUser.uid;
    const baseUrl = window.location.origin;
    return `${baseUrl}/user/${userId}/customer-order`;
  } else {
    console.warn('No authenticated user found.');
    return null;
  }
};
