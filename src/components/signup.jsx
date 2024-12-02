import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { get,ref, set } from "firebase/database";
import { auth, database } from '../FirebaseConfig';
import './signup.css';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
  
    try {
      // Check if the username already exists in the "usernames" node
      const usernameRef = ref(database, `usernames/${formData.username}`);
      const usernameSnapshot = await get(usernameRef);
  
      if (usernameSnapshot.exists()) {
        setError('Username already exists. Please choose another.');
        return;
      }
  
      // Step 1: Register the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
  
      // Step 2: Store additional user data in the Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
  
      // Step 3: Save the username as a separate reference for validation
      await set(ref(database, `usernames/${formData.username}`), {
        uid: user.uid,
      });
  
      setSuccess('Account created successfully! You can now log in.');
      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
      });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('The email address is already in use.');
      } else {
        setError('Error signing up: ' + err.message);
      }
    }
  };
  

  return (
    <div className="signup-page-wrapper d-flex justify-content-center align-items-center">
      <div className="signup-card p-5 shadow-lg text-center">
        <div className="signup-logo-container">
          <img src="/delhailogo.ico" alt="Delhai Logo" className="signup-logo-img" />
          <div className="signup-logo-text">
            <h3 className="signup-logo-title">DELHAI</h3>
            <p className="signup-logo-subtitle">Medical Enterprise System</p>
          </div>
        </div>

        <h3 className="signup-title">Sign Up</h3>

        <form onSubmit={handleSubmit}>
          <div className="signup-grid">
            <div className="signup-form-group">
              <label className="signup-form-label" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="signup-form-control"
                placeholder="Enter a unique username"
                value={formData.username}
                onChange={changeHandler}
                required
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-form-label" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="signup-form-control"
                placeholder="Enter your name"
                value={formData.name}
                onChange={changeHandler}
                required
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="signup-form-control"
                placeholder="Enter password"
                value={formData.password}
                onChange={changeHandler}
                required
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="signup-form-control"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={changeHandler}
                required
              />
            </div>

            <div className="signup-form-group full-width">
              <label className="signup-form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="signup-form-control"
                placeholder="Enter email"
                value={formData.email}
                onChange={changeHandler}
                required
              />
            </div>

            <div className="signup-form-group full-width">
              <label className="signup-form-label" htmlFor="role">Select Role</label>
              <select
                id="role"
                name="role"
                className="signup-form-control"
                value={formData.role}
                onChange={changeHandler}
                required
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {error && <div className="signup-alert error">{error}</div>}
          {success && <div className="signup-alert success">{success}</div>}

          <button type="submit" className="signup-btn">Sign Up</button>

          <div className="signup-footer text-center mt-3">
            <p>Already have an account? <a href="/login-page" className="signup-link">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
