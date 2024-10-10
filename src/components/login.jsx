import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from '../FirebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // Use this hook for navigation

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Fetch user data from Realtime Database
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('authToken', user.accessToken);
        localStorage.setItem('userRole', userData.role); // Save user role (admin/employee)

        alert(`Logged in successfully as ${userData.role}`);
        onLogin(userData.role); // Trigger login callback

        // Redirect to the dashboard
        navigate('/'); // This will redirect to the dashboard
      } else {
        alert("User data not found");
      }
    } catch (error) {
      alert('Error logging in: ' + error.message);
    }
  };

  return (
    <div className="login-page-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg login-card">
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn btn-primary btn-block w-100">Login</button>

          <div className="text-center mt-3">
            <p>Not a member? <a href="/signup-page">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
