import React, { useState } from 'react';
import { vendorNotifications as initialNotifs } from '@/data/vendorMockData';
import { X, CheckCircle2, Bell, CheckCheck, Eye } from 'lucide-react';

export const Notifications = () => {
  const [notifs, setNotifs] = useState(
    initialNotifs || [
      { id: '1', title: 'New Order Received #ORD-9401', time: '10:21 AM', category: 'Orders', message: 'Order #ORD-9401 for ₹1,938 placed by Aarav Mehta.', unread: true },
      { id: '2', title: 'Low Stock Alert for Coconut Oil', time: '10:31 AM', category: 'Inventory', message: 'Cold Pressed Coconut Oil has 8 units remaining.', unread: true },
      { id: '3', title: 'Weekly Payout Credited', time: '10:35 AM', category: 'Payments', message: '₹84,250 transferred to your HDFC bank account.', unread: false }
    ]
  );

  const [search, setSearch] = useState('');
  const [viewingNotif, setViewingNotif] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const filtered = notifs.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.category && n.category.toLowerCase().includes(search.toLowerCase()))
  );

  const unreadCount = notifs.filter((n) => n.unread).length;

  const handleOpenView = (notif) => {
    setViewingNotif(notif);
    // Mark this specific notification as read
    const updated = notifs.map((n) => (n.id === notif.id ? { ...n, unread: false } : n));
    setNotifs(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, unread: false }));
    setNotifs(updated);
    setToastMessage('All notifications marked as read!');
    setTimeout(() => setToastMessage(''), 3000);
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
          placeholder="Search notifications, alerts, orders..."
          className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">TIME</th>
              <th className="pb-2.5">CATEGORY</th>
              <th className="pb-2.5">ALERT / TITLE</th>
              <th className="pb-2.5">STATUS</th>
              <th className="pb-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 text-slate-400 font-semibold">{n.time}</td>
                <td className="py-3">
                  <span className="bg-orange-50 text-[#F97316] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                    {n.category || 'General'}
                  </span>
                </td>
                <td className="py-3 font-semibold text-[#172033]">
                  <span className="truncate max-w-xs block">{n.title}</span>
                </td>
                <td className="py-3 font-bold">
                  {n.unread ? (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      <span>Unread</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">Read</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleOpenView(n)}
                    className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Display */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Showing {filtered.length} notifications</span>
        {unreadCount > 0 && <span className="text-[#F97316] font-extrabold">{unreadCount} unread alert(s)</span>}
      </div>

      {/* Interactive View Notification Modal */}
      {viewingNotif && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">Notification Details</h3>
              </div>
              <button onClick={() => setViewingNotif(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="bg-orange-100 text-[#EA580C] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {viewingNotif.category || 'General'}
                </span>
                <span className="text-slate-400 font-medium">{viewingNotif.time}</span>
              </div>

              <h4 className="text-sm font-extrabold text-[#172033]">{viewingNotif.title}</h4>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-slate-600 leading-relaxed font-medium">
                {viewingNotif.message || viewingNotif.title}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewingNotif(null)}
                  className="px-5 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
