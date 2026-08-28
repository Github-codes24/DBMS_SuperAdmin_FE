import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, CheckCircle, Save, Camera, Trash2, Shield, Calendar, Clock, Activity } from 'lucide-react';

export default function ProfileSection({ currentUser, onUpdateUser }) {
  const fileInputRef = useRef(null);
  const { loading } = useSelector((state) => state.auth);

  const [photoUrl, setPhotoUrl] = useState(currentUser?.profileImage || currentUser?.photoUrl || '');
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Shivam',
    email: currentUser?.email || 'shivam.lts@localtradestreet.com',
    phone: currentUser?.phone || '+91 98765 43210'
  });

  const [notification, setNotification] = useState('');

  // Sync component state when currentUser is loaded/updated from the backend
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
      setPhotoUrl(currentUser.profileImage || currentUser.photoUrl || '');
    }
  }, [currentUser]);

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
          <p className="simple-profile-subtitle">{currentUser?.role || 'TELECALLER'}</p>
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
            <button 
              type="submit" 
              className="btn-orange" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <Save size={16} /> {loading ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* Read-Only Account Details */}
        <div className="profile-additional-details" style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} className="text-orange" style={{ color: 'var(--lts-orange)' }} /> Account Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                Employee ID
              </span>
              <strong style={{ color: '#334155' }}>{currentUser?.employeeId || 'TC001'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                Status
              </span>
              <span style={{ 
                display: 'inline-block', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '10px', 
                fontWeight: '700',
                background: (currentUser?.status || 'ACTIVE') === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                color: (currentUser?.status || 'ACTIVE') === 'ACTIVE' ? '#15803d' : '#991b1b',
              }}>
                {currentUser?.status || 'ACTIVE'}
              </span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Clock size={12} /> Last Login
              </span>
              <strong style={{ color: '#334155' }}>
                {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'N/A'}
              </strong>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Calendar size={12} /> Joined On
              </span>
              <strong style={{ color: '#334155' }}>
                {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
