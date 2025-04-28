import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { indianStates, indianCities } from '../data/indianLocations';
import './MapViewer.css';
import LoadingSpinner from '../components/LoadingSpinner';
import Comments from '../components/Comments';
import Icon from '../imgs/Icon.png';
import IconLoc from '../imgs/Iconloc.svg';
import Arrow from '../imgs/Arrow.png';
import { useComments, CommentInputSection } from '../components/Comments';
import CommentList from '../components/CommentList';

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

  // Comments logic
  const commentProps = useComments({ maxComments: 10, showLoginPrompt: true });

  // Split comments for two columns
  const leftComments = commentProps.comments.filter((_, i) => i % 2 === 0);
  const rightComments = commentProps.comments.filter((_, i) => i % 2 === 1);

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
            setCurrentLocation({ lat: 31.326, lng: 75.5762 }); // Default to Jalandhar, Punjab, India
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
        setCurrentLocation({ lat: 31.326, lng: 75.5762 }); // Default to Jalandhar, Punjab, India
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

  // Handle location data from LocationSearch
  useEffect(() => {
    if (location.state?.fromSearch) {
      const { coordinates: coords, selectedState: state, selectedCity: city } = location.state;

      if (coords) {
        setCoordinates({
          lat: coords.lat.toString(),
          lng: coords.lng.toString()
        });
        setCurrentLocation({ lat: coords.lat, lng: coords.lng });
      }

      if (state) setSelectedState(state);
      if (city) setSelectedCity(city);

      // Clear the location state to prevent reusing old data
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Update map and fetch data when coordinates change
  useEffect(() => {
    if (map && currentLocation) {
      updateMapWithCoordinates(currentLocation.lat, currentLocation.lng);
    }
  }, [map, currentLocation]);

  // Update dropdowns when state/city changes
  useEffect(() => {
    if (selectedState) {
      const stateSelect = document.querySelector('select[name="state"]');
      if (stateSelect) stateSelect.value = selectedState;
    }
    if (selectedCity) {
      const citySelect = document.querySelector('select[name="city"]');
      if (citySelect) citySelect.value = selectedCity;
    }
  }, [selectedState, selectedCity]);

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

  // Update the dialogueInfo state when coordinates change
  useEffect(() => {
    if (coordinates.lat && coordinates.lng) {
      setDialogueInfo({
        title: 'Location Information',
        content: `Latitude: ${parseFloat(coordinates.lat).toFixed(6)}
Longitude: ${parseFloat(coordinates.lng).toFixed(6)}
Fetching network data...`
      });
      setShowDialogue(true);
    }
  }, [coordinates]);

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

      // Remove existing popup if any
      if (currentPopup) {
        currentPopup.close();
        setCurrentPopup(null);
      }

      // Create data source if it doesn't exist
      if (!dataSourceRef.current) {
        dataSourceRef.current = new window.atlas.source.DataSource();
        map.sources.add(dataSourceRef.current);
      }

      // Clear existing data and add new point
      dataSourceRef.current.clear();
      dataSourceRef.current.add(new window.atlas.data.Feature(
        new window.atlas.data.Point([longitude, latitude])
      ));

      // Create marker
      const marker = new window.atlas.HtmlMarker({
        position: [longitude, latitude],
        color: '#00D1FF',
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

      // Create and show initial popup
      const popup = new window.atlas.Popup({
        position: [longitude, latitude],
        pixelOffset: [0, -30],
        closeButton: false,
        content: `
          <div class="map-dialogue">
            <h3>Location Information</h3>
            <p>Latitude: ${latitude.toFixed(6)}
Longitude: ${longitude.toFixed(6)}
Fetching network data...</p>
          </div>
        `
      });

      popup.open(map);
      setCurrentPopup(popup);

      // Fetch and display network data
      fetchSimData(latitude, longitude);

    } catch (error) {
      console.error('Error updating map:', error);
      setError(error.message || 'Failed to update map with coordinates');
      setShowDialogue(false);
    }
  };

  const fetchSimData = async (lat, lng) => {
    try {
      if (!currentPopup) {
        console.error('No popup available to update');
        return;
      }

      const response = await fetch('https://netintel-app.onrender.com/api/sim/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Received SIM data:', data);

      // Update both state and popup content
      setDialogueInfo({
        title: 'Network Information',
        content: `Location: [${lat.toFixed(6)}, ${lng.toFixed(6)}]
Best Provider: ${data.provider}
Network Score: ${data.score}/5`
      });

      // Update popup content
      if (currentPopup) {
        currentPopup.setOptions({
          content: `
            <div class="map-dialogue">
              <h3>Network Information</h3>
              <p>Location: [${lat.toFixed(6)}, ${lng.toFixed(6)}]
Best Provider: ${data.provider}
Network Score: ${data.score}/5</p>
            </div>
          `
        });
      }

      setBestSimProvider(data.provider);
      setSimScore(data.score);

    } catch (error) {
      console.error('Error fetching sim data:', error);
      const errorContent = `
        <div class="map-dialogue">
          <h3>Error</h3>
          <p>Could not fetch network information.
            
Latitude: ${lat.toFixed(6)}
Longitude: ${lng.toFixed(6)}</p>
        </div>
      `;

      setDialogueInfo({
        title: 'Error',
        content: `Could not fetch network information.
        
Latitude: ${lat.toFixed(6)}
Longitude: ${lng.toFixed(6)}`
      });

      if (currentPopup) {
        currentPopup.setOptions({
          content: errorContent
        });
      }
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

  // Add function to find nearest location
  const findNearestLocation = (latitude, longitude) => {
    let nearestState = null;
    let nearestCity = null;
    let shortestDistance = Infinity;

    // Helper function to calculate distance between two points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Iterate through all states and cities
    Object.entries(indianCities).forEach(([stateCode, cities]) => {
      cities.forEach(city => {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(city.lat),
          parseFloat(city.lng)
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestState = stateCode;
          nearestCity = city.name;
        }
      });
    });

    return { nearestState, nearestCity };
  };

  const updateDropdownsFromCoordinates = (latitude, longitude) => {
    const { nearestState, nearestCity } = findNearestLocation(latitude, longitude);
    if (nearestState && nearestCity) {
      setSelectedState(nearestState);
      setSelectedCity(nearestCity);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if ("geolocation" in navigator) {
        // Try GPS first
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        setCoordinates({
          lat: latitude.toString(),
          lng: longitude.toString()
        });
        setCurrentLocation({ lat: latitude, lng: longitude });
        updateMapWithCoordinates(latitude, longitude);
        updateDropdownsFromCoordinates(latitude, longitude);
      } else {
        // Fallback to IP geolocation if GPS not available
        const { latitude, longitude } = await getLocationFromIP();
        setCoordinates({
          lat: latitude.toString(),
          lng: longitude.toString()
        });
        setCurrentLocation({ lat: latitude, lng: longitude });
        updateMapWithCoordinates(latitude, longitude);
        updateDropdownsFromCoordinates(latitude, longitude);
        setError('GPS not available. Using approximate location from IP address.');
      }
    } catch (error) {
      console.error('Location error:', error);
      try {
        // Try IP geolocation as fallback
        const { latitude, longitude } = await getLocationFromIP();
        setCoordinates({
          lat: latitude.toString(),
          lng: longitude.toString()
        });
        setCurrentLocation({ lat: latitude, lng: longitude });
        updateMapWithCoordinates(latitude, longitude);
        updateDropdownsFromCoordinates(latitude, longitude);

        let errorMessage = 'GPS location unavailable. Using approximate location from IP address. ';
        if (error.code) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location permission was denied.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information was unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
        }
        setError(errorMessage);
      } catch (ipError) {
        setError('Could not determine location. Please enter coordinates manually or try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update the coordinate search handler to also update dropdowns
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
      updateDropdownsFromCoordinates(lat, lng);
    } catch (error) {
      console.error('Coordinate search error:', error);
      setError('Failed to update map with coordinates.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Add IP geolocation function
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('Failed to fetch IP location');
      }
      const data = await response.json();
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude)
      };
    } catch (error) {
      console.error('IP Geolocation error:', error);
      throw error;
    }
  };

  return (
    <div className="network-advisor">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-md-4 mt-5 search-panel">
            <div className="brand mb-4">
              {/* <h1 className="mb-0">Net<span className="text-primary">Intel</span></h1> */}
              <h1 className="network-title">Network <span className="text-primary">Advisor</span></h1>
            </div>

            {/* Search by Coordinates */}
            <div className="search-section">
              <div className="search-header d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center search-label-container">
                  <span className="search-label">SEARCH BY</span>
                  <span className="search-type">COORDINATES</span>
                </div>
                <div className="search-icon">
                  <img src={Arrow} alt="Coordinates icon" />
                </div>
              </div>

              <div className="coordinate-controls d-flex align-items-center gap-3">


                <div className="coordinate-inputs-wrapper">
                  <input
                    type="text"
                    className="coordinate-input"
                    value={coordinates.lat}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                    placeholder="Latitude"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    className="coordinate-input"
                    value={coordinates.lng}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
                    placeholder="Longitude"
                    disabled={isLoading}
                  />
                </div>
                <button
                  className="circle-btn"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading}
                >
                  <img src={Icon} alt="Get location" />
                </button>

                <button
                  className="submit-btn"
                  onClick={handleCoordinateSearch}
                  disabled={isLoading || !map}
                >
                  SUBMIT
                </button>
              </div>
            </div>

            {/* Search by Location */}
            <div className="search-section">
              <div className="search-header d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center search-label-container">
                  <span className="search-label">SEARCH BY</span>
                  <span className="search-type">LOCATION</span>
                </div>
                <div className="search-icon">
                  <img src={Arrow} alt="Location icon" />
                </div>
              </div>

              <div className="location-controls d-flex align-items-center gap-3">
                <input
                  type="text"
                  className="form-control location-input"
                  value={selectedState ? indianStates.find(s => s.code === selectedState)?.name : ''}
                  placeholder="Select State"
                  readOnly
                  onClick={(e) => {
                    const dropdown = e.target.nextElementSibling;
                    if (dropdown) dropdown.classList.toggle('show');
                  }}
                />
                <div className="location-dropdown-menu">
                  {indianStates.map(state => (
                    <div
                      key={state.code}
                      className="location-dropdown-item"
                      onClick={(e) => {
                        setSelectedState(state.code);
                        setSelectedCity('');
                        const dropdown = e.target.closest('.location-dropdown-menu');
                        if (dropdown) {
                          dropdown.classList.remove('show');
                        }
                      }}
                    >
                      {state.name}
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  className="form-control location-input"
                  value={selectedCity}
                  placeholder="Select City"
                  readOnly
                  disabled={!selectedState}
                  onClick={(e) => {
                    if (!selectedState) return;
                    const dropdown = e.target.nextElementSibling;
                    if (dropdown) dropdown.classList.toggle('show');
                  }}
                />
                <div className="location-dropdown-menu">
                  {selectedState && indianCities[selectedState]?.map(city => (
                    <div
                      key={city.name}
                      className="location-dropdown-item"
                      onClick={(e) => {
                        const dropdown = e.target.closest('.location-dropdown-menu');
                        if (dropdown) {
                          dropdown.classList.remove('show');
                        }

                        setSelectedCity(city.name);
                        const lat = parseFloat(city.lat);
                        const lng = parseFloat(city.lng);

                        if (!isNaN(lat) && !isNaN(lng)) {
                          setCoordinates({
                            lat: lat.toString(),
                            lng: lng.toString()
                          });

                          // Set initial dialogue info before updating map
                          setDialogueInfo({
                            title: 'Location Information',
                            content: `Latitude: ${lat.toFixed(6)}
                            Longitude: ${lng.toFixed(6)}
                            Loading network data...`
                          });
                          setShowDialogue(true);

                          // Update map with coordinates
                          updateMapWithCoordinates(lat, lng);
                        }
                      }}
                    >
                      {city.name}
                    </div>
                  ))}
                </div>

                <button
                  className="btn submit-btn"
                  onClick={() => {
                    if (selectedState && selectedCity) {
                      const city = indianCities[selectedState].find(c => c.name === selectedCity);
                      if (city) {
                        const lat = parseFloat(city.lat);
                        const lng = parseFloat(city.lng);
                        if (!isNaN(lat) && !isNaN(lng)) {
                          updateMapWithCoordinates(lat, lng);
                        }
                      }
                    }
                  }}
                  disabled={!selectedCity}
                >
                  SUBMIT
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-8 map-panel">
            {isLoading && <LoadingSpinner />}

            {error && (
              <div className="alert alert-danger m-3">
                {error}
              </div>
            )}

            <div className="map-container">
              <div ref={mapRef} className="map-view" />
            </div>

            <div className="map-disclaimer text-center mt-3">
              *The above advisory is not sponsored and is offered purely for charity.
            </div>
          </div>
        </div>

        {/* Comments Input & About Model Grid Section */}
        <div className="row mt-4">
          {/* Left Column - Comments Input Section */}
          <div className="col-md-6">
            <CommentInputSection {...commentProps} />
          </div>
          {/* Right Column - About Model Section */}
          <div className="col-md-6">
            <div className="about-model">
              <h3 className="text-start mb-3">About Model</h3>
              <div className="model-info">
                <p className="text-start">
                  We built a hybrid intelligence system that combines a rule-based heuristic engine (2.4M+ tower samples, 17+ features) with a machine learning model trained on 16M+ service records from 2022–2023. Powered by CatBoost, it fuses domain logic and data-driven learning to deliver the most accurate SIM provider recommendations for real-world conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Cards Two-Column Section */}
        <div style={{ marginLeft: '2rem', marginRight: '2rem' }}>
          <div className="row g-0 mt-3">
            <div className="col-md-6">
              <CommentList
                comments={leftComments}
                isLoading={commentProps.isLoading}
                error={commentProps.error}
                user={commentProps.user}
                onDelete={commentProps.handleDelete}
                formatDate={commentProps.formatDate}
              />
            </div>
            <div className="col-md-6">
              <CommentList
                comments={rightComments}
                isLoading={commentProps.isLoading}
                error={commentProps.error}
                user={commentProps.user}
                onDelete={commentProps.handleDelete}
                formatDate={commentProps.formatDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewer; 
