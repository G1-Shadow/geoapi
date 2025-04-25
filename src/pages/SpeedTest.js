import React, { useState, useEffect } from 'react';
import './SpeedTest.css';
import download from '../imgs/download.svg';
import upload from '../imgs/upload.svg';
import pingIcon from '../imgs/ping.svg';
import jitterIcon from '../imgs/jitter.svg';
import startIcon from '../imgs/starttest.svg';

const SpeedTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testHistory, setTestHistory] = useState([]);

  const startTest = () => {
    setIsTesting(true);
    setProgress(0);
    
    // Variables to store final test results
    let finalDownload = 0;
    let finalUpload = 0;

    // Simulate real-time speed test
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      if (currentProgress <= 25) {
        // Ping test
        setPing(Math.random() * 50 + 10);
        setJitter(Math.random() * 10 + 2);
      } else if (currentProgress <= 75) {
        // Download test
        const newDownload = Math.random() * 50 + 10;
        setDownloadSpeed(newDownload);
        finalDownload = newDownload; // Store the final download speed
      } else {
        // Upload test
        const newUpload = Math.random() * 20 + 5;
        setUploadSpeed(newUpload);
        finalUpload = newUpload; // Store the final upload speed
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsTesting(false);
        
        // Only add to history if we have actual test results
        if (finalDownload > 0 || finalUpload > 0) {
          const testResult = {
            date: new Date().toLocaleString(),
            download: finalDownload,
            upload: finalUpload
          };
          setTestHistory(prev => [testResult, ...prev]);
        }
      }
    }, 50);
  };

  return (
    <div className="speed-test-container">
      <div className="speed-test-content">
        <div className="speed-test-header">
          <h1>Net<span>Intel</span></h1>
          <h2>SPEED <span>TEST</span></h2>
        </div>

        <div className="speed-test-main">
          <div className="test-history-card">
            <div className="test-history-header">
              <h3>TEST <span>HISTORY</span></h3>
              <div className="history-tabs">
                <div className="tab">DATE AND TIME</div>
                <div className="tab">UPLOAD SPEED</div>
                <div className="tab">DOWNLOAD SPEED</div>
              </div>
            </div>
            <div className="history-entries">
              {testHistory.map((test, index) => (
                <div key={index} className="history-entry">
                  <div className="entry-date">{test.date}</div>
                  <div className="entry-speed">{test.upload.toFixed(2)} Mbps</div>
                  <div className="entry-speed">{test.download.toFixed(2)} Mbps</div>
                </div>
              ))}
              {testHistory.length === 0 && (
                <div className="empty-history">No test history available</div>
              )}
            </div>
          </div>

          <div className="test-area-card">
            <button 
              className={`start-test-button ${isTesting ? 'testing' : ''}`}
              onClick={startTest}
              disabled={isTesting}
            >
              START <span>TEST</span> {isTesting ? '' : <img src={startIcon} alt="start" height={40} width={40}/>}
            </button>

            <div className="speed-metrics">
              <div className="metric-item">
                <label>DOWNLOAD</label>
                <div className="metric-value">
                  <span className="value">{downloadSpeed.toFixed(3)}</span>
                  <span className="unit">Mbps</span>
                  <span className="icon"><img src={download} alt="download" /></span>
                </div>
              </div>

              <div className="metric-item">
                <label>UPLOAD</label>
                <div className="metric-value">
                  <span className="value">{uploadSpeed.toFixed(3)}</span>
                  <span className="unit">Mbps</span>
                  <span className="icon"><img src={upload} alt="upload" /></span>
                </div>
              </div>

              <div className="metric-item">
                <label>PING</label>
                <div className="metric-value">
                  <span className="value">{ping.toFixed(3)}</span>
                  <span className="unit">ms</span>
                  <span className="icon"><img src={pingIcon} alt="ping" /></span>
                </div>
              </div>

              <div className="metric-item">
                <label>JITTER</label>
                <div className="metric-value">
                  <span className="value">{jitter.toFixed(3)}</span>
                  <span className="unit">ms</span>
                  <span className="icon"><img src={jitterIcon} alt="jitter" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest; 