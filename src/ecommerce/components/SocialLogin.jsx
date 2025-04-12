import React, { useState } from 'react';
import { auth, providerGoogle, providerFacebook } from '../../FirebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import './SocialLogin.css';
import { IconEye, IconEyeOff, IconBrandGoogleFilled, IconBrandMeta } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const SocialLogin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, emailOrPhone, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, providerGoogle);
      navigate('/');
    } catch (err) {
      setError('Google login failed');
    }
  };

  const loginWithFacebook = async () => {
    try {
      await signInWithPopup(auth, providerFacebook);
      navigate('/');
    } catch (err) {
      setError('Facebook login failed');
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>

    <div className="login-logo-wrapper">
        <img src="/bluedelhailogo.png" alt="Delhai Logo" className="login-logo-img" />
        <div className="login-logo-text">
            <h2 className="brand-name">DELHAI</h2>
            <p className="brand-subtitle">Medical Enterprise</p>
        </div>
    </div>


        <h2>Log In</h2>

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

        {error && <p className="error-msg">{error}</p>}

        <div className="forgot-password">
          <a href="''">Forgot Password</a>
        </div>

        <button className="login-btn" type="submit">LOG IN</button>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-btns">
          <button type="button" onClick={loginWithFacebook} className="fb-btn">
            <IconBrandMeta size={20} /> Facebook
          </button>
          <button type="button" onClick={loginWithGoogle} className="google-btn">
            <IconBrandGoogleFilled size={20} /> Google
          </button>
        </div>

        <p className="signup-link">
          New to Delhai? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default SocialLogin;