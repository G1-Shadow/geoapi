import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false, text = 'Loading...' }) => {
  const spinnerClass = `loading-spinner ${size} ${fullScreen ? 'full-screen' : ''}`;
  
  return (
    <div className={spinnerClass}>
      <div className="spinner-container">
        <div className="spinner"></div>
        {text && <div className="spinner-text">{text}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner; 