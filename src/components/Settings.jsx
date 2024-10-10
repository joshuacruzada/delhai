import React from 'react';
import { Link } from 'react-router-dom';
import './Settings.css'; // Assuming you have a CSS file for settings

const Settings = () => {
  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-options">
        <Link to="/audit-trail" className="settings-link">Audit Trail</Link>
        {/* Add other settings options here */}
      </div>
    </div>
  );
};

export default Settings;
