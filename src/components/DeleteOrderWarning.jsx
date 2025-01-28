import React, { useState } from "react";
import { getDatabase, ref, remove } from "firebase/database";
import { getAuth } from "firebase/auth"; // Use the same CSS file for consistency

const DeleteOrderWarning = ({ orderId, onClose }) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = () => {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to delete an order.");
      return;
    }

    const orderRef = ref(db, `orders/${user.uid}/${orderId}`);

    remove(orderRef)
      .then(() => {
        setIsDeleted(true); // Show success confirmation
        setTimeout(() => {
          onClose(); // Close the modal after a short delay
        }, 2000); // Delay to allow the animation to play
      })
      .catch((error) => {
        console.error("Error deleting order:", error);
      });
  };

  return (
    <div className="delete-warning-modal">
      {isDeleted ? (
        <div className="success-modal">
          <div className="success-modal-content">
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-check"
                fill="none"
                d="M16 26 l8 8 l16 -16"
              />
            </svg>
            <p>Order deleted successfully!</p>
          </div>
        </div>
      ) : (
        <div className="delete-warning-modal-content">
          <h3>Are you sure you want to delete this order?</h3>
          <p>This action cannot be undone.</p>
          <button onClick={handleDelete} className="btn-confirm">
            Delete
          </button>
          <button onClick={onClose} className="btn-order-cancel">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteOrderWarning;
