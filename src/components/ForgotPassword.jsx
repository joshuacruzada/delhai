import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../FirebaseConfig'; // Ensure Firebase configuration is correct
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Attempt to send the password reset email
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('If the email is registered, a password reset email has been sent.');
    } catch (err) {
      // Step 2: Handle all potential errors
      console.error('Error sending password reset email:', err);

      if (err.code === 'auth/invalid-email') {
        setError('The email address format is invalid.');
      } else if (err.code === 'auth/user-not-found') {
        setError('The email address is not registered.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg forgot-password-card text-center">
        <h3 className="mb-4">Forgot Password?</h3>
        <p>Enter your email address, and we’ll send you instructions to reset your password.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-outline mb-4">
            <input
              type="email"
              name="email"
              className="forgot-password-form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="forgot-password-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {message && <p className="success-message mt-3">{message}</p>}
        {error && <p className="error-message mt-3">{error}</p>}
        <p className="mt-3"><a href="/login-page">Back to Login</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
