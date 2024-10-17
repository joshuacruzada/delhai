import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, push } from "firebase/database";
import { auth, database } from '../FirebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';  // Ensure you add styles here

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    identifier: '',  // Either username or email
    password: '',
  });

  const navigate = useNavigate();  // Use this hook for navigation

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
      let emailToUse = formData.identifier;

      // Check if the input is not an email (assume it's a username)
      if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
        // Search for the username in Firebase
        const usernameRef = ref(database, 'usernames/' + formData.identifier);
        const usernameSnapshot = await get(usernameRef);

        if (usernameSnapshot.exists()) {
          const uid = usernameSnapshot.val().uid;
          const userRef = ref(database, 'users/' + uid);
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            emailToUse = userSnapshot.val().email;  // Use the email associated with the username
          } else {
            alert('User data not found');
            return;
          }
        } else {
          alert('Username not found');
          return;
        }
      }

      // Sign in with the found email or directly if the user entered an email
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, formData.password);
      const user = userCredential.user;

      // Fetch user data from Realtime Database
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('authToken', user.accessToken);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userName', userData.name);

        // Create audit log entry for successful login
        const auditLogEntry = {
          userId: user.uid,
          userName: userData.name,
          action: "User Logged In",
          timestamp: new Date().toISOString(),
        };

        // Reference to your audit trail in Firebase
        const auditRef = ref(database, 'auditTrail/');
        await push(auditRef, auditLogEntry);

        alert(`Logged in successfully as ${userData.role}`);
        onLogin(userData.role);
        navigate('/');  // Redirect to the dashboard
      } else {
        alert("User data not found");
      }
    } catch (error) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        alert('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        alert('No user found with this email or username.');
      } else {
        alert('Error logging in: ' + error.message);
      }
    }
  };

  return (
    <div className="login-page-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg login-card text-center">
        {/* Logo and subtitle */}
        <div className="logo-container mb-4">
          <img src="/delhailogo.ico" alt="Delhai Logo" className="logo-img" />
          <h3 className="mt-3">Delhai</h3>
          <p className="small">Medical Enterprise System</p>
        </div>

        <h3 className="text-center mb-4">Login</h3>

        <form onSubmit={handleSubmit}>
          {/* Identifier input (Username or Email) */}
          <div className="form-outline mb-4">
            <label className="form-label" htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              className="form-control"
              placeholder="Enter username or email"
              value={formData.identifier}
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

          <div className="text-center mt-3 register-btn">
            <p>Not a member? <a href="/signup-page">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
