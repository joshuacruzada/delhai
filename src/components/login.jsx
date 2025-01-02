import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, push } from "firebase/database";
import { auth, database } from '../FirebaseConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; 

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({ identifier: '', password: '', general: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: '', general: '' }); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ identifier: '', password: '', general: '' });
    setSuccessMessage('');
  
    if (!formData.identifier) {
      setErrors((prev) => ({ ...prev, identifier: 'Please enter your username or email.' }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: 'Please enter your password.' }));
      return;
    }
  
    try {
      let emailToUse = formData.identifier;
  
      // Step 1: Check if identifier is an email
      if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
        console.log('🔍 Looking up username in /usernames');
        const usernameRef = ref(database, `usernames/${formData.identifier}`);
        const usernameSnapshot = await get(usernameRef);
      
        if (usernameSnapshot.exists()) {
          let uid = usernameSnapshot.val();
          console.log('✅ UID found for username:', uid);
      
          // Handle case where the usernameSnapshot returns an object
          if (typeof uid === 'object' && uid.uid) {
            uid = uid.uid; // Extract uid from the object
          }
      
          if (typeof uid === 'string') {
            // Fetch email from user node
            const userRef = ref(database, `users/${uid}`);
            const userSnapshot = await get(userRef);
      
            if (userSnapshot.exists()) {
              emailToUse = userSnapshot.val().email;
              console.log('✅ Email found for UID:', emailToUse);
            } else {
              setErrors((prev) => ({ ...prev, identifier: '❌ User data not found for this username.' }));
              return;
            }
          } else {
            setErrors((prev) => ({ ...prev, identifier: '❌ Invalid UID format.' }));
            return;
          }
        } else {
          setErrors((prev) => ({ ...prev, identifier: '❌ Username not found in the database.' }));
          return;
        }
      }
      
  
      // Step 2: Authenticate User
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, formData.password);
      const user = userCredential.user;
  
      console.log('✅ Authenticated User:', user.uid);
  
      // Step 3: Fetch User Details
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
  
      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('authToken', user.accessToken);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userName', userData.name);
  
        // Log the login action
        const auditLogEntry = {
          userId: user.uid,
          userName: userData.name,
          action: "User Logged In",
          timestamp: new Date().toISOString(),
        };
        const auditRef = ref(database, 'auditTrail/');
        await push(auditRef, auditLogEntry);
  
        setSuccessMessage(`✅ Logged in successfully as ${userData.role}`);
        setTimeout(() => {
          onLogin(userData.role);
          navigate('/');
        }, 2000);
      } else {
        setErrors((prev) => ({ ...prev, general: '❌ User data not found.' }));
      }
    } catch (error) {
      console.error('❌ Login Error:', error.code, error.message);
      if (error.code === 'auth/wrong-password') {
        setErrors((prev) => ({ ...prev, password: '❌ Invalid password. Please try again.' }));
      } else if (error.code === 'auth/user-not-found') {
        setErrors((prev) => ({ ...prev, identifier: '❌ No user found with this email or username.' }));
      } else if (error.code === 'auth/invalid-email') {
        setErrors((prev) => ({ ...prev, identifier: '❌ Invalid email format.' }));
      } else {
        setErrors((prev) => ({ ...prev, general: '❌ Error logging in. Please try again later.' }));
      }
    }
  };
  
  return (
    <div className="login-page-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg login-card text-center">
        <div className="logo-container">
          <img src="/delhailogo.ico" alt="Delhai Logo" className="logo-img" />
          <div className="logo-text">
            <h3>DELHAI</h3>
            <p>Medical Enterprise System</p>
          </div>
        </div>

        <h3 className="login-text text-center mb-4">Login</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-outline mb-4">
            <input
              type="text"
              id="identifier"
              name="identifier"
              className={`login-form-control ${errors.identifier ? 'is-invalid' : ''}`}
              placeholder="Enter username or email"
              value={formData.identifier}
              onChange={changeHandler}
              required
            />
            {errors.identifier && <div className="invalid-feedback">{errors.identifier}</div>}
          </div>

          <div className="form-outline mb-2">
            <input
              type="password"
              id="password"
              name="password"
              className={`login-form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter password"
              value={formData.password}
              onChange={changeHandler}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          {errors.general && <div className="alert alert-danger mt-3">{errors.general}</div>}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

          <div className="forgot-password-container text-end mb-4">
            <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-btn signup-btn-block">Login</button>

          <div className="text-center mt-3 register-btn">
            <p>Not a member? <a href="/signup-page">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
