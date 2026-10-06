import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../services/api';
import { fetchAuditLogs } from '../redux/slices/auditLogsSlice';
import { Search, Download, Lock, FileSpreadsheet, FileText, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

function AuditLogs({ compact = false }) {
  const dispatch = useDispatch();
  const { logs: apiLogs = [], loading } = useSelector((state) => state.auditLogs || {});

  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Role Access Check: Only Super Admin and Admin have access to Export
  const userRole = (localStorage.getItem('userRole') || 'Super Admin').trim();
  const normalizedRole = userRole.toLowerCase();
  const hasExportPermission = normalizedRole === 'super admin' || normalizedRole === 'admin';

  // Debounced search query dispatch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchAuditLogs(searchTerm));
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchTerm]);

  const logs = Array.isArray(apiLogs) ? apiLogs.map((log) => ({
    id: log._id || log.id || Math.random(),
    time: log.time || log.createdAt || '',
    user: log.user || log.performedBy || '',
    action: log.action || '',
    record: log.record || log.targetId || '',
    details: log.details || `${log.action} performed on record ${log.record}`
  })) : [];

  const filteredLogs = logs;

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisplayedLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  // Handle Export CSV
  const handleExportLogs = async () => {
    if (!hasExportPermission) {
      alert('Access Denied: Export CSV is allowed for Super Admin and Admin only.');
      return;
    }

    try {
      const response = await api.get('/superadmin/audit-logs/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LTS_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg('System audit logs exported to CSV!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export audit logs CSV.');
    }
  };

  // Handle Export PDF Report
  const handleExportPDF = async () => {
    if (!hasExportPermission) {
      alert('Access Denied: Export PDF is allowed for Super Admin and Admin only.');
      return;
    }

    try {
      const response = await api.get('/superadmin/audit-logs/export/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      setToastMsg('Formatted Audit PDF report generated!');
      setTimeout(() => setToastMsg(''), 3500);
    } catch (error) {
      toast.error('Failed to export audit logs PDF.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Audit Logs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track important system actions & security trails
            </p>
          </div>

          {/* Action Buttons: Export Excel & Export PDF */}
          {hasExportPermission ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Export Excel Button */}
              <button
                onClick={handleExportLogs}
                className="px-3 py-1.5 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Export Logs as Excel CSV"
              >
                <FileSpreadsheet size={14} />
                <span>Export Excel</span>
              </button>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                title="Export Formatted Audit PDF Report"
              >
                <FileText size={14} />
                <span>Export PDF</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
              <Lock size={13} className="text-slate-400 shrink-0" />
              <span>Export restricted to Super Admin & Admin</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs / user / record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mb-3 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check size={14} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Table View */}
        <div
          className="max-h-[350px] overflow-x-auto overflow-y-auto rounded-xl border border-slate-100 mb-4 scroll-smooth custom-scrollbar"
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">USER</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">RECORD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {currentDisplayedLogs.length > 0 ? (
                currentDisplayedLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-600">{log.time}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{log.user}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{log.action}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] font-semibold">{log.record}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-xs text-slate-400">
                    No log records match search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Interactive Pagination & Footer Bar */}
      {filteredLogs.length > 0 && (
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-800">{indexOfFirstItem + 1}</strong> to{' '}
              <strong className="text-slate-800">{Math.min(indexOfLastItem, filteredLogs.length)}</strong> of{' '}
              <strong className="text-slate-800">{filteredLogs.length}</strong> records
            </span>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-400">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pageNum === validCurrentPage
                      ? 'bg-[#f26522] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
