import React, { useState } from 'react';
import { User, Mail, Phone, CheckCircle, Save } from 'lucide-react';

export default function ProfileSection({ currentUser, onUpdateUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Shivam',
    email: currentUser?.email || 'shivam.lts@localtradestreet.com',
    phone: currentUser?.phone || '+91 98765 43210'
  });

  const [notification, setNotification] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    setNotification('Profile details updated successfully!');
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="simple-profile-container">
      {/* Toast Notification */}
      {notification && (
        <div className="profile-toast-alert">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Simple Profile Card */}
      <div className="card-panel simple-profile-card">
        <div className="simple-profile-header">
          <div className="simple-avatar-circle">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="simple-profile-title">{formData.name}</h2>
          <p className="simple-profile-subtitle">User Profile</p>
        </div>

        <form onSubmit={handleSaveProfile} className="simple-profile-form">
          <div className="form-group">
            <label>
              <User size={14} className="input-label-icon" /> Username
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Phone size={14} className="input-label-icon" /> Phone Number
            </label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={14} className="input-label-icon" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="simple-profile-actions">
            <button type="submit" className="btn-orange" style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
