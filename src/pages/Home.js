import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <main>
      <section className="home-section">
        <h1>Welcome to GeoAPI</h1>
        <p>Choose a tool from the navigation menu above:</p>
        <div className="tool-cards">
          <div className="tool-card">
            <h2>Location Tracker</h2>
            <p>Track your current location using GPS or IP address</p>
            <Link to="/location" className="tool-button">Open Location Tracker</Link>
          </div>
          <div className="tool-card">
            <h2>Speed Test</h2>
            <p>Test your internet connection speed</p>
            <Link to="/speed-test" className="tool-button">Open Speed Test</Link>
          </div>
          <div className="tool-card">
            <h2>Map Viewer</h2>
            <p>Search and view locations using Azure Maps</p>
            <Link to="/map" className="tool-button">Open Map Viewer</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home; 