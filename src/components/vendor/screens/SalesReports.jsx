import React, { useState } from 'react';
import { X, CheckCircle2, BarChart3, Download, Settings2 } from 'lucide-react';

export const SalesReports = () => {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState([
    { id: 'TC014', name: 'Today Sales Report', count: 128, status: 'Active', period: 'Daily' },
    { id: 'TC021', name: 'Weekly Performance Report', count: 94, status: 'Active', period: 'Weekly' },
    { id: 'TC031', name: 'Monthly Revenue Analytics', count: 0, status: 'Disabled', period: 'Monthly' }
  ]);
  const [managingReport, setManagingReport] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPeriod, setEditPeriod] = useState('Daily');
  const [editStatus, setEditStatus] = useState('Active');
  const [toastMessage, setToastMessage] = useState('');

  const filtered = reports.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenManage = (report) => {
    setManagingReport(report);
    setEditName(report.name);
    setEditPeriod(report.period);
    setEditStatus(report.status);
  };

  const handleSaveReport = (e) => {
    e.preventDefault();
    if (!managingReport) return;

    const updated = reports.map((r) => {
      if (r.id === managingReport.id) {
        return {
          ...r,
          name: editName,
          period: editPeriod,
          status: editStatus
        };
      }
      return r;
    });

    setReports(updated);
    setManagingReport(null);
    setToastMessage(`Report "${editName}" updated successfully!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Report ID', 'Report Name', 'Period', 'Customer Count', 'Status'];
    const rows = reports.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.period}"`,
      r.count,
      `"${r.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lts_vendor_sales_reports_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported sales reports CSV successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search report name / ID..."
          className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">REPORT ID</th>
              <th className="pb-2.5">REPORT NAME</th>
              <th className="pb-2.5">PERIOD</th>
              <th className="pb-2.5">CUSTOMERS</th>
              <th className="pb-2.5">STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 font-extrabold text-[#172033]">{row.id}</td>
                <td className="py-3 font-semibold text-[#172033]">{row.name}</td>
                <td className="py-3 text-slate-500 font-semibold">{row.period}</td>
                <td className="py-3 font-bold text-[#172033]">{row.count}</td>
                <td className="py-3 font-bold">
                  {row.status === 'Active' ? (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">Active</span>
                  ) : (
                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px]">Disabled</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleOpenManage(row)}
                    className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 ml-auto"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Display */}
      <div className="pt-2 text-xs text-slate-400 font-medium">
        <span>Showing {filtered.length} report parameters</span>
      </div>

      {/* Interactive Manage Report Modal */}
      {managingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Manage Report — <span className="text-[#F97316]">{managingReport.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setManagingReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Aggregation Period *
                </label>
                <select
                  value={editPeriod}
                  onChange={(e) => setEditPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="Daily">Daily Summary</option>
                  <option value="Weekly">Weekly Aggregate</option>
                  <option value="Monthly">Monthly Analytics</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Report Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="Active">Active (Generating)</option>
                  <option value="Disabled">Disabled (Archived)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Save Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
