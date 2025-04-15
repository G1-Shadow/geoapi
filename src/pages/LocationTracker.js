import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LocationTracker.css';

const LocationTracker = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [usingIPLocation, setUsingIPLocation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkGeolocationPermission();
  }, []);

  const checkGeolocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        setPermissionDenied(true);
        // Try IP-based location as fallback
        getIPLocation();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      // Try IP-based location as fallback
      getIPLocation();
    }
  };

  const getIPLocation = async () => {
    setIsLoading(true);
    setError(null);
    setUsingIPLocation(true);

    try {
      const response = await fetch('http://ip-api.com/json/');
      if (!response.ok) {
        throw new Error('Failed to get IP location');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setLocation({
          latitude: data.lat,
          longitude: data.lon,
          accuracy: 5000, // Approximate accuracy for IP-based location
          city: data.city,
          country: data.country,
          isIPBased: true
        });
      } else {
        throw new Error(data.message || 'Failed to get location from IP');
      }
    } catch (error) {
      setError('Unable to determine your location. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocation = () => {
    setIsLoading(true);
    setError(null);
    setUsingIPLocation(false);

    if (!navigator.geolocation) {
      // If geolocation is not supported, try IP-based location
      getIPLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          isIPBased: false
        });
        setIsLoading(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access was denied. Using IP-based location instead.');
            getIPLocation();
            break;
          case error.POSITION_UNAVAILABLE:
            setError('GPS location unavailable. Using IP-based location instead.');
            getIPLocation();
            break;
          case error.TIMEOUT:
            setError('GPS request timed out. Using IP-based location instead.');
            getIPLocation();
            break;
          default:
            setError('An unknown error occurred. Using IP-based location instead.');
            getIPLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleRetry = () => {
    setError(null);
    setPermissionDenied(false);
    getLocation();
  };

  const handleViewOnMap = () => {
    if (location) {
      navigate('/map', { 
        state: { 
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      });
    }
  };

  return (
    <main>
      <section className="location-tracker-section">
        <h1>Location Tracker</h1>
        
        {error && (
          <div className="error-message">
            {error}
            {!permissionDenied && (
              <button onClick={handleRetry} className="retry-button">
                Retry
              </button>
            )}
          </div>
        )}

        {permissionDenied && (
          <div className="permission-denied">
            <p>Location access is denied. To enable location tracking:</p>
            <ol>
              <li>Click the lock or info icon in your browser's address bar</li>
              <li>Find the location permission setting</li>
              <li>Change it to "Allow"</li>
              <li>Refresh the page and try again</li>
            </ol>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {!error && !permissionDenied && (
          <div className="location-actions">
            <button 
              onClick={getLocation} 
              disabled={isLoading}
              className="track-button"
            >
              {isLoading ? 'Getting Location...' : 'Get My Location'}
            </button>
          </div>
        )}

        {location && (
          <div className="location-results">
            <h2>Your Location</h2>
            <div className="location-details">
              <p><strong>Latitude:</strong> {location.latitude.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {location.longitude.toFixed(6)}</p>
              <p><strong>Accuracy:</strong> {Math.round(location.accuracy)} meters</p>
              {location.isIPBased && (
                <>
                  <p><strong>City:</strong> {location.city}</p>
                  <p><strong>Country:</strong> {location.country}</p>
                  <p className="location-source">Location determined using IP address (less accurate)</p>
                </>
              )}
            </div>
            <button 
              onClick={handleViewOnMap}
              className="view-on-map-button"
            >
              View on Map
            </button>
          </div>
        )}

        <div className="location-info">
          <h3>About Location Tracking</h3>
          <p>
            This tool uses multiple methods to determine your location:
          </p>
          <ul>
            <li>GPS (most accurate) - Requires location permission</li>
            <li>IP-based location (fallback) - Works when GPS is unavailable</li>
          </ul>
          <p>
            For best results:
          </p>
          <ul>
            <li>Enable GPS on your device for more accurate results</li>
            <li>Make sure location services are enabled in your browser</li>
            <li>IP-based location may be less accurate but works without GPS</li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default LocationTracker; 