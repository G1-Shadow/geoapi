import React, { useState, useEffect } from 'react';
import './SpeedTest.css';

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
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(0);
    setJitter(0);

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
        setDownloadSpeed(Math.random() * 50 + 10);
      } else {
        // Upload test
        setUploadSpeed(Math.random() * 20 + 5);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsTesting(false);
        setTestHistory(prev => [
          {
            date: new Date().toLocaleString(),
            download: downloadSpeed,
            upload: uploadSpeed,
            ping: ping,
            jitter: jitter
          },
          ...prev
        ]);
      }
    }, 50);
  };

  return (
    <div className="speed-test-container">
      <div className="speed-test-header">
        <h1>Network Speed Test</h1>
        <p>Test your internet connection speed in real-time</p>
      </div>

      <div className="speed-test-card">
        <div className="test-controls">
          <button 
            className={`start-test-button ${isTesting ? 'testing' : ''}`}
            onClick={startTest}
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Start Test'}
          </button>
        </div>

        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="speed-metrics">
          <div className="metric-card">
            <div className="metric-icon">↓</div>
            <div className="metric-info">
              <h3>Download</h3>
              <p className="metric-value">{downloadSpeed.toFixed(2)} Mbps</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">↑</div>
            <div className="metric-info">
              <h3>Upload</h3>
              <p className="metric-value">{uploadSpeed.toFixed(2)} Mbps</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">↔</div>
            <div className="metric-info">
              <h3>Ping</h3>
              <p className="metric-value">{ping.toFixed(2)} ms</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">~</div>
            <div className="metric-info">
              <h3>Jitter</h3>
              <p className="metric-value">{jitter.toFixed(2)} ms</p>
            </div>
          </div>
        </div>

        {testHistory.length > 0 && (
          <div className="test-history">
            <h3>Test History</h3>
            <div className="history-table">
              <div className="table-header">
                <div>Date</div>
                <div>Download</div>
                <div>Upload</div>
                <div>Ping</div>
                <div>Jitter</div>
              </div>
              {testHistory.map((test, index) => (
                <div key={index} className="table-row">
                  <div>{test.date}</div>
                  <div>{test.download.toFixed(2)} Mbps</div>
                  <div>{test.upload.toFixed(2)} Mbps</div>
                  <div>{test.ping.toFixed(2)} ms</div>
                  <div>{test.jitter.toFixed(2)} ms</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedTest; 