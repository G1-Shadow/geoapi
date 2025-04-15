import React, { useState, useEffect } from 'react';
import './SpeedTest.css';

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [ping, setPing] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState(null);
  const [testProgress, setTestProgress] = useState({
    ping: false,
    download: false,
    upload: false
  });

  // Function to measure download speed with multiple samples
  const measureDownloadSpeed = async () => {
    const sampleSize = 3; // Number of samples to take
    const fileSize = 2000000; // 2MB file size
    let totalSpeed = 0;
    let successfulSamples = 0;

    for (let i = 0; i < sampleSize; i++) {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`https://httpbin.org/stream-bytes/${fileSize}`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        let bytesReceived = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytesReceived += value.length;
        }

        const endTime = performance.now();
        clearTimeout(timeoutId);
        const duration = (endTime - startTime) / 1000; // Convert to seconds
        const speedMbps = (bytesReceived * 8) / (duration * 1000000); // Convert to Mbps
        totalSpeed += speedMbps;
        successfulSamples++;
      } catch (error) {
        console.error('Download sample error:', error);
        if (error.name === 'AbortError') {
          throw new Error('Download speed test timed out. Please check your connection and try again.');
        }
      }
    }

    if (successfulSamples === 0) {
      throw new Error('Failed to measure download speed. Please try again.');
    }

    return totalSpeed / successfulSamples; // Return average speed
  };

  // Function to measure upload speed with multiple samples
  const measureUploadSpeed = async () => {
    const sampleSize = 3; // Number of samples to take
    const fileSize = 2000000; // 2MB file size
    let totalSpeed = 0;
    let successfulSamples = 0;

    for (let i = 0; i < sampleSize; i++) {
      const startTime = performance.now();
      const data = new Blob([new ArrayBuffer(fileSize)]);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: data,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const endTime = performance.now();
        clearTimeout(timeoutId);
        const duration = (endTime - startTime) / 1000; // Convert to seconds
        const speedMbps = (data.size * 8) / (duration * 1000000); // Convert to Mbps
        totalSpeed += speedMbps;
        successfulSamples++;
      } catch (error) {
        console.error('Upload sample error:', error);
        if (error.name === 'AbortError') {
          throw new Error('Upload speed test timed out. Please check your connection and try again.');
        }
      }
    }

    if (successfulSamples === 0) {
      throw new Error('Failed to measure upload speed. Please try again.');
    }

    return totalSpeed / successfulSamples; // Return average speed
  };

  // Function to measure ping with multiple samples
  const measurePing = async () => {
    const sampleSize = 5; // Number of samples to take
    let totalPing = 0;
    let successfulSamples = 0;

    for (let i = 0; i < sampleSize; i++) {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://httpbin.org/get', {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const endTime = performance.now();
        clearTimeout(timeoutId);
        totalPing += endTime - startTime;
        successfulSamples++;
      } catch (error) {
        console.error('Ping sample error:', error);
        if (error.name === 'AbortError') {
          throw new Error('Ping test timed out. Please check your connection and try again.');
        }
      }
    }

    if (successfulSamples === 0) {
      throw new Error('Failed to measure ping. Please try again.');
    }

    return totalPing / successfulSamples; // Return average ping
  };

  // Function to run the complete speed test
  const runSpeedTest = async () => {
    setIsTesting(true);
    setError(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPing(null);
    setTestProgress({ ping: false, download: false, upload: false });

    try {
      // Measure ping first
      setTestProgress(prev => ({ ...prev, ping: true }));
      const pingResult = await measurePing();
      setPing(pingResult.toFixed(2));
      setTestProgress(prev => ({ ...prev, ping: false }));

      // Measure download speed
      setTestProgress(prev => ({ ...prev, download: true }));
      const downloadResult = await measureDownloadSpeed();
      setDownloadSpeed(downloadResult.toFixed(2));
      setTestProgress(prev => ({ ...prev, download: false }));

      // Measure upload speed
      setTestProgress(prev => ({ ...prev, upload: true }));
      const uploadResult = await measureUploadSpeed();
      setUploadSpeed(uploadResult.toFixed(2));
      setTestProgress(prev => ({ ...prev, upload: false }));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <main>
      <section className="speed-test-section">
        <h1>Internet Speed Test</h1>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={runSpeedTest} className="retry-button">
              Retry Test
            </button>
          </div>
        )}

        {isTesting ? (
          <div className="loading-message">
            <div className="test-progress">
              {testProgress.ping && <div className="progress-item">Measuring Ping...</div>}
              {testProgress.download && <div className="progress-item">Measuring Download Speed...</div>}
              {testProgress.upload && <div className="progress-item">Measuring Upload Speed...</div>}
            </div>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="speed-test-results">
            <div className="result-card">
              <h3>Ping</h3>
              <p className="result-value">
                {ping ? `${ping} ms` : '--'}
              </p>
            </div>
            <div className="result-card">
              <h3>Download Speed</h3>
              <p className="result-value">
                {downloadSpeed ? `${downloadSpeed} Mbps` : '--'}
              </p>
            </div>
            <div className="result-card">
              <h3>Upload Speed</h3>
              <p className="result-value">
                {uploadSpeed ? `${uploadSpeed} Mbps` : '--'}
              </p>
            </div>
          </div>
        )}

        <div className="speed-test-actions">
          <button 
            onClick={runSpeedTest} 
            disabled={isTesting}
            className="start-test-button"
          >
            {isTesting ? 'Testing...' : 'Start Speed Test'}
          </button>
        </div>

        <div className="speed-test-info">
          <h3>About the Speed Test</h3>
          <p>
            This speed test measures your internet connection's:
          </p>
          <ul>
            <li><strong>Ping:</strong> The time it takes for data to travel to a server and back</li>
            <li><strong>Download Speed:</strong> How fast you can receive data from the internet</li>
            <li><strong>Upload Speed:</strong> How fast you can send data to the internet</li>
          </ul>
          <p className="note">
            Note: The test takes multiple samples for each measurement to ensure accuracy.
            Results may vary based on your network conditions and server load.
          </p>
        </div>
      </section>
    </main>
  );
};

export default SpeedTest; 