import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationsError,
  clearNotificationsSuccess
} from '@/redux/slices/notificationsSlice.js';
import {
  X,
  CheckCircle2,
  Bell,
  CheckCheck,
  Eye,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BellRing
} from 'lucide-react';

export const Notifications = () => {
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    page,
    pages,
    totalNotifications,
    loading,
    markingRead,
    markingReadId,
    markingAllRead,
    error,
    successMessage
  } = useSelector((state) => state.notifications);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingNotif, setViewingNotif] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Initial and reactive load on page change (API 32)
  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage }));
  }, [dispatch, currentPage]);

  const filtered = notifications.filter(
    (n) =>
      (n.title && n.title.toLowerCase().includes(search.toLowerCase())) ||
      (n.body && n.body.toLowerCase().includes(search.toLowerCase())) ||
      (n.category && n.category.toLowerCase().includes(search.toLowerCase())) ||
      (n.notificationId && n.notificationId.toLowerCase().includes(search.toLowerCase()))
  );

  // View Notification & Mark as Read (API 33)
  const handleOpenView = (notif) => {
    setViewingNotif(notif);
    // Mark as read using MongoDB _id if currently Unread
    if (notif.status === 'Unread' && notif._id) {
      dispatch(markNotificationAsRead(notif._id));
    }
  };

  // Mark All as Read (API 34)
  const handleMarkAllRead = async () => {
    try {
      const res = await dispatch(markAllNotificationsAsRead()).unwrap();
      setToastMessage(res?.message || 'All notifications marked as read!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Notification */}
      {(toastMessage || successMessage) && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage || successMessage}</span>
          </div>
          <button
            onClick={() => {
              setToastMessage('');
              dispatch(clearNotificationsSuccess());
            }}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
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
              onClick={() => dispatch(fetchNotifications({ page: currentPage }))}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => dispatch(clearNotificationsError())}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Search & Mark All Read Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications, alerts, categories..."
            className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={markingAllRead || unreadCount === 0}
          className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-xs whitespace-nowrap flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-colors"
          title="Mark all notifications as read"
        >
          {markingAllRead ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          <span>{markingAllRead ? 'Marking Read...' : 'Mark All Read'}</span>
        </button>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2.5">ID</th>
              <th className="pb-2.5">CATEGORY</th>
              <th className="pb-2.5">ALERT / TITLE</th>
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
                    <span className="text-xs font-semibold">Loading notifications...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <BellRing className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No notifications found</p>
                    <p className="text-[11px] text-slate-400">
                      {search
                        ? 'Try searching with another keyword.'
                        : 'Store orders, inventory alerts, and payout updates will appear here.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((n) => (
                <tr
                  key={n._id || n.notificationId || n.id}
                  className={`transition-colors ${
                    n.status === 'Unread'
                      ? 'bg-orange-50/40 hover:bg-orange-50/70 font-semibold'
                      : 'hover:bg-slate-50/70 text-slate-600'
                  }`}
                >
                  <td className="py-3 font-extrabold text-[#172033] font-mono text-[11px]">
                    {n.notificationId || n._id?.slice(-6) || 'NOTIF'}
                  </td>
                  <td className="py-3">
                    <span className="bg-orange-100 text-[#EA580C] font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                      {n.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3 text-[#172033]">
                    <div className="font-bold text-xs">{n.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md font-normal">
                      {n.body || n.message}
                    </div>
                  </td>
                  <td className="py-3 font-bold">
                    {n.status === 'Unread' ? (
                      <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center space-x-1.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        <span>Unread</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Read
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenView(n)}
                      className="text-[#F97316] font-bold hover:underline cursor-pointer flex items-center space-x-1 ml-auto px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Display & Pagination */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 text-slate-500 font-medium">
          <span>
            Showing <span className="font-bold text-[#172033]">{filtered.length}</span> of{' '}
            <span className="font-bold text-[#172033]">{totalNotifications || notifications.length}</span> notifications
            {pages > 1 && (
              <span className="text-slate-400 ml-1">
                (Page {page} of {pages})
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {Array.from({ length: Math.min(5, pages || 1) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
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
            onClick={() => setCurrentPage((prev) => Math.min(pages || 1, prev + 1))}
            disabled={currentPage >= (pages || 1) || loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
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
              <button
                onClick={() => setViewingNotif(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="bg-orange-100 text-[#EA580C] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {viewingNotif.category || 'General'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {viewingNotif.notificationId || viewingNotif._id}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-[#172033]">{viewingNotif.title}</h4>

              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-slate-600 leading-relaxed font-medium">
                {viewingNotif.body || viewingNotif.message || viewingNotif.title}
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
