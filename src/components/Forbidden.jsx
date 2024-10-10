import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const Forbidden = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h1 className="display-3">403 - Forbidden</h1>
        <p className="lead">You do not have permission to view this page.</p>
      </div>
    </div>
  );
};

export default Forbidden;
