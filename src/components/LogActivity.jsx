import { database } from '../FirebaseConfig'; // Adjust the path to your FirebaseConfig
import { ref, push } from 'firebase/database';

export const logActivity = (user, action, details) => {
    const logsRef = ref(database, 'activityLogs/');
    const timestamp = new Date().toISOString(); // Current time in ISO format
  
    push(logsRef, {
      timestamp,
      user: {
        name: user.name, // Ensure you are passing the user's name
        role: user.role, // Ensure the user's role (Admin or Employee) is included
      },
      action,
      details,
    });
  };
