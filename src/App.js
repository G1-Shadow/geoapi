import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
// import LocationTracker from './pages/LocationTracker';
import SpeedTest from './pages/SpeedTest';
import Contact from './pages/Contact';
import Home from './pages/Home';
import MapViewer from './pages/MapViewer';
import Plans from './pages/Pricing';
import Chatbot from './components/Chatbot';
import Profile from './pages/Profile';
import NextPageButton from './components/NextPageButton';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './index.css';
import arrowIcon from './imgs/arrow.svg';
import notificationIcon from './imgs/notifications.svg';

// Define page order
const pageOrder = {
  '/': '/location',
  '/location': '/speed-test',
  '/speed-test': '/map',
  '/map': '/plans',
  '/plans': '/contact',
  '/contact': '/',
};

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const nextPage = pageOrder[location.pathname];

  return (
    <>
      {children}
      {nextPage && <NextPageButton nextPage={nextPage} />}
    </>
  );
};

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleLogin = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    window.location.href = `https://netintel-app.onrender.com/auth/google?redirect_uri=${redirectUri}`;
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
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);

  // Get profile picture URL from the appropriate field
  const profilePicture = user?.imageUrl || user?.picture || user?.profilePicture;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingDown = prevScrollPos < currentScrollPos;
      
      setIsVisible(!isScrollingDown || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  return (
    <nav className={`navbar ${!isVisible ? 'hidden' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00D1FF" className="brand-icon" width="24" height="24">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
            </svg>
            <span className="brand-text">Net<span>Intel</span></span>
          </Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <img src={arrowIcon} alt="arrow" className="nav-arrow" />
          <Link to="/speed-test" className={`nav-link ${location.pathname === '/speed-test' ? 'active' : ''}`}>
            Speed Test
          </Link>
          <img src={arrowIcon} alt="arrow" className="nav-arrow" />
          <Link to="/Network-Advisor" className={`nav-link ${location.pathname === '/Network-Advisor' ? 'active' : ''}`}>
            Network Advisor
          </Link>
          <img src={arrowIcon} alt="arrow" className="nav-arrow" />
          <Link to="/plans" className={`nav-link ${location.pathname === '/plans' ? 'active' : ''}`}>
            Plans
          </Link>
          <img src={arrowIcon} alt="arrow" className="nav-arrow" />
          <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
            Contact
          </Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <div className="notification-icon">
                <img src={notificationIcon} alt="notifications" />
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                  </div>
                  <div className="notification-content">
                    <p>No new notifications</p>
                  </div>
                </div>
              </div>
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
            </>
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
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              {/* <Route path="/location" element={<PageWrapper><LocationTracker /></PageWrapper>} /> */}
              <Route path="/speed-test" element={<PageWrapper><SpeedTest /></PageWrapper>} />
              <Route path="/Network-Advisor" element={<PageWrapper><MapViewer /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/plans" element={<PageWrapper><Plans /></PageWrapper>} />
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