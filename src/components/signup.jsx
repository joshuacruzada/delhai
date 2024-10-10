import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, push } from "firebase/database";
import { auth, database } from '../FirebaseConfig'; // Import Firebase auth and database
import './signup.css';  // Ensure you are linking the CSS file properly

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',  // Default role
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Save additional user data in Realtime Database
      await set(ref(database, 'users/' + user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      // Create audit log entry for user creation
      const auditLogEntry = {
        userId: user.uid,
        userName: formData.name,
        action: "User Created",
        timestamp: new Date().toISOString() // Use ISO format for consistency
      };

      // Reference to your audit trail in Firebase
      const auditRef = ref(database, 'auditTrail/');
      await push(auditRef, auditLogEntry); // Use push to add a new log entry

      alert('User created successfully!');
    } catch (error) {
      alert('Error signing up: ' + error.message);
    }
  };

  return (
    <div className="signup-page-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg signup-card text-center">
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

          {/* Role Selection */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={changeHandler}
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
