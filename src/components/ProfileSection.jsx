import React, { useState, useRef } from 'react';
import { User, Mail, Phone, CheckCircle, Save, Camera, Trash2 } from 'lucide-react';

export default function ProfileSection({ currentUser, onUpdateUser }) {
  const fileInputRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');
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

  // Handle Photo File Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Custom Photo
  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...formData,
      photoUrl: photoUrl
    };
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    setNotification('Profile details & photo updated successfully!');
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

      {/* Profile Card */}
      <div className="card-panel simple-profile-card">
        <div className="simple-profile-header">
          {/* Avatar / Photo Upload Container */}
          <div className="avatar-upload-wrapper">
            <div
              className="simple-avatar-circle photo-clickable"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile photo"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="profile-img-preview" />
              ) : (
                <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
              
              {/* Camera Icon Overlay */}
              <div className="avatar-camera-badge">
                <Camera size={14} />
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            {/* Photo Action Links */}
            <div className="photo-actions-row">
              <button
                type="button"
                className="btn-link-action"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={13} /> Change Photo
              </button>
              {photoUrl && (
                <button
                  type="button"
                  className="btn-link-action btn-link-danger"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>

          <h2 className="simple-profile-title" style={{ marginTop: '10px' }}>{formData.name}</h2>
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
