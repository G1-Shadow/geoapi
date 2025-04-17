import React from 'react';
import './SubmitPopup.css';

const SubmitPopup = ({ isSuccess, message, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className={`popup-icon ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? '✓' : '✕'}
        </div>
        <div className="popup-message">
          {message}
        </div>
        <button className="popup-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SubmitPopup; 