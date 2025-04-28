import React, { useState } from 'react';
import { auth, providerFacebook } from '../../FirebaseConfig'; // Ensure providerFacebook is configured in FirebaseConfig
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import './CreateAccount.css'; // Use a different CSS file for CreateAccount styling
import { IconEye, IconEyeOff, IconBrandMeta } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, emailOrPhone, password);
      navigate('/'); // Redirect to home page after successful sign up
    } catch (err) {
      setError('Sign up failed. Please try again.');
    }
  };

  const signUpWithFacebook = async () => {
    try {
      await signInWithPopup(auth, providerFacebook);
      navigate('/'); // Redirect after Facebook login
    } catch (err) {
      setError('Facebook login failed');
    }
  };

  return (
    <div className="create-account-container">
      <form className="create-account-box" onSubmit={handleSignUp}>
        <div className="create-account-logo-wrapper">
          <img src="/bluedelhailogo.png" alt="Delhai Logo" className="create-account-logo-img" />
          <div className="create-account-logo-text">
            <h2 className="brand-name">DELHAI</h2>
            <p className="brand-subtitle">Medical Enterprise</p>
          </div>
        </div>

        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Phone number / Email"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="eye-toggle" onClick={togglePassword}>
            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </span>
        </div>

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="create-account-btn" type="submit">SIGN UP</button>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-btns">
          <button type="button" onClick={signUpWithFacebook} className="fb-btn">
            <IconBrandMeta size={20} /> Facebook
          </button>
        </div>

        <p className="signup-link">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </form>
    </div>
  );
};

export default CreateAccount;
