import React from 'react';
import { X, FileText } from 'lucide-react';

export default function PaymentHistoryModal({ vendor, onClose }) {
  const history = vendor.paymentHistory || [];

  const handleDownloadInvoice = (item) => {
    if (!item.invoiceCode || item.invoiceCode === 'N/A') {
      alert(`Invoice is not generated yet for transaction ${item.transCode} (Status: ${item.status}). Invoice will be available once payment is completed.`);
      return;
    }
    // Simulate invoice download
    const invoiceContent = `================================================
TRADERZ PLANET - VENDOR INVOICE
================================================
Invoice Code: ${item.invoiceCode}
Transaction Ref: ${item.transCode}
Date: ${item.invoiceDate}
Vendor Name: ${vendor.vendorName}
Company Name: ${vendor.company}
Vendor Code: ${vendor.vendorCode}
Registered Mobile: ${vendor.phone}
Package: ${item.planName || 'Standard Package'} ${item.durationLabel ? `(${item.durationLabel})` : ''}
Amount Paid: ₹${Number(item.poAmt || item.total || item.totalAmount || 0).toFixed(2)}
Status: ${item.status}
================================================
Thank you for your business!
================================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${item.invoiceCode.replace(/\//g, '-')}.txt`;
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '950px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>Vendor Payment History</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ marginBottom: '14px', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              Showing payment records for: <strong>{vendor.company}</strong> (Vendor Code: <code>{vendor.vendorCode}</code>)
            </div>
            <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>
              {history.length} Record{history.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>S.No.</th>
                  <th>Trans Code</th>
                  <th>Package</th>
                  <th>Duration</th>
                  <th>PO Date</th>
                  <th>PO Amt</th>
                  <th>Invoice Code</th>
                  <th>Invoice Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data-row">
                      No payment history available for this vendor
                    </td>
                  </tr>
                ) : (
                  history.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{item.transCode}</td>
                      <td style={{ fontWeight: '600', color: '#1e293b' }}>
                        {item.planName || item.productName || '—'}
                      </td>
                      <td>
                        {item.durationLabel ? (
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
                        ) : item.duration ? (
                          `${item.duration} Days`
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{item.poDate}</td>
                      <td style={{ fontWeight: 'bold', color: '#0088a8' }}>
                        ₹{Number(item.poAmt || item.total || item.totalAmount || 0).toFixed(2)}
                      </td>
                      <td>{item.invoiceCode || 'N/A'}</td>
                      <td>{item.invoiceDate || 'N/A'}</td>
                      <td>
                        <span className={`status-tag status-${(item.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: item.invoiceCode && item.invoiceCode !== 'N/A' ? '#007bff' : '#94a3b8',
                            cursor: item.invoiceCode && item.invoiceCode !== 'N/A' ? 'pointer' : 'not-allowed'
                          }}
                          title={item.invoiceCode && item.invoiceCode !== 'N/A' ? "Download Invoice PDF" : "Invoice Not Available (Payment Link Sent/Pending)"}
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-red" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
