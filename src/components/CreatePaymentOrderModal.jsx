import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { AVAILABLE_PACKAGES } from '../mockData';

export default function CreatePaymentOrderModal({ vendor, onClose, onSendPaymentLink }) {
  const [alternatePhone, setAlternatePhone] = useState(vendor.alternatePhone || vendor.phone || '');
  const [gstNo, setGstNo] = useState(vendor.gstNo || '');
  const [address, setAddress] = useState(vendor.address || '');
  const [gateway, setGateway] = useState('RazorPay');

  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('0');

  const [orderItems, setOrderItems] = useState([]);

  const handleAddItem = () => {
    if (!selectedPkgId) return;
    const pkg = AVAILABLE_PACKAGES.find((p) => p.id === parseInt(selectedPkgId, 10));
    if (!pkg) return;

    const discountPercent = parseFloat(selectedDiscount) || 0;
    const unitPrice = pkg.price;
    const taxPercent = pkg.taxPercent;

    const discountAmount = (unitPrice * discountPercent) / 100;
    const priceAfterDiscount = unitPrice - discountAmount;
    const taxAmount = (priceAfterDiscount * taxPercent) / 100;
    const total = priceAfterDiscount + taxAmount;

    const newItem = {
      id: Date.now(),
      productName: pkg.name,
      unitPrice: unitPrice,
      taxPercent: taxPercent,
      discountPercent: discountPercent,
      total: total
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedPkgId('');
    setSelectedDiscount('0');
  };

  const handleRemoveItem = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const calculateGrandTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.total, 0);
  };

  const handleSendLink = () => {
    if (orderItems.length === 0) {
      alert("Please add at least one package/product to the order before sending payment link.");
      return;
    }
    const grandTotal = calculateGrandTotal();
    onSendPaymentLink({
      vendor,
      gateway,
      items: orderItems,
      totalAmount: grandTotal,
      targetPhone: vendor.phone
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>Create Payment Order</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Alternate Contact No:</label>
              <input
                type="text"
                className="form-control"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>GST No:</label>
              <input
                type="text"
                className="form-control"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                placeholder="GST Number"
              />
            </div>

            <div className="form-group">
              <label>Address: <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Payment Gateway: <span className="required">*</span></label>
              <select
                className="form-control"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
              >
                <option value="RazorPay">RazorPay</option>
                <option value="PayU">PayU</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
              </select>
            </div>
          </div>

          {/* Section: Packages Details */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <div style={{ display: 'inline-block', padding: '6px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px 4px 0 0', fontWeight: 'bold', fontSize: '13px' }}>
              Packages Details
            </div>

            <div style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '0 4px 4px 4px', background: '#fafafa' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Package Selection: <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                  >
                    <option value="">--Please Select--</option>
                    {AVAILABLE_PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (₹{pkg.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Discount (%):</label>
                  <select
                    className="form-control"
                    value={selectedDiscount}
                    onChange={(e) => setSelectedDiscount(e.target.value)}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                  </select>
                </div>

                <button className="btn-green" onClick={handleAddItem} style={{ height: '36px' }}>
                  Add
                </button>
              </div>

              {/* Items Table */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Product Name</th>
                      <th>Unit Price</th>
                      <th>Tax(in %)</th>
                      <th>Discount</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data-row">
                          Data Not Exists
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '600' }}>{item.productName}</td>
                          <td>₹{item.unitPrice.toFixed(2)}</td>
                          <td>{item.taxPercent}%</td>
                          <td>{item.discountPercent}%</td>
                          <td style={{ fontWeight: 'bold', color: '#0088a8' }}>
                            ₹{item.total.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ textAlign: 'right', marginTop: '14px', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                Total Amount(Including Tax): <span style={{ color: '#0088a8' }}>₹{calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-red" onClick={onClose}>
            Close
          </button>
          <button className="btn-blue" onClick={handleSendLink}>
            Send Link
          </button>
        </div>
      </div>
    </div>
  );
}
