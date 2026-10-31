import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Trash2, AlertCircle, RefreshCw, Send, Loader2 } from 'lucide-react';
import { DISCOUNT_OPTIONS } from '../mockData';
import { fetchSubscriptionPlans } from '../redux/slices/plansSlice';

export default function CreatePaymentOrderModal({ vendor, onClose, onSendPaymentLink }) {
  const dispatch = useDispatch();
  const {
    options: planOptions = [],
    status: plansStatus = 'idle',
    loading: loadingPlans = false,
    error: plansError = null,
  } =
    useSelector((state) => state.plans || {});

  const [alternatePhone, setAlternatePhone] = useState(vendor.alternatePhone || vendor.phone || '');
  const [gstNo, setGstNo] = useState(vendor.gstNo || '');
  const [address, setAddress] = useState(vendor.address || '');
  const [gateway, setGateway] = useState('RazorPay');

  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('1');

  const [orderItems, setOrderItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (plansStatus === 'idle') {
      dispatch(fetchSubscriptionPlans());
    }
  }, [dispatch, plansStatus]);

  const isAllSelected = orderItems.length > 0 && selectedItemIds.length === orderItems.length;
  const isIndeterminate = selectedItemIds.length > 0 && selectedItemIds.length < orderItems.length;

  const handleToggleSelect = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
    setActionError(null);
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(orderItems.map((item) => item.id));
    }
    setActionError(null);
  };

  const handleAddItem = () => {
    if (!selectedPkgId) return;
    const selectedOption = planOptions.find((opt) => String(opt.id) === String(selectedPkgId));
    if (!selectedOption) return;

    const discountPercent = parseFloat(selectedDiscount) || 0;
    const unitPrice = selectedOption.price;
    const taxPercent = selectedOption.taxPercent;

    const discountAmount = (unitPrice * discountPercent) / 100;
    const priceAfterDiscount = unitPrice - discountAmount;
    const taxAmount = (priceAfterDiscount * taxPercent) / 100;
    const total = Math.round(priceAfterDiscount + taxAmount);

    const durationLabel =
      selectedOption.durationLabel ||
      (selectedOption.durationInMonths
        ? `${selectedOption.durationInMonths} Month${selectedOption.durationInMonths > 1 ? 's' : ''}`
        : `${selectedOption.durationDays || 30} Days`);

    const newItem = {
      id: Date.now() + Math.random(),
      planId: selectedOption.planId,
      durationId: selectedOption.durationId,
      planName: selectedOption.planName,
      productName: `${selectedOption.planName} (${durationLabel})`,
      duration: selectedOption.durationDays,
      durationInMonths: selectedOption.durationInMonths,
      durationLabel: durationLabel,
      unitPrice: unitPrice,
      taxPercent: taxPercent,
      discountPercent: discountPercent,
      total: total,
    };

    setOrderItems((prev) => [...prev, newItem]);
    // Newly added records start unchecked
    setSelectedPkgId('');
    setSelectedDiscount('1');
    setActionError(null);
  };

  const handleRemoveItem = (id) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const calculateGrandTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.total, 0);
  };

  const calculateSelectedTotal = () => {
    return orderItems
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((acc, item) => acc + item.total, 0);
  };

  const handleSendBulkLink = async () => {
    if (selectedItemIds.length === 0 || isSending) {
      setActionError('Please select at least one plan.');
      return;
    }

    const phoneToUse = (alternatePhone || vendor.phone || '').trim();
    if (!phoneToUse) {
      setActionError('Please provide a valid contact number before sending the link.');
      return;
    }

    const selectedRecords = orderItems.filter((item) => selectedItemIds.includes(item.id));
    if (selectedRecords.length === 0) {
      setActionError('Please select at least one plan.');
      return;
    }

    setActionError(null);
    setIsSending(true);

    try {
      // Simulate realistic dispatch latency
      await new Promise((resolve) => setTimeout(resolve, 600));

      const selectedTotal = selectedRecords.reduce((sum, it) => sum + it.total, 0);

      const payload = {
        vendor: {
          ...vendor,
          alternatePhone: alternatePhone.trim(),
          gstNo: gstNo.trim(),
          address: address.trim(),
        },
        gateway,
        targetPhone: phoneToUse,
        totalAmount: selectedTotal,
        selectedCount: selectedRecords.length,
        selectedItems: selectedRecords.map((it) => ({
          id: it.id,
          planId: it.planId,
          durationId: it.durationId,
          planName: it.planName,
          productName: it.productName,
          duration: it.duration,
          durationInMonths: it.durationInMonths,
          durationLabel: it.durationLabel,
          unitPrice: it.unitPrice,
          taxPercent: it.taxPercent,
          discountPercent: it.discountPercent,
          total: it.total,
        })),
        items: selectedRecords,
        item: selectedRecords.length === 1 ? selectedRecords[0] : null,
      };

      if (typeof onSendPaymentLink === 'function') {
        onSendPaymentLink(payload);
      }

      setSelectedItemIds([]);
    } catch (err) {
      console.error('Failed to send payment link(s):', err);
      setActionError('Failed to send payment link(s). Please try again.');
    } finally {
      setIsSending(false);
    }
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
                    disabled={loadingPlans}
                  >
                    {loadingPlans ? (
                      <option value="" disabled>Loading subscription plans...</option>
                    ) : plansError ? (
                      <option value="" disabled>Failed to load subscription plans</option>
                    ) : planOptions.length === 0 ? (
                      <option value="" disabled>No subscription plans available</option>
                    ) : (
                      <>
                        <option value="">--Please Select--</option>
                        {planOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {plansError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#dc2626', fontSize: '11px' }}>
                      <AlertCircle size={13} />
                      <span>{plansError}</span>
                      <button
                        type="button"
                        onClick={() => dispatch(fetchSubscriptionPlans())}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: 0
                        }}
                      >
                        <RefreshCw size={11} />
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Discount (%):</label>
                  <select
                    className="form-control"
                    value={selectedDiscount}
                    onChange={(e) => setSelectedDiscount(e.target.value)}
                  >
                    {DISCOUNT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn-green" onClick={handleAddItem} style={{ height: '36px' }}>
                  Add
                </button>
              </div>

              {/* Action Error Banner */}
              {actionError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #f87171',
                    borderRadius: '4px',
                    color: '#991b1b',
                    fontSize: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Items Table */}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '95px', textAlign: 'center' }}>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: orderItems.length === 0 || isSending ? 'not-allowed' : 'pointer',
                            margin: 0,
                            fontWeight: '600',
                            fontSize: '12px',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isIndeterminate;
                            }}
                            onChange={handleToggleSelectAll}
                            disabled={orderItems.length === 0 || isSending}
                            style={{ cursor: orderItems.length === 0 || isSending ? 'not-allowed' : 'pointer', width: '15px', height: '15px' }}
                          />
                          <span>Select All</span>
                        </label>
                      </th>
                      <th style={{ width: '45px', textAlign: 'center' }}>S.No.</th>
                      <th>Package</th>
                      <th>Duration</th>
                      <th>Unit Price</th>
                      <th>Discount</th>
                      <th>Tax</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'center', width: '65px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="no-data-row">
                          Data Not Exists
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          style={{
                            backgroundColor: selectedItemIds.includes(item.id) ? '#eff6ff' : undefined,
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedItemIds.includes(item.id)}
                              onChange={() => handleToggleSelect(item.id)}
                              disabled={isSending}
                              style={{ cursor: isSending ? 'not-allowed' : 'pointer', width: '15px', height: '15px' }}
                              aria-label={`Select ${item.planName}`}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ fontWeight: '600' }}>{item.planName}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500',
                                color: '#475569',
                              }}
                            >
                              {item.durationLabel}
                            </span>
                          </td>
                          <td>₹{Math.round(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td>{item.discountPercent}%</td>
                          <td>{item.taxPercent}%</td>
                          <td style={{ fontWeight: 'bold', color: '#0088a8' }}>
                           ₹{item.total.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isSending}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: isSending ? '#cbd5e1' : '#dc2626',
                                cursor: isSending ? 'not-allowed' : 'pointer',
                                padding: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                              title="Remove package"
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
                {selectedItemIds.length > 0 && selectedItemIds.length < orderItems.length && (
                  <span style={{ marginRight: '16px', fontSize: '13px', color: '#475569' }}>
                    Selected Amount ({selectedItemIds.length} of {orderItems.length}):{' '}
                    <span style={{ color: '#2563eb', fontWeight: '700' }}>
                     ₹{calculateSelectedTotal().toLocaleString('en-IN')}
                    </span>
                  </span>
                )}
                Total Amount(Including Tax): <span style={{ color: '#0088a8' }}>₹{calculateGrandTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {orderItems.length === 0 ? (
              'Select a package above and click "Add" to generate order items.'
            ) : selectedItemIds.length === 0 ? (
              <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={13} />
                Please select at least one plan to send payment link.
              </span>
            ) : (
              <span>
                <strong>{selectedItemIds.length}</strong> of <strong>{orderItems.length}</strong> plan(s) selected (Total: <strong style={{ color: '#0088a8' }}>₹{calculateSelectedTotal().toLocaleString('en-IN')}</strong>)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-red" onClick={onClose} disabled={isSending}>
              Close
            </button>
            <button
              type="button"
              className="btn-blue"
              onClick={handleSendBulkLink}
              disabled={selectedItemIds.length === 0 || isSending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: selectedItemIds.length === 0 || isSending ? 0.6 : 1,
                cursor: selectedItemIds.length === 0 || isSending ? 'not-allowed' : 'pointer',
              }}
              title={selectedItemIds.length === 0 ? 'Please select at least one plan' : 'Send payment link for selected plan(s)'}
            >
              {isSending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} />
                  {selectedItemIds.length > 1
                    ? `Send Links (${selectedItemIds.length})`
                    : 'Send Link'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
