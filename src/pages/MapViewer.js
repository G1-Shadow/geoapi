import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { indianStates, indianCities } from '../data/indianLocations';
import './MapViewer.css';

const MapViewer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const [dialogueInfo, setDialogueInfo] = useState({
    title: 'Location Information',
    content: 'Select a location to view details'
  });
  const [markerPosition, setMarkerPosition] = useState({ x: 0, y: 0 });
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [bestSimProvider, setBestSimProvider] = useState('');
  const [simScore, setSimScore] = useState(0);
  const dataSourceRef = useRef(null);

  useEffect(() => {
    // Check if coordinates were passed from LocationTracker
    if (location.state?.coordinates) {
      const { latitude, longitude } = location.state.coordinates;
      setCoordinates({ lat: latitude.toString(), lng: longitude.toString() });
      setCurrentLocation({ lat: latitude, lng: longitude });
    }
  }, [location.state]);

  useEffect(() => {
    // Check if Azure Maps key is available
    const azureMapsKey = "Bha7l3M54mc6soBmWPT8y4o4xFKhIeBkLMgUOiwJXfN44lm0ueZYJQQJ99BDACYeBjFb3DozAAAgAZMP4biT"; // You'll need to replace this with a valid key
    if (!azureMapsKey) {
      setError('Azure Maps key is not configured.');
      setIsLoading(false);
      return;
    }

    // Check if Azure Maps is already loaded
    if (window.atlas) {
      initializeMap(azureMapsKey);
      return;
    }

    // Load Azure Maps script
    const script = document.createElement('script');
    script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js';
    script.async = true;
    script.onload = () => {
      // Load Azure Maps CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css';
      link.onload = () => {
        initializeMap(azureMapsKey);
      };
      document.head.appendChild(link);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (map) {
        map.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (map && currentLocation) {
      updateMapWithCoordinates(currentLocation.lat, currentLocation.lng);
    }
  }, [map, currentLocation]);

  useEffect(() => {
    if (map) {
      // Update map style when dark mode changes
      if (isDarkMode) {
        map.setStyle({
          style: "grayscale_dark",
          styleOverrides: {
            countryRegion: {
              borderVisible: true
            },
            adminDistrict: {
              borderVisible: true
            },
            adminDistrict2: {
              borderVisible: true
            }
          }
        });
      } else {
        map.setStyle('road');
      }
    }
  }, [map, isDarkMode]);

  const initializeMap = (key) => {
    try {
      if (!mapRef.current) return;

      console.log('Initializing map with key:', key);

      const mapInstance = new window.atlas.Map(mapRef.current, {
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: key
        },
        center: [78.9629, 20.5937], // Center of India
        zoom: 5,
        style: 'road'
      });

      mapInstance.events.add('ready', () => {
        console.log('Map initialized successfully');
        setMap(mapInstance);
        setIsLoading(false);
      });

      mapInstance.events.add('error', (error) => {
        console.error('Map error:', error);
        setError('Failed to load map. Please check your Azure Maps key and try again.');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError(`Failed to initialize map: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Function to fetch sim data from backend
  const fetchSimData = async (lat, lng) => {
    try {
      // Replace this URL with your actual backend endpoint
      const response = await fetch(`/api/sim-data?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sim data');
      }
      const data = await response.json();
      setBestSimProvider(data.provider || 'Not Available');
      setSimScore(data.score || 'N/A');
    } catch (error) {
      console.error('Error fetching sim data:', error);
      setBestSimProvider('Not Available');
      setSimScore('N/A');
    }
  };

  const updateMapWithCoordinates = (lat, lng) => {
    if (!map) {
      console.error('Map not initialized');
      return;
    }

    try {
      console.log('Updating map with coordinates:', lat, lng);
      
      // Convert coordinates to numbers
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid coordinates');
        return;
      }

      // Fetch sim data for the location
      fetchSimData(latitude, longitude);

      // Clean up existing marker and popup
      if (currentMarker) {
        map.markers.remove(currentMarker);
        setCurrentMarker(null);
      }
      if (currentPopup) {
        currentPopup.close();
        setCurrentPopup(null);
      }

      // Update map view first
      map.setCamera({
        center: [longitude, latitude],
        zoom: 12,
        type: 'ease',
        duration: 1000
      });

      // Wait for camera animation to complete
      setTimeout(() => {
        try {
          // Create new marker
          const marker = new window.atlas.HtmlMarker({
            position: [longitude, latitude],
            color: 'red',
            text: '📍'
          });

          // Add marker to map
          map.markers.add(marker);
          setCurrentMarker(marker);

          // Create and show popup
          const popup = new window.atlas.Popup({
            content: `
              <div style="padding: 10px; background: white; border-radius: 4px;">
                <h3 style="margin: 0 0 5px 0; font-size: 14px; color: black;">Your Location</h3>
                <p style="margin: 0; font-size: 12px; color: black;">
                  Best Network: ${bestSimProvider}<br>
                  Signal Score: ${simScore}
                </p>
              </div>
            `,
            position: [longitude, latitude],
            pixelOffset: [0, -30],
            closeButton: false
          });

          popup.open(map);
          setCurrentPopup(popup);

          console.log('Marker and popup added successfully');
        } catch (error) {
          console.error('Error adding marker or popup:', error);
          setError('Failed to add location marker');
        }
      }, 1000); // Wait for camera animation

    } catch (error) {
      console.error('Error updating map:', error);
      setError('Failed to update map position');
    }
  };

  // Add event listener for map movement
  useEffect(() => {
    if (map && currentMarker) {
      const updateDialoguePosition = () => {
        try {
          const position = currentMarker.getOptions().position;
          const pixelPosition = map.positionsToPixels(position);
          console.log('Updating dialogue position:', pixelPosition);
          setMarkerPosition({
            x: pixelPosition[0],
            y: pixelPosition[1]
          });
        } catch (error) {
          console.error('Error updating dialogue position:', error);
        }
      };

      map.events.add('moveend', updateDialoguePosition);
      map.events.add('zoomend', updateDialoguePosition);

      return () => {
        map.events.remove('moveend', updateDialoguePosition);
        map.events.remove('zoomend', updateDialoguePosition);
      };
    }
  }, [map, currentMarker]);

  // Debug state changes
  useEffect(() => {
    console.log('Dialogue state:', {
      showDialogue,
      markerPosition,
      dialogueInfo
    });
  }, [showDialogue, markerPosition, dialogueInfo]);

  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedState(stateCode);
    setSelectedCity(''); // Reset city when state changes
    setError(null); // Clear any existing errors
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setError(null); // Clear any existing errors
    
    if (selectedState && cityName) {
      const city = indianCities[selectedState].find(c => c.name === cityName);
      if (city) {
        const lat = parseFloat(city.lat);
        const lng = parseFloat(city.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setCoordinates({
            lat: lat.toString(),
            lng: lng.toString()
          });
          updateMapWithCoordinates(lat, lng);
        } else {
          setError('Invalid coordinates for selected city');
        }
      }
    }
  };

  const handleCoordinateSearch = () => {
    if (!map) {
      setError('Map is not initialized yet. Please wait...');
      return;
    }

    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinate range. Latitude must be between -90 and 90, and longitude between -180 and 180.');
      return;
    }

    try {
      setError(null); // Clear any existing errors
      updateMapWithCoordinates(lat, lng);
    } catch (error) {
      console.error('Coordinate search error:', error);
      setError('Failed to update map with coordinates.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <main>
      <section className="map-viewer-section">
        <h1>Azure Maps Viewer</h1>
        
        {isLoading && (
          <div className="loading-message">
            Loading map...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="search-container">
          <div className="search-box">
            <h3>Search by Location</h3>
            <div className="location-dropdowns">
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="state-dropdown"
                disabled={isLoading}
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="city-dropdown"
                disabled={!selectedState || isLoading}
              >
                <option value="">Select City</option>
                {selectedState && indianCities[selectedState]?.map(city => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-box">
            <h3>Search by Coordinates</h3>
            <div className="coordinate-inputs">
              <input
                type="text"
                value={coordinates.lat}
                onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
                placeholder="Latitude (-90 to 90)"
                className="coordinate-input"
                disabled={isLoading}
              />
              <input
                type="text"
                value={coordinates.lng}
                onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
                placeholder="Longitude (-180 to 180)"
                className="coordinate-input"
                disabled={isLoading}
              />
            </div>
            <button 
              onClick={handleCoordinateSearch} 
              className="search-button"
              disabled={isLoading || !map}
            >
              Search Coordinates
            </button>
          </div>
        </div>

        <div className="map-container" style={{ position: 'relative', height: '500px' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          <button 
            className={`dark-mode-toggle ${isDarkMode ? 'active' : ''}`}
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>

        <div className="map-info">
          <h3>About the Map Viewer</h3>
          <p>
            Use this tool to search for locations in India:
          </p>
          <ul>
            <li>Select a state and city from the dropdowns to view its location</li>
            <li>Enter latitude and longitude coordinates to jump to a specific point</li>
            <li>Click and drag to pan the map</li>
            <li>Use the mouse wheel to zoom in and out</li>
            <li>Toggle between light and dark mode using the button in the top right corner</li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default MapViewer; 