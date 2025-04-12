import { database } from '../FirebaseConfig'; // Adjust the path to your FirebaseConfig
import { ref, push } from 'firebase/database';

export const logActivity = (user, action, details) => {
  const logsRef = ref(database, 'activityLogs/');
  
  // Generate a timestamp in your local timezone
  const localTimestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila', // Replace 'your-timezone' with your timezone, e.g., 'Asia/Manila'
  });

  push(logsRef, {
    timestamp: localTimestamp,
    user: {
      name: user.name, // Ensure you are passing the user's name
      role: user.role, // Ensure the user's role (Admin or Employee) is included
    },
    action,
    details,
  });
};
