import React from 'react';
import { Link } from 'react-router-dom';
import LocationSearch from '../components/LocationSearch';
import './Home.css';
import sim from '../imgs/bestsim.svg';
import netbuddy from '../imgs/netbuddy.svg';
import speedtest from '../imgs/graphspeedtest.svg';

const Home = () => {
  const handleLocationSelect = (locationData) => {
    // Handle the selected location data
    console.log('Selected location:', locationData);
    // You can navigate to the map viewer or perform other actions here
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Net<span>Intel</span></h1>
          <p>
            Short for Network Intelligence.
            Flexible for scoring, insights and analytics.
          </p>
          <div className="hero-search">
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        {/* <h2>Why Choose NetIntel</h2> */}
        <div className="features-grid">
          {/* <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h3>Real-time Location Tracking</h3>
            <p>Track locations with high accuracy and minimal battery impact.</p>
          </div> */}

          <div className="feature-card speed-test">
            <div className="feature-content">
              <h3><span className="text-white">SPEED</span> <span className="text-cyan">TEST</span></h3>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-content">
              <h3><span className="text-white">BEST</span> <span className="text-cyan">SIM PROVIDER</span></h3>
              <div className="feature-icon">
                <img src={sim} alt="Best Sim Network" />
              </div>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-content">
              <h3><span className="text-white">NET</span> <span className="text-cyan">BUDDY</span></h3>
              <div className="feature-icon">
                <img src={netbuddy} alt="Net Buddy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="cta">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of developers building the future of location services.</p>
          <Link to="/plans" className="button primary">
            View Plans
          </Link>
        </div>
      </section> */}
    </div>
  );
};

export default Home; 