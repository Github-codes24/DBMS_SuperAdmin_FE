import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { X, Upload, CheckSquare, Square, User, Image as ImageIcon, Phone, Tags, Save, CheckCircle, Trash2 } from 'lucide-react';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

export default function EditVendorModal({ vendor, isViewOnly = false, onClose, onSave }) {
  const token = useSelector((state) => state.auth.token);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({ ...vendor });
  const [uploadedImages, setUploadedImages] = useState(vendor.images || []);

  useEffect(() => {
    setFormData({ ...vendor });
    setUploadedImages(vendor.images || []);
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (shouldFollowUp = false) => {
    setSubmitting(true);
    setError(null);

    const activeToken = token || localStorage.getItem('lts_telecaller_token');

    // Construct personal info payload based on form data
    const payload = {
      companyName: formData.company,
      contactPerson: formData.vendorName,
      phone: formData.phone,
      whatsapp: formData.whatsappNo || formData.phone,
      email: formData.email,
      state: formData.state,
      city: formData.city,
      locality: formData.locality,
      isPaidVendor: formData.paid === 'Yes',
      fullAddress: formData.address
    };

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const headers = {
        'Content-Type': 'application/json'
      };
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      // If mock token or offline demo, bypass API and save locally
      if (!activeToken || activeToken === 'mock-token') {
        onSave({ ...formData, images: uploadedImages }, shouldFollowUp);
        return;
      }

      const response = await fetch(`${baseUrl}/api/telecaller/vendors/${vendor.id}/personal`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update vendor personal details');
      }

      onSave({ ...formData, images: uploadedImages }, shouldFollowUp);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update vendor personal details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const activeToken = token || localStorage.getItem('lts_telecaller_token');
      
      // If mock token or offline demo, fallback to local URL
      if (!activeToken || activeToken === 'mock-token') {
        const newImg = {
          id: Date.now(),
          url: URL.createObjectURL(file),
          isPrimary: uploadedImages.length === 0,
          name: file.name
        };
        setUploadedImages([...uploadedImages, newImg]);
        return;
      }

      setUploadingImage(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('images', file);

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const headers = {
          'Authorization': `Bearer ${activeToken}`
        };

        const response = await fetch(`${baseUrl}/api/telecaller/vendors/${vendor.id}/images`, {
          method: 'POST',
          headers,
          body: formDataToSend
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.message || 'Failed to upload image');
        }

        const uploadedResult = resData.data;
        const uploadedData = Array.isArray(uploadedResult) ? uploadedResult[0] : uploadedResult;

        const rawUrl = uploadedData?.url || uploadedData?.image || (typeof uploadedData === 'string' ? uploadedData : '');
        const newImg = {
          id: uploadedData?._id || Date.now(),
          url: resolveImageUrl(rawUrl) || URL.createObjectURL(file),
          isPrimary: uploadedData?.isPrimary || uploadedImages.length === 0,
          name: uploadedData?.name || file.name
        };

        setUploadedImages((prev) => [...prev, newImg]);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const togglePrimaryImage = async (id) => {
    if (isViewOnly || submitting || uploadingImage) return;

    const activeToken = token || localStorage.getItem('lts_telecaller_token');

    // If mock token or offline demo, fallback to local toggle
    if (!activeToken || activeToken === 'mock-token') {
      setUploadedImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === id }))
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const headers = {
        'Authorization': `Bearer ${activeToken}`
      };

      const response = await fetch(`${baseUrl}/api/telecaller/vendors/${vendor.id}/images/${id}/primary`, {
        method: 'PATCH',
        headers
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update primary image');
      }

      setUploadedImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === id }))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update primary image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (isViewOnly || submitting || uploadingImage) return;

    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    const activeToken = token || localStorage.getItem('lts_telecaller_token');

    // If mock token or offline demo, fallback to local delete
    if (!activeToken || activeToken === 'mock-token') {
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const headers = {
        'Authorization': `Bearer ${activeToken}`
      };

      const response = await fetch(`${baseUrl}/api/telecaller/vendors/${vendor.id}/images/${imageId}`, {
        method: 'DELETE',
        headers
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to delete image');
      }

      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete image');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{isViewOnly ? 'View Vendor Details' : 'Edit Vendor'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', padding: 0, height: '500px', maxHeight: 'calc(90vh - 130px)', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tabs Header */}
          <div className="modal-sidebar-tabs">
            <button
              className={`modal-side-tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <User size={18} /> Vendor Personal Info
            </button>
            <button
              className={`modal-side-tab ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              <ImageIcon size={18} /> Upload Images
            </button>
            <button
              className={`modal-side-tab ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              <Phone size={18} /> Contact & Payment Info
            </button>
            <button
              className={`modal-side-tab ${activeTab === 'category' ? 'active' : ''}`}
              onClick={() => setActiveTab('category')}
            >
              <Tags size={18} /> Vendor Category Details
            </button>
          </div>

          <div className="modal-tab-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {error && (
              <div className="error-alert" style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '15px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}
            <fieldset disabled={isViewOnly || submitting} style={{ border: 'none', padding: 0, margin: 0, minWidth: 0, display: 'contents' }}>
              {/* Tab 1: Personal Info */}
              {activeTab === 'personal' && (
              <div className="form-grid-3">
              <div className="form-group">
                <label>Vendor Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vendorCode}
                  disabled
                  readOnly
                  title="Vendor Code cannot be edited"
                />
              </div>

              <div className="form-group">
                <label>System Register Date</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.systemRegisterDate || '07/09/2020'}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Vendor Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="vendorName"
                  className="form-control"
                  value={formData.vendorName || ''}
                  onChange={handleChange}
                  placeholder="Vendor Name"
                />
              </div>

              <div className="form-group">
                <label>Vendor Company Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  value={formData.company || ''}
                  onChange={handleChange}
                  placeholder="Company Name"
                />
              </div>

              <div className="form-group">
                <label>Country Name:</label>
                <select
                  name="country"
                  className="form-control"
                  value={formData.country || 'India'}
                  onChange={handleChange}
                >
                  <option value="India">India</option>
                  <option value="UAE">UAE</option>
                  <option value="USA">USA</option>
                </select>
              </div>

              <div className="form-group">
                <label>State Name:</label>
                <select
                  name="state"
                  className="form-control"
                  value={formData.state || ''}
                  onChange={handleChange}
                >
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Goa">Goa</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div className="form-group">
                <label>City Name:</label>
                <select
                  name="city"
                  className="form-control"
                  value={formData.city || ''}
                  onChange={handleChange}
                >
                  <option value="Noida">Noida</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Sanquelim">Sanquelim</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              <div className="form-group">
                <label>Locality:</label>
                <input
                  type="text"
                  name="locality"
                  className="form-control"
                  value={formData.locality || ''}
                  onChange={handleChange}
                  placeholder="Locality"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email || ''}
                  onChange={handleChange}
                  placeholder="email@domain.com"
                />
              </div>

              <div className="form-group">
                <label>GST Number:</label>
                <input
                  type="text"
                  name="gstNo"
                  className="form-control"
                  value={formData.gstNo || ''}
                  onChange={handleChange}
                  placeholder="15 Digit GST Number"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Address:</label>
                <textarea
                  name="address"
                  className="form-control"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="Complete Vendor Address"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Upload Images */}
          {activeTab === 'images' && (
            <div>
              <div className="image-upload-card">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    id="vendorImgInput"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <label 
                    htmlFor={isViewOnly || uploadingImage ? undefined : "vendorImgInput"} 
                    className="form-control" 
                    style={{ 
                      cursor: (isViewOnly || uploadingImage) ? 'not-allowed' : 'pointer', 
                      pointerEvents: (isViewOnly || uploadingImage) ? 'none' : 'auto', 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center',
                      opacity: (isViewOnly || uploadingImage) ? 0.6 : 1
                    }}
                  >
                    {uploadingImage ? 'Uploading image...' : 'Choose Files'}
                  </label>
                  <button
                    className="btn-green"
                    onClick={() => document.getElementById('vendorImgInput').click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={isViewOnly || uploadingImage}
                  >
                    <Upload size={14} /> {uploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>

              <label style={{ fontWeight: 'bold', margin: '10px 0', display: 'block' }}>
                Upload Images :
              </label>

              <div className="image-gallery-grid">
                {uploadedImages.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No vendor images uploaded yet.</p>
                ) : (
                  uploadedImages.map((img) => (
                    <div key={img.id} className="image-thumb-box" style={{ position: 'relative' }}>
                      <img src={img.url} alt={img.name || 'Vendor shop'} />
                      
                      {!isViewOnly && (
                        <button
                          type="button"
                          className="image-delete-btn"
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                          }}
                          onClick={() => handleDeleteImage(img.id)}
                          title="Delete this image"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                        onClick={() => togglePrimaryImage(img.id)}
                      >
                        {img.isPrimary ? (
                          <CheckSquare size={16} color="#16a34a" />
                        ) : (
                          <Square size={16} color="#94a3b8" />
                        )}
                        <span>{img.isPrimary ? 'Primary' : 'Set Primary'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {uploadedImages.length > 0 && (
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <button className="btn-green">Change Vendor Primary Image</button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Contact & Payment Info */}
          {activeTab === 'contact' && (
            <div className="form-grid-3">
              <div className="form-group">
                <label>Registered Phone No. (Locked)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  disabled
                  readOnly
                  title="Registered Phone Number cannot be edited by telecaller"
                />
              </div>

              <div className="form-group">
                <label>WhatsApp No. :</label>
                <input
                  type="text"
                  name="whatsappNo"
                  className="form-control"
                  value={formData.whatsappNo || formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Alternate Contact No.:</label>
                <input
                  type="text"
                  name="alternatePhone"
                  className="form-control"
                  value={formData.alternatePhone || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>IVR No. :</label>
                <input
                  type="text"
                  name="ivrNo"
                  className="form-control"
                  value={formData.ivrNo || 'N.A'}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Website:</label>
                <input
                  type="text"
                  name="website"
                  className="form-control"
                  value={formData.website || 'N/A'}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Vendor Listing Type:</label>
                <select
                  name="listingType"
                  className="form-control"
                  value={formData.listingType || 'Not-Verified'}
                  onChange={handleChange}
                >
                  <option value="Not-Verified">Not-Verified</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>

              <div className="form-group">
                <label>Is Paid Vendor:</label>
                <select
                  name="paid"
                  className="form-control"
                  value={formData.paid || 'No'}
                  onChange={handleChange}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Package Paid Amount :</label>
                <input
                  type="text"
                  name="packagePaidAmount"
                  className="form-control"
                  value={formData.packagePaidAmount || '0'}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Last Payment Date:</label>
                <input
                  type="date"
                  name="lastPaymentDate"
                  className="form-control"
                  value={formData.lastPaymentDate || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Payment Term :</label>
                <select
                  name="paymentTerm"
                  className="form-control"
                  value={formData.paymentTerm || 'Monthly'}
                  onChange={handleChange}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Last Payment Invoice No:</label>
                <input
                  type="text"
                  name="lastPaymentInvoiceNo"
                  className="form-control"
                  value={formData.lastPaymentInvoiceNo || 'N/A'}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Next Payment Due Date:</label>
                <input
                  type="text"
                  name="nextPaymentDueDate"
                  className="form-control"
                  value={formData.nextPaymentDueDate || 'N/A'}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Active Package List:</label>
                <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  {(formData.activePackageList || ['TP-Prime']).map((pkg, i) => (
                    <span key={i} style={{ display: 'inline-block', marginRight: '8px', color: '#007bff', fontWeight: 'bold' }}>
                      • {pkg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Created By:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.createdBy || '2547'}
                  disabled
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Tab 4: Vendor Category Details */}
          {activeTab === 'category' && (
            <div className="form-grid-2">
              <div className="form-group">
                <label>Primary Business Category:</label>
                <select className="form-control" defaultValue="Electrical Services">
                  <option value="Electrical Services">Electrical & Electronics Repair</option>
                  <option value="Retail & Grocery">Retail & Grocery Store</option>
                  <option value="Plumbing & Hardware">Hardware & Sanitation</option>
                  <option value="Automobile Repair">Automobile & Garage</option>
                </select>
              </div>

              <div className="form-group">
                <label>Service Specialization:</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Refrigeration, AC Repair, Home Wiring"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Keywords / Tags for Telecaller Search:</label>
                <textarea
                  className="form-control"
                  defaultValue="fridge repair, washing machine, electrician in noida, shop no 1 sector 48"
                  rows={3}
                />
              </div>
              </div>
            )}
            </fieldset>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="modal-footer">
          {isViewOnly ? (
            <button className="btn-red" onClick={onClose} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Close
            </button>
          ) : (
            <>
              <button className="btn-blue" onClick={() => handleSave(false)} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {submitting ? 'Saving...' : 'Save'}
              </button>
              <button className="btn-green" onClick={() => handleSave(true)} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> {submitting ? 'Saving...' : 'Save & Followup'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
