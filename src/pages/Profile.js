import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('User data:', user); // Debug log to check user data structure

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  // Get profile picture URL from the appropriate field
  const profilePicture = user.imageUrl || user.picture || user.profilePicture;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1>{user.name}</h1>
          <p className="email">{user.email}</p>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="label">Account Type</span>
            <span className="value">{user.accountType || 'Free'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Member Since</span>
            <span className="value">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Last Login</span>
            <span className="value">
              {new Date(user.lastLogin).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile; 