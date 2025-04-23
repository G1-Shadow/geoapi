import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indianStates, indianCities } from '../data/indianLocations';
import Icon from '../imgs/Icon.png';

const LocationSearch = ({ onLocationSelect }) => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });

  const navigateToMap = () => {
    if (coordinates.lat && coordinates.lng) {
      navigate('/map', { 
        state: { 
          coordinates: {
            lat: parseFloat(coordinates.lat),
            lng: parseFloat(coordinates.lng)
          },
          selectedState,
          selectedCity,
          fromSearch: true 
        } 
      });
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    const lat = parseFloat(city.lat);
    const lng = parseFloat(city.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setCoordinates({
        lat: lat.toString(),
        lng: lng.toString()
      });
      onLocationSelect({
        state: selectedState,
        city: city.name,
        coordinates: { lat, lng }
      });
    }
  };

  const handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoordinates({
          lat: lat.toString(),
          lng: lng.toString()
        });
        setSelectedState('');
        setSelectedCity('');
        onLocationSelect({
          coordinates: { lat, lng }
        });
        navigateToMap();
      }
    );
  };

  return (
    <div className="location-search">
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
                setCoordinates({ lat: '', lng: '' });
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
                handleCitySelect(city);
              }}
            >
              {city.name}
            </div>
          ))}
        </div>

        <button 
          className="circle-btn"
          onClick={coordinates.lat && coordinates.lng ? navigateToMap : handleGetCurrentLocation}
        >
          <img src={Icon} alt="Get location" height={40} width={40} />
        </button>
      </div>
    </div>
  );
};

export default LocationSearch; 