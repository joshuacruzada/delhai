import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../FirebaseConfig'; // Adjust path as needed
import { fetchUserProfile } from '../services/UserProfile'; // Import fetchUserProfile
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './AuditTrail.css';

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [userCache, setUserCache] = useState({}); // Cache for resolved user profiles
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchAuditLogs = async () => {
      const resolveUserNames = async (logs) => {
        const cache = { ...userCache }; // Copy the cache

        const resolvedLogs = await Promise.all(
          logs.map(async (log) => {
            if (!cache[log.userId] && log.userId) {
              // If user is not cached, fetch profile
              const userProfile = await fetchUserProfile(log.userId);
              cache[log.userId] = userProfile.name; // Cache the user name
            }

            return {
              ...log,
              userName: cache[log.userId] || log.userName || 'Unknown User', // Use cache or fallback
            };
          })
        );

        setUserCache(cache); // Update cache state
        return resolvedLogs;
      };

      const auditRef = ref(database, 'auditTrail/');
      onValue(auditRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logs = Object.values(data);
          const updatedLogs = await resolveUserNames(logs); // Resolve user names
          setAuditLogs(updatedLogs);
        } else {
          setAuditLogs([]); // No logs available
        }
      });
    };

    fetchAuditLogs();
  }, [userCache]);

  const filteredLogs = auditLogs.filter((log) => {
    const withinDateRange =
      (!dateRange.start || new Date(log.timestamp) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(log.timestamp) <= new Date(dateRange.end));
    const matchesUser = !filterUser || log.userName.toLowerCase().includes(filterUser.toLowerCase());
    const matchesAction = !filterAction || log.action.toLowerCase().includes(filterAction.toLowerCase());
    return withinDateRange && matchesUser && matchesAction;
  });

  return (
    <div className="audit-trail-container">
      <div className="header">
        <button onClick={() => navigate('/settings')} className="back-button">←</button>
        <h2>Audit Trail</h2>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by user"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by action"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        />
        <div className="date-filters">
          <div className="date-filter">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="date-filter">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>
      <table className="audit-trail-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>User</th>
            <th>Action</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.userId}</td>
                <td>{log.userName}</td>
                <td>{log.action}</td>
                <td>{log.timestamp !== 'No Timestamp' ? new Date(log.timestamp).toLocaleString() : 'No Timestamp'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No logs available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTrail;
