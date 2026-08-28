import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

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

export default function AddVendorModal({ onClose, onAdd }) {
  const token = useSelector((state) => state.auth.token);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    vendorName: '',
    phone: '',
    alternatePhone: '',
    whatsappNo: '',
    email: '',
    state: 'Uttar Pradesh',
    city: 'Noida',
    locality: '',
    address: '',
    paid: 'No',
    gstNo: '',
    listingType: 'Not-Verified'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.phone) {
      alert("Please fill in Company Name and Contact Phone Number.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        companyName: formData.company,
        contactPerson: formData.vendorName || '',
        phone: formData.phone,
        whatsapp: formData.whatsappNo || formData.phone,
        email: formData.email || '',
        state: formData.state,
        city: formData.city || '',
        locality: formData.locality || '',
        isPaidVendor: formData.paid === 'Yes',
        fullAddress: formData.address || '',
      };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/api/telecaller/vendors`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create vendor');
      }

      const createdVendor = resData.data;

      const newVendor = {
        id: createdVendor._id,
        vendorCode: createdVendor.vendorId,
        company: createdVendor.storeName || formData.company,
        vendorName: createdVendor.fullName || formData.vendorName,
        phone: createdVendor.phone || formData.phone,
        alternatePhone: formData.alternatePhone || '',
        whatsappNo: formData.whatsappNo || '',
        email: createdVendor.email || formData.email,
        state: formData.state,
        city: formData.city,
        locality: formData.locality,
        address: createdVendor.address || createdVendor.fullAddress || formData.address,
        paid: formData.paid,
        gstNo: formData.gstNo || '',
        systemRegisterDate: createdVendor.createdAt
          ? new Date(createdVendor.createdAt).toLocaleDateString('en-GB')
          : new Date().toLocaleDateString('en-GB'),
        activePackageList: ['TP-Free'],
        createdBy: '2547',
        paymentHistory: [],
        images: (createdVendor.images || []).map((img, idx) => {
          const rawUrl = img.url || img.image || (typeof img === 'string' ? img : '');
          return {
            id: img._id || idx,
            url: resolveImageUrl(rawUrl),
            isPrimary: img.isPrimary || false,
            name: img.name || `Image ${idx + 1}`
          };
        })
      };

      onAdd(newVendor);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={submitting ? undefined : onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Vendor</h3>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
            <div className="form-grid-3">
              <div className="form-group">
                <label>Company Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company / Shop Name"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Vendor Contact Person</label>
                <input
                  type="text"
                  name="vendorName"
                  className="form-control"
                  value={formData.vendorName}
                  onChange={handleChange}
                  placeholder="Owner / Manager Name"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Register Contact / Phone <span className="required">*</span></label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Primary Mobile Number"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNo"
                  className="form-control"
                  value={formData.whatsappNo}
                  onChange={handleChange}
                  placeholder="WhatsApp Mobile Number"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vendor@email.com"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <select name="state" className="form-control" value={formData.state} onChange={handleChange} disabled={submitting}>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Goa">Goa</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Locality</label>
                <input
                  type="text"
                  name="locality"
                  className="form-control"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Locality / Landmark"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Is Paid Vendor?</label>
                <select name="paid" className="form-control" value={formData.paid} onChange={handleChange} disabled={submitting}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 3' }}>
                <label>Full Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Shop No, Street, Sector, Pin Code..."
                  rows={2}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-red" onClick={onClose} disabled={submitting}>
              Close
            </button>
            <button type="submit" className="btn-orange" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
