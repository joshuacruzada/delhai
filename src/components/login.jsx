import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; // Add custom styles if needed

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted', formData);
  };

  return (
    <div className="login-page-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg login-card">
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              value={formData.email}
              onChange={changeHandler}
              required
            />
          </div>

          {/* Password input */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={changeHandler}
              required
            />
          </div>

          {/* Remember me checkbox */}
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={changeHandler}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          {/* Login button */}
          <button type="submit" className="btn btn-primary btn-block w-100">Login</button>

          {/* Register link */}
          <div className="text-center mt-3">
            <p>Not a member? <a href="/signup-page">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;