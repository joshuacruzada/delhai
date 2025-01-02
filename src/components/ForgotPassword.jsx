import React, { useState } from 'react';
import { get, ref, query, orderByChild, equalTo } from 'firebase/database';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { auth, database } from '../FirebaseConfig';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Validate Email, 2: Reset Password, 3: Success
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);

  const navigate = useNavigate();

  /**
   * ✅ Step 1: Validate Email using Firebase Database
   */
  const handleValidateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
        setError('❌ Please enter a valid email address.');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Validating Email in Database:', trimmedEmail);

      // Check Firebase Database
      const emailQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(trimmedEmail));
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userKey = Object.keys(userData)[0];
        setUserId(userKey);

        console.log('✅ Email found in Database:', userData[userKey]);

        setMessage('✅ Email validated. You can now reset your password.');
        setShowSuccess(true);

      
        setTimeout(() => setShowSuccess(false), 3000);

        setStep(2); // Proceed to password reset
      } else {
        setError('❌ Email not found in the database.');
      }
    } catch (err) {
      console.error('❌ Error validating email:', err.message);
      setError('❌ Failed to validate email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ✅ Step 2: Reset Password
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('❌ Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('❌ Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      if (!userId) {
        setError('❌ User ID is missing. Please validate your email again.');
        setStep(1);
        return;
      }

      // Authenticate the user temporarily
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), 'Temp@12345');

      const user = auth.currentUser;
      if (!user) {
        setError('❌ Session expired. Please validate your email again.');
        setStep(1);
        return;
      }

      // Update the password
      await updatePassword(user, password);

      setMessage('✅ Your password has been successfully reset.');

      setTimeout(() => {
        navigate('/login-page');
      }, 3000);

      setStep(3); // Final step
    } catch (err) {
      console.error('❌ Error resetting password:', err.message);
      if (err.code === 'auth/requires-recent-login') {
        setError('❌ Session expired. Please validate your email again.');
        setStep(1);
      } else {
        setError('❌ Failed to reset password. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper d-flex justify-content-center align-items-center">
      <div className="card p-5 shadow-lg forgot-password-card text-center">
        <h3 className="mb-4">Forgot Password</h3>

        {/* ✅ Step 1: Validate Email */}
        {step === 1 && (
          <>
            <p>Enter your email to validate your account.</p>
            <form onSubmit={handleValidateEmail}>
              <input
                type="email"
                name="email"
                className="forgot-password-form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="forgot-password-btn" disabled={isLoading}>
                {isLoading ? 'Validating...' : 'Validate Email'}
              </button>
            </form>
          </>
        )}

        {/* ✅ Step 2: Reset Password */}
        {step === 2 && (
          <>
            <p>Set your new password.</p>
            <form onSubmit={handleResetPassword}>
              <input
                type="password"
                className="forgot-password-form-control"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="forgot-password-form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="forgot-password-btn" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* ✅ Step 3: Success */}
        {step === 3 && <p>✅ Password reset successful. Redirecting...</p>}

        {/* ✅ Error & Success Messages */}
        {error && <p className="error-message mt-3">{error}</p>}
        {showSuccess && message && <p className="success-message fade-out">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
