import React, { useState } from 'react';
import { vendorCustomers as initialCustomers } from '@/data/vendorMockData';
import { X, CheckCircle2, UserCheck, Download, Settings2 } from 'lucide-react';

export const Customers = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [managingCustomer, setManagingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [toastMessage, setToastMessage] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenManage = (cust) => {
    setManagingCustomer(cust);
    setEditName(cust.name);
    setEditPhone(cust.phone);
    setEditStatus(cust.status);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!managingCustomer) return;

    const updated = customers.map((c) => {
      if (c.id === managingCustomer.id) {
        return {
          ...c,
          name: editName,
          phone: editPhone,
          status: editStatus
        };
      }
      return c;
    });

    setCustomers(updated);
    setManagingCustomer(null);
    setToastMessage(`Customer "${editName}" updated successfully!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Customer Name', 'Phone', 'Total Orders', 'Total Spent (INR)', 'Status'];
    const rows = customers.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      c.ordersCount || 12,
      c.totalSpent || 4850,
      `"${c.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lts_vendor_customers_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported customer database CSV successfully!');
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

      {/* Top Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer / mobile / email..."
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

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">ID</th>
              <th className="pb-2.5">CUSTOMER</th>
              <th className="pb-2.5">PHONE</th>
              <th className="pb-2.5">STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 font-extrabold text-[#172033]">{c.id}</td>
                <td className="py-3 font-semibold text-[#172033]">{c.name}</td>
                <td className="py-3 text-slate-500 font-semibold">{c.phone}</td>
                <td className="py-3 font-bold">
                  {c.status === 'Active' ? (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">Active</span>
                  ) : (
                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px]">Disabled</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleOpenManage(c)}
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
        <span>Showing {filtered.length} customers</span>
      </div>

      {/* Interactive Manage Customer Modal */}
      {managingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Manage Customer — <span className="text-[#F97316]">{managingCustomer.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setManagingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Customer Name *
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
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Account Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="Active">Active (Enabled)</option>
                  <option value="Disabled">Disabled (Suspended)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
