import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './signup.css'; // Use the same style or create a new one

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
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
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Add your sign-up logic here
    console.log('Form submitted', formData);
  };

  return (
    <div className="signup-page-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg signup-card">
        <h3 className="text-center mb-4">Sign Up</h3>
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              value={formData.name}
              onChange={changeHandler}
              required
            />
          </div>

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

          {/* Confirm Password input */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={changeHandler}
              required
            />
          </div>

          {/* Agree to terms */}
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={changeHandler}
              required
            />
            <label className="form-check-label" htmlFor="agreeToTerms">
              I agree to the terms and conditions
            </label>
          </div>

          {/* Sign Up button */}
          <button type="submit" className="btn btn-primary btn-block w-100">Sign Up</button>

          {/* Already have an account */}
          <div className="text-center mt-3">
            <p>Already have an account? <a href="/login-page">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;