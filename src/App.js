import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LocationTracker from './pages/LocationTracker';
import SpeedTest from './pages/SpeedTest';
import Contact from './pages/Contact';
import Home from './pages/Home';
import MapViewer from './pages/MapViewer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/location">Location Tracker</Link>
            </li>
            <li>
              <Link to="/speed-test">Speed Test</Link>
            </li>
            <li>
              <Link to="/map">Map Viewer</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li className="auth-buttons">
              <Link to="/login" className="login-button">Login</Link>
              <Link to="/signup" className="signup-button">Sign Up</Link>
            </li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<LocationTracker />} />
            <Route path="/speed-test" element={<SpeedTest />} />
            <Route path="/map" element={<MapViewer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 