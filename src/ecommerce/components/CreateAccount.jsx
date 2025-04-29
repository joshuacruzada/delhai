import { auth, providerFacebook, providerGoogle } from '../../FirebaseConfig';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updatePassword,
  reload,
} from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEyeOff, IconBrandMeta, IconBrandGoogle } from '@tabler/icons-react';
import './CreateAccount.css';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Email input, 2: Verify email, 3: Set password
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(prev => !prev);

  const handleSendEmailVerification = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      const randomPassword = Math.random().toString(36).slice(-8); // Temporary random password
      const userCredential = await createUserWithEmailAndPassword(auth, email, randomPassword);
      await sendEmailVerification(userCredential.user);
      setEmailSent(true);
      alert('Verification email sent! Please check your inbox.');
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setError('Email already in use or failed to send verification.');
    }
  };

  const handleCheckEmailVerified = async () => {
    setError(null);
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          alert('Email verified! Now set your password.');
          setCurrentStep(3);
        } else {
          setError('Email not yet verified. Please check your inbox.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to check verification status.');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, password);
        alert('Account created successfully! Please login.');
        await auth.signOut();
        navigate('/login');
      } else {
        setError('No authenticated user found.');
      }
    } catch (err) {
      console.error(err);

      if (err.code === 'auth/requires-recent-login') {
        alert('Session expired. Please log in again.');
        await auth.signOut();
        navigate('/login');
      } else {
        setError('Failed to set password.');
      }
    }
  };

  const signUpWithFacebook = async () => {
    try {
      await signInWithPopup(auth, providerFacebook);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Facebook signup failed.');
    }
  };

  const signUpWithGoogle = async () => {
    try {
      await signInWithPopup(auth, providerGoogle);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Google signup failed.');
    }
  };

  return (
    <div className="create-account-container">
      <form className="create-account-box" onSubmit={
        currentStep === 1 ? handleSendEmailVerification :
        currentStep === 3 ? handleSetPassword :
        (e) => e.preventDefault()
      }>
        <h2>Create Account</h2>

        {/* Step 1 - Email Input */}
        {currentStep === 1 && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </>
        )}

        {/* Step 2 - Waiting for Email Verification */}
        {currentStep === 2 && emailSent && (
          <>
            <p>Please verify your email, then click below to continue.</p>
            <button type="button" className="create-account-btn" onClick={handleCheckEmailVerified}>
              I have verified my email
            </button>
          </>
        )}

        {/* Step 3 - Set Password */}
        {currentStep === 3 && (
          <>
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

            <button type="submit" className="create-account-btn">
              Set Password
            </button>
          </>
        )}

        {error && <p className="error-msg">{error}</p>}

        {/* Facebook & Google Signup */}
        {currentStep === 1 && (
          <>
            <div className="divider">
              <span>OR</span>
            </div>
            <div className="social-btns">
              <button type="button" onClick={signUpWithFacebook} className="fb-btn">
                <IconBrandMeta size={20} /> Facebook
              </button>
              <button type="button" onClick={signUpWithGoogle} className="google-btn">
                <IconBrandGoogle size={20} /> Google
              </button>
            </div>
          </>
        )}

        <p className="signup-link">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </form>
    </div>
  );
};

export default CreateAccount;
