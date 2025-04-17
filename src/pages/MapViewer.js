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

  // Get user's current location when component mounts
  useEffect(() => {
    let watchId = null;

    const getLocation = () => {
      if ("geolocation" in navigator) {
        // First try to get current position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Got current location:', latitude, longitude);
            setCurrentLocation({ lat: latitude, lng: longitude });
            setCoordinates({ lat: latitude.toString(), lng: longitude.toString() });
            setError(null);
            
            // Update map if it's already initialized
            if (map) {
              updateMapWithCoordinates(latitude, longitude);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Could not get your current location. Please allow location access.');
            setCurrentLocation({ lat: 20.5937, lng: 78.9629 }); // Default to India center
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );

        // Then start watching position for updates
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Location updated:', latitude, longitude);
            setCurrentLocation({ lat: latitude, lng: longitude });
            setCoordinates({ lat: latitude.toString(), lng: longitude.toString() });
            setError(null);
            
            // Update map with new location
            if (map) {
              updateMapWithCoordinates(latitude, longitude);
            }
          },
          (error) => {
            console.error('Error watching location:', error);
            setError('Location tracking error. Please check your location settings.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setCurrentLocation({ lat: 20.5937, lng: 78.9629 }); // Default to India center
      }
    };

    getLocation();

    // Cleanup watchPosition on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    // Check if Azure Maps key is available
    const azureMapsKey = process.env.REACT_APP_AZURE_MAPS_KEY;
    if (!azureMapsKey) {
      console.error('Azure Maps key is missing or invalid');
      setError('Azure Maps key is not configured properly.');
      setIsLoading(false);
      return;
    }

    // Check if Azure Maps is already loaded
    if (window.atlas) {
      console.log('Azure Maps SDK already loaded, initializing map...');
      initializeMap(azureMapsKey);
      return;
    }

    console.log('Loading Azure Maps SDK...');
    // Load Azure Maps script
    const script = document.createElement('script');
    script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js';
    script.async = true;
    script.onerror = () => {
      console.error('Failed to load Azure Maps SDK');
      setError('Failed to load map resources. Please check your internet connection.');
      setIsLoading(false);
    };
    script.onload = () => {
      console.log('Azure Maps SDK loaded successfully');
      // Load Azure Maps CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css';
      link.onerror = () => {
        console.error('Failed to load Azure Maps CSS');
        setError('Failed to load map styles. Please check your internet connection.');
        setIsLoading(false);
      };
      link.onload = () => {
        console.log('Azure Maps CSS loaded successfully');
        initializeMap(azureMapsKey);
      };
      document.head.appendChild(link);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (map) {
        console.log('Disposing map instance');
        map.dispose();
      }
    };
  }, []);

  // When map is initialized and we have current location, update the map
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
      if (!mapRef.current) {
        console.error('Map container reference is not available');
        return;
      }

      console.log('Initializing map with container:', mapRef.current);

      // Use currentLocation if available, otherwise use India center
      const center = currentLocation 
        ? [currentLocation.lng, currentLocation.lat] 
        : [78.9629, 20.5937];

      const mapInstance = new window.atlas.Map(mapRef.current, {
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: key
        },
        center: center,
        zoom: currentLocation ? 12 : 5,
        style: isDarkMode ? 'night' : 'road',
        language: 'en-US',
        renderWorldCopies: false
      });

      mapInstance.events.add('ready', () => {
        console.log('Map ready event fired');
        setMap(mapInstance);
        setIsLoading(false);

        // If we have current location, update the map and add marker
        if (currentLocation) {
          console.log('Updating map with current location:', currentLocation);
          updateMapWithCoordinates(currentLocation.lat, currentLocation.lng);
        }
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
      // Show default dialogue box immediately
      setDialogueInfo({
        title: 'Location Information',
        content: `Latitude: ${lat.toFixed(6)}
                  Longitude: ${lng.toFixed(6)}
                  Fetching network data...`
      });
      setShowDialogue(true);

      const response = await fetch('https://ml-shree007.azurewebsites.net/api/get_best_provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          longitude: lng,
          latitude: lat
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch network data');
      }

      const data = await response.json();
      
      // Update the dialogue info with the response data
      setDialogueInfo({
        title: 'Location Information',
        content: `Latitude: ${lat.toFixed(6)}
                  Longitude: ${lng.toFixed(6)}
                  Best Network: ${data.best_provider || 'N/A'}
                  Network Score: ${data.score ? data.score.toFixed(2) : 'N/A'}`
      });

      // Update other state variables
      setBestSimProvider(data.best_provider || 'Not Available');
      setSimScore(data.score ? data.score.toFixed(2) : 'N/A');

    } catch (error) {
      console.error('Error fetching network data:', error);
      // Show basic location info when backend is not available
      setDialogueInfo({
        title: 'Location Information',
        content: `Latitude: ${lat.toFixed(6)}
                  Longitude: ${lng.toFixed(6)}
                  Network Data: Unavailable
                  Status: Unable to fetch network information`
      });
      setBestSimProvider('Not Available');
      setSimScore('N/A');
    }
  };

  const updateMapWithCoordinates = (lat, lng) => {
    if (!map) {
      console.error('Map not initialized');
      setError('Map is not ready yet. Please wait...');
      return;
    }

    try {
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid coordinates provided');
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Coordinates out of valid range');
      }

      // Remove existing marker if any
      if (currentMarker) {
        map.markers.remove(currentMarker);
        setCurrentMarker(null);
      }

      // Create data source if it doesn't exist
      if (!dataSourceRef.current) {
        dataSourceRef.current = new window.atlas.source.DataSource();
        map.sources.add(dataSourceRef.current);
      }

      // Create point feature
      const point = new window.atlas.data.Feature(
        new window.atlas.data.Point([longitude, latitude])
      );

      // Clear existing data and add new point
      dataSourceRef.current.clear();
      dataSourceRef.current.add(point);

      // Create marker
      const marker = new window.atlas.HtmlMarker({
        position: [longitude, latitude],
        color: '#4299e1',
        text: '📍',
        pixelOffset: [0, 0]
      });

      // Add marker to map
      map.markers.add(marker);
      setCurrentMarker(marker);

      // Center map on marker with animation
      map.setCamera({
        center: [longitude, latitude],
        zoom: 15,
        type: 'ease',
        duration: 1000
      });

      // Create popup
      const popup = new window.atlas.Popup({
        position: [longitude, latitude],
        content: `
          <div class="map-dialogue">
            <h3>${dialogueInfo.title}</h3>
            <p>${dialogueInfo.content}</p>
          </div>
        `,
        pixelOffset: [0, -30],
        closeButton: false
      });

      // Remove existing popup if any
      if (currentPopup) {
        currentPopup.close();
      }

      // Add popup to map
      popup.open(map);
      setCurrentPopup(popup);
      setShowDialogue(true);

      // Fetch and display network data
      fetchSimData(latitude, longitude);

    } catch (error) {
      console.error('Error updating map:', error);
      setError(error.message || 'Failed to update map with coordinates');
      setShowDialogue(false);
    }
  };

  // Update popup content when dialogueInfo changes
  useEffect(() => {
    if (currentPopup && showDialogue) {
      currentPopup.setOptions({
        content: `
          <div class="map-dialogue">
            <h3>${dialogueInfo.title}</h3>
            <p>${dialogueInfo.content}</p>
          </div>
        `
      });
    }
  }, [dialogueInfo, currentPopup, showDialogue]);

  // Add event listener for map movement
  useEffect(() => {
    if (map && currentMarker) {
      const updatePopupPosition = () => {
        try {
          if (currentPopup) {
            const position = currentMarker.getOptions().position;
            currentPopup.setOptions({
              position: position
            });
          }
        } catch (error) {
          console.error('Error updating popup position:', error);
        }
      };

      map.events.add('moveend', updatePopupPosition);
      map.events.add('zoomend', updatePopupPosition);

      return () => {
        map.events.remove('moveend', updatePopupPosition);
        map.events.remove('zoomend', updatePopupPosition);
      };
    }
  }, [map, currentMarker, currentPopup]);

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
      setError(null);
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