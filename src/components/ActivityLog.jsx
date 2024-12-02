import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { database } from '../FirebaseConfig';
import { ref, onValue } from 'firebase/database';
import './ActivityLog.css';

const ActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const logsRef = ref(database, 'activityLogs/');
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setActivityLogs(logsArray);
      } else {
        setActivityLogs([]); // Handle the case where there's no data
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Helper function to format the user
  const formatUser = (user) => {
    if (!user) return 'Unknown User';
    const [firstName] = user.name.split(' '); // Extract first name
    return firstName; // Return only the first name
  };

  return (
    <Card className="activity-log-container">
      <Card.Header className="activity-log-header">
        <h4>User Activity Log</h4>
      </Card.Header>
      <Card.Body className="table-container">
        <Table className="activity-log-table">
          <thead>
            <tr>
              <th>Time Stamp</th>
              <th>User</th>
              <th>Role</th> {/* Add Role Column */}
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.length > 0 ? (
              activityLogs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>{log.timestamp}</td>
                  <td>{formatUser(log.user)}</td>
                  <td>{log.user?.role || 'Unknown Role'}</td> {/* Display Role */}
                  <td>{log.action}</td>
                  <td>{log.details}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No activity logs available.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ActivityLog;
