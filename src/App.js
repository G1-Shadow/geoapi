import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import LocationTracker from './pages/LocationTracker';
import SpeedTest from './pages/SpeedTest';
import Contact from './pages/Contact';
import Home from './pages/Home';
import MapViewer from './pages/MapViewer';
import Plans from './pages/Pricing';
import Chatbot from './components/Chatbot';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './index.css';

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleLogin = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    window.location.href = `http://localhost:8080/auth/google?redirect_uri=${redirectUri}`;
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.login-popup')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button className="auth-button login-button" onClick={togglePopup}>
        Login
      </button>

      {isOpen && (
        <div className="login-overlay">
          <div className="login-popup">
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

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      // Remove token from URL for security
      window.history.replaceState({}, document.title, '/');
      checkAuth().then(() => {
        navigate('/');
      });
    }
  }, [navigate, location, checkAuth]);

  return <div>Loading...</div>;
};

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Get profile picture URL from the appropriate field
  const profilePicture = user?.imageUrl || user?.picture || user?.profilePicture;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">GeoAPI</Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/location" className={`nav-link ${location.pathname === '/location' ? 'active' : ''}`}>
            Location Tracker
          </Link>
          <Link to="/speed-test" className={`nav-link ${location.pathname === '/speed-test' ? 'active' : ''}`}>
            Speed Test
          </Link>
          <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>
            Map Viewer
          </Link>
          <Link to="/plans" className={`nav-link ${location.pathname === '/plans' ? 'active' : ''}`}>
            Plans
          </Link>
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
            Contact
          </Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <Link to="/profile" className="user-profile-link">
              <div className="user-avatar">
                {profilePicture ? (
                  <img src={profilePicture} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="user-name">{user.name}</span>
            </Link>
          ) : (
            <LoginPopup />
          )}
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/location" element={<LocationTracker />} />
              <Route path="/speed-test" element={<SpeedTest />} />
              <Route path="/map" element={<MapViewer />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route 
                path="/*" 
                element={
                  <Navigate 
                    to={`/oauth/callback${window.location.search}`} 
                    replace 
                  />
                } 
              />
            </Routes>
          </main>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 