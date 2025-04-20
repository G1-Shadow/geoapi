import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'https://netintel-app.onrender.com/';
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="login-trigger" onClick={togglePopup}>
        Login
      </button>

      {isOpen && (
        <div className="login-overlay" onClick={togglePopup}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <div className="login-header">
              <h2>Welcome Back</h2>
              <button className="close-button" onClick={togglePopup}>×</button>
            </div>
            <div className="login-content">
              <p className="login-subtitle">Sign in to continue to your account</p>
              <button className="google-login-button" onClick={handleGoogleLogin}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login; 