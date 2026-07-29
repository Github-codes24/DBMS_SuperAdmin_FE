import React, { useState } from 'react';
import { Printer, RotateCcw } from 'lucide-react';
import { INITIAL_NOTIFICATIONS_REPORT } from '../mockData';

export default function NotificationReport({ vendors }) {
  const [selectedCustomer, setSelectedCustomer] = useState('--All Customers--');
  const [fromDate, setFromDate] = useState('2026-07-08');
  const [toDate, setToDate] = useState('2026-07-24');
  const [reportLogs, setReportLogs] = useState(INITIAL_NOTIFICATIONS_REPORT);

  const handleReset = () => {
    setSelectedCustomer('--All Customers--');
    setFromDate('2026-07-08');
    setToDate('2026-07-24');
    setReportLogs(INITIAL_NOTIFICATIONS_REPORT);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter logs based on selection
  const filteredLogs = reportLogs.filter((log) => {
    if (selectedCustomer !== '--All Customers--' && log.customer !== selectedCustomer) {
      return false;
    }
    if (fromDate && log.date < fromDate) return false;
    if (toDate && log.date > toDate) return false;
    return true;
  });

  return (
    <div className="card-panel">
      <div className="card-header">
        <h2 className="card-title">Customer Vendor Notification Report</h2>
      </div>

      {/* Filter Box matching image 11 */}
      <div className="search-filter-box" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="form-grid-3">
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label>Customer:</label>
            <select
              className="form-control"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="--All Customers--">--All Customers--</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.company}>
                  {v.company} ({v.vendorCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>From Date: <span className="required">*</span></label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To Date: <span className="required">*</span></label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
          <button className="btn-blue" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={15} /> Print
          </button>
          <button className="btn-red" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      {/* Printable Logs Table */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}>
          Notification Dispatches Log ({filteredLogs.length} Records Found)
        </h4>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Dispatch Date</th>
                <th>Vendor / Customer Company</th>
                <th>Vendor Code</th>
                <th>Notification Channel</th>
                <th>Notification Details</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-row">
                    No notification dispatch records found for selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: '600' }}>{log.date}</td>
                    <td>{log.customer}</td>
                    <td><code>{log.vendorCode}</code></td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', fontSize: '11px' }}>
                        {log.type}
                      </span>
                    </td>
                    <td>{log.notificationDetails}</td>
                    <td>
                      <span className={`status-tag status-${log.status === 'Delivered' || log.status === 'Clicked' ? 'success' : 'pending'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
