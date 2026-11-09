import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Printer, RotateCcw } from 'lucide-react';
import { INITIAL_NOTIFICATIONS_REPORT } from '../mockData';

export default function NotificationReport({ vendors }) {
  const token = useSelector((state) => state.auth.token);
  const [selectedCustomer, setSelectedCustomer] = useState('--All Customers--');
  const [fromDate, setFromDate] = useState('2026-07-08');
  const [toDate, setToDate] = useState('2026-07-24');
  const [reportLogs, setReportLogs] = useState(INITIAL_NOTIFICATIONS_REPORT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotificationReport = async () => {
    const activeToken = token || localStorage.getItem('lts_telecaller_token');

    if (!activeToken || activeToken === 'mock-token') {
      setReportLogs(INITIAL_NOTIFICATIONS_REPORT);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const headers = {
        'Authorization': `Bearer ${activeToken}`
      };

      const response = await fetch(`${baseUrl}/api/telecaller/report/notifications?page=1&limit=100`, {
        method: 'GET',
        headers
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to fetch notification report');
      }

      const records = resData.data?.records || [];
      const mappedLogs = records.map((record) => ({
        id: record.id || record._id,
        date: record.dispatchDate ? new Date(record.dispatchDate).toLocaleDateString('en-GB') : '',
        customer: record.companyName || record.customerName || '',
        vendorCode: record.vendorCode || '',
        type: record.notificationChannel || '',
        notificationDetails: record.notificationDetails || '',
        status: record.deliveryStatus || ''
      }));

      setReportLogs(mappedLogs);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch notification report');
      setReportLogs(INITIAL_NOTIFICATIONS_REPORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationReport();
  }, [token]);

  const handleReset = () => {
    setSelectedCustomer('--All Customers--');
    setFromDate('2026-07-08');
    setToDate('2026-07-24');
    fetchNotificationReport();
  };

  const handlePrint = async () => {
    const activeToken = token || localStorage.getItem('lts_telecaller_token');

    if (!activeToken || activeToken === 'mock-token') {
      window.print();
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      let url = `${baseUrl}/api/telecaller/report/notifications/print`;
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (selectedCustomer && selectedCustomer !== '--All Customers--') {
        params.append('customer', selectedCustomer);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const headers = {
        'Authorization': `Bearer ${activeToken}`
      };

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to load print template');
      }

      const blob = await response.blob();
      const contentType = blob.type || response.headers.get('content-type') || '';
      const isPdf = contentType.includes('application/pdf') || (blob.size >= 4 && (await blob.slice(0, 4).text()) === '%PDF');

      if (isPdf) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else if (contentType.includes('application/json')) {
        window.print();
      } else {
        const html = await blob.text();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          alert('Popup blocker prevented opening the print window. Please allow popups.');
        }
      }
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setLoading(false);
    }
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

      </div>

      {error && (
        <div className="error-alert" style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '10px 14px',
          borderRadius: '6px',
          marginTop: '15px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Loading notification dispatches...
        </div>
      )}

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

        {/* Print and Reset Buttons at the bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <button className="btn-blue" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={15} /> Print
          </button>
          <button className="btn-red" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
