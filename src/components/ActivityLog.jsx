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
        const logsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setActivityLogs(logsArray);
      } else {
        setActivityLogs([]); // Handle the case where there's no data
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Card className="activity-log-container">
      <Card.Header className="activity-log-header">
        <h4>Activity Log</h4>
      </Card.Header>
      <Card.Body className="table-container">
        <Table className="activity-log-table">
          <thead>
            <tr>
              <th>Time Stamp</th>
              <th>Product Description</th>
              <th>Where Used</th>
              <th>Quantity Used</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.length > 0 ? (
              activityLogs.map((log, index) => (
                <tr key={log.id || index}>
                  <td>{log.timestamp}</td>
                  <td>{log.productDescription}</td>
                  <td>{log.whereUsed}</td>
                  <td>{log.quantityUsed}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No activity logs available.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ActivityLog;
