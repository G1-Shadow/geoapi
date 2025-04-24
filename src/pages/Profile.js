import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();

  const formatRole = (roles) => {
    if (!roles || roles.length === 0) return 'User';
    
    // Filter out ROLE_ prefix and format roles
    const formattedRoles = roles.map(role => role.replace('ROLE_', ''));
    
    // If user has ADMIN role, show it first
    if (formattedRoles.includes('ADMIN')) {
      return 'Admin';
    }
    
    return formattedRoles.join(', ');
  };

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : '?';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">{getInitial()}</div>
            )}
          </div>
          <h1>{user?.name || 'User'}</h1>
          <p className="email">{user?.email}</p>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="label">Role</span>
            <span className="value role-badge">{formatRole(user?.roles)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Member Since</span>
            <span className="value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Invalid Date'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Last Login</span>
            <span className="value">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Invalid Date'}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile; 