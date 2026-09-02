import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCustomers,
  updateCustomer,
  exportCustomersCsv,
  clearCustomersError
} from '@/redux/slices/customersSlice.js';
import {
  X,
  CheckCircle2,
  UserCheck,
  Download,
  Settings2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users
} from 'lucide-react';

export const Customers = () => {
  const dispatch = useDispatch();
  const {
    customers,
    pagination,
    loading,
    updateLoading,
    exportLoading,
    error
  } = useSelector((state) => state.customers);

  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Manage Customer Modal & Toast State
  const [managingCustomer, setManagingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [toastMessage, setToastMessage] = useState('');

  // Initial and reactive load on search / page change (API 20)
  useEffect(() => {
    dispatch(fetchCustomers({ page, search }));
  }, [dispatch, page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleOpenManage = (cust) => {
    setManagingCustomer(cust);
    setEditName(cust.name || '');
    setEditMobile(cust.mobile || cust.phone || '');
    setEditStatus(cust.status || 'Active');
  };

  // Update Customer Details (API 21)
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!managingCustomer) return;

    try {
      await dispatch(
        updateCustomer({
          customerId: managingCustomer.customerId,
          name: editName.trim(),
          mobile: editMobile.trim(),
          status: editStatus
        })
      ).unwrap();

      setToastMessage(`Customer "${editName}" updated successfully!`);
      setManagingCustomer(null);
      dispatch(fetchCustomers({ page, search }));
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Update customer error:', err);
    }
  };

  // Export Customers CSV (API 22)
  const handleExportCSV = async () => {
    try {
      const res = await dispatch(exportCustomersCsv()).unwrap();
      setToastMessage(`Exported "${res.filename}" successfully!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      setToastMessage(typeof err === 'string' ? err : 'Failed to export customers CSV');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch(fetchCustomers({ page, search }))}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => dispatch(clearCustomersError())}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search customer by name (e.g. Aarav), ID, or mobile number..."
            className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="px-3.5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-colors"
          title="Export Customers CSV File"
        >
          {exportLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">ID</th>
              <th className="pb-2.5">CUSTOMER</th>
              <th className="pb-2.5">PHONE / MOBILE</th>
              <th className="pb-2.5">STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                    <span className="text-xs font-semibold">Loading customer database...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No customers found</p>
                    <p className="text-[11px] text-slate-400">
                      {search
                        ? 'Try searching with a different name or mobile keyword.'
                        : 'Customer profiles from your store orders will appear here.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.customerId || c.id || c._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-extrabold text-[#172033] font-mono">{c.customerId || c.id}</td>
                  <td className="py-3 font-semibold text-[#172033]">{c.name}</td>
                  <td className="py-3 text-slate-500 font-semibold">{c.mobile || c.phone}</td>
                  <td className="py-3 font-bold">
                    {c.status === 'Active' ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                        {c.status || 'Disabled'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenManage(c)}
                      className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 ml-auto px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination & Counts Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">
          Showing <span className="font-bold text-[#172033]">{customers.length}</span> of{' '}
          <span className="font-bold text-[#172033]">{pagination.totalCustomers || customers.length}</span> customers
          {pagination.pages > 1 && (
            <span className="text-slate-400 ml-1">
              (Page {pagination.page} of {pagination.pages})
            </span>
          )}
        </span>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {Array.from({ length: Math.min(5, pagination.pages || 1) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((prev) => Math.min(pagination.pages || 1, prev + 1))}
            disabled={page >= (pagination.pages || 1) || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Manage Customer Modal (API 21) */}
      {managingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Manage Customer — <span className="font-mono text-[#F97316]">{managingCustomer.customerId || managingCustomer.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setManagingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
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
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                >
                  <option value="Active">Active (Enabled)</option>
                  <option value="Disabled">Disabled (Suspended)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
