import React from 'react';
import { X, FileText, Download } from 'lucide-react';

export default function PaymentHistoryModal({ vendor, onClose }) {
  const history = vendor.paymentHistory || [];

  const handleDownloadInvoice = (item) => {
    if (item.invoiceCode === 'N/A') {
      alert(`Invoice is not generated yet for transaction ${item.transCode} (Status: ${item.status}).`);
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
Amount Paid: ₹${item.poAmt}
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
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>Vendor Payment History</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#475569' }}>
            Showing payment records for: <strong>{vendor.company}</strong> (Vendor Code: <code>{vendor.vendorCode}</code>)
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Trans Code</th>
                  <th>PO Date</th>
                  <th>PO Amt</th>
                  <th>Invoice Code</th>
                  <th>Invoice Date</th>
                  <th>Status</th>
                  <th>Download Invoice</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-row">
                      No payment history available for this vendor
                    </td>
                  </tr>
                ) : (
                  history.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{item.transCode}</td>
                      <td>{item.poDate}</td>
                      <td>{item.poAmt}</td>
                      <td>{item.invoiceCode}</td>
                      <td>{item.invoiceDate}</td>
                      <td>
                        <span className={`status-tag status-${(item.status || '').toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: item.invoiceCode !== 'N/A' ? '#007bff' : '#94a3b8',
                            cursor: item.invoiceCode !== 'N/A' ? 'pointer' : 'not-allowed'
                          }}
                          title={item.invoiceCode !== 'N/A' ? "Download Invoice PDF" : "Invoice Not Available"}
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
