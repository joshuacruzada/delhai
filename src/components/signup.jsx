import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from '../FirebaseConfig';  // Import Firebase auth and database

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee', // Default role
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save additional user data in Realtime Database
      await set(ref(database, 'users/' + user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      alert('User created successfully!');
    } catch (error) {
      alert('Error signing up: ' + error.message);
    }
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
              onChange={changeHandler}  // Use changeHandler
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
              onChange={changeHandler}  // Use changeHandler
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
              onChange={changeHandler}  // Use changeHandler
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
              onChange={changeHandler}  // Use changeHandler
              required
            />
          </div>

          {/* Role Selection */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={changeHandler}  // Use changeHandler
              required
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
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
