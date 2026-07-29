import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddVendorModal({ onClose, onAdd }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.phone) {
      alert("Please fill in Company Name and Contact Phone Number.");
      return;
    }

    const newCode = `VEND-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newVendor = {
      id: Date.now(),
      vendorCode: newCode,
      ...formData,
      systemRegisterDate: new Date().toLocaleDateString('en-GB'),
      activePackageList: ['TP-Free'],
      createdBy: '2547',
      paymentHistory: [],
      images: []
    };

    onAdd(newVendor);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Vendor</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <select name="state" className="form-control" value={formData.state} onChange={handleChange}>
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
                />
              </div>

              <div className="form-group">
                <label>Is Paid Vendor?</label>
                <select name="paid" className="form-control" value={formData.paid} onChange={handleChange}>
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
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-red" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn-orange">
              Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
