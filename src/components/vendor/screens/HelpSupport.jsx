import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTickets,
  fetchTicketDetail,
  createSupportTicket,
  replyToTicket,
  clearTicketsError,
  clearTicketsSuccess,
  clearCurrentTicket
} from '@/redux/slices/ticketsSlice.js';
import {
  PhoneCall,
  Mail,
  UserCheck,
  Clock,
  Plus,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Send,
  Eye,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LifeBuoy
} from 'lucide-react';

export const HelpSupport = () => {
  const dispatch = useDispatch();
  const {
    tickets,
    currentTicket,
    page,
    pages,
    totalTickets,
    loading,
    detailLoading,
    creating,
    replying,
    error,
    successMessage
  } = useSelector((state) => state.tickets);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Raise Ticket Form State
  const [ticketCategory, setTicketCategory] = useState('Payout & Settlement');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('High Priority');
  const [ticketDescription, setTicketDescription] = useState('');

  // Reply in ticket state
  const [replyText, setReplyText] = useState('');

  // Initial and reactive load on page change (API 35)
  useEffect(() => {
    dispatch(fetchTickets({ page: currentPage }));
  }, [dispatch, currentPage]);

  const filteredTickets = tickets.filter(
    (t) =>
      (t.ticketId && t.ticketId.toLowerCase().includes(search.toLowerCase())) ||
      (t.id && t.id.toLowerCase().includes(search.toLowerCase())) ||
      (t.subject && t.subject.toLowerCase().includes(search.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignedAgent && t.assignedAgent.toLowerCase().includes(search.toLowerCase()))
  );

  // Open Ticket Detail Modal (API 36)
  const handleOpenView = (tkt) => {
    const tktId = tkt.ticketId || tkt.id;
    setViewingTicket(tkt);
    if (tktId) {
      dispatch(fetchTicketDetail(tktId));
    }
  };

  const handleCloseView = () => {
    setViewingTicket(null);
    dispatch(clearCurrentTicket());
    setReplyText('');
  };

  // Raise Support Ticket (API 37)
  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    try {
      const res = await dispatch(
        createSupportTicket({
          category: ticketCategory,
          subject: ticketSubject.trim(),
          description: ticketDescription.trim(),
          priority: ticketPriority
        })
      ).unwrap();

      setShowRaiseModal(false);
      setTicketSubject('');
      setTicketDescription('');
      setToastMessage(`Support Ticket ${res?.ticketId || ''} created successfully!`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Create ticket error:', err);
    }
  };

  // Reply to Ticket (API 38)
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !viewingTicket) return;

    const targetTicketId =
      currentTicket?.ticketId || viewingTicket.ticketId || viewingTicket.id;

    try {
      await dispatch(
        replyToTicket({
          ticketId: targetTicketId,
          message: replyText.trim()
        })
      ).unwrap();

      setReplyText('');
      setToastMessage('Reply submitted to support team!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('Reply to ticket error:', err);
    }
  };

  const faqs = [
    {
      q: 'How are weekly vendor settlements processed?',
      a: 'All merchant settlements are calculated every Sunday midnight and transferred directly to your registered bank account every Monday by 09:00 AM via NEFT/RTGS.'
    },
    {
      q: 'How do I request product category or tag updates?',
      a: 'You can raise a support ticket under "Product Catalog Listing" specifying the new category name. Our catalog audit team approves listing tags within 2 hours.'
    },
    {
      q: 'What are the SLA guidelines for logistics pickup?',
      a: 'Our partner logistics riders arrive within a 45-minute pickup window after an order status is set to "Confirmed & Packed" by the vendor.'
    },
    {
      q: 'How can I upgrade my vendor store verification badge?',
      a: 'Store verification badges are awarded to vendors with a 4.5+ star rating, less than 1% cancellation rate, and complete FSSAI/GST documentation.'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
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
              dispatch(clearTicketsSuccess());
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
              onClick={() => dispatch(fetchTickets({ page: currentPage }))}
              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => dispatch(clearTicketsError())}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Merchant Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Channel 1: 24/7 Helpline */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center flex-shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">24/7 HELPLINE</span>
            <p className="text-xs font-black text-[#F97316] mt-0.5">1800-420-9900</p>
            <span className="text-[9px] text-slate-500 font-semibold block">Toll-Free Priority Support</span>
          </div>
        </div>

        {/* Channel 2: Support Email */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OFFICIAL EMAIL</span>
            <p className="text-xs font-black text-[#172033] mt-0.5 truncate">support@localtradestreet.com</p>
            <span className="text-[9px] text-slate-500 font-semibold block">Written Assistance</span>
          </div>
        </div>

        {/* Channel 3: Account Manager */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACCOUNT MANAGER</span>
            <p className="text-xs font-black text-[#172033] mt-0.5">Priya Sharma</p>
            <span className="text-[9px] text-purple-700 font-extrabold block">+91 98765 12345</span>
          </div>
        </div>

        {/* Channel 4: Support Response SLA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RESPONSE SLA</span>
            <p className="text-xs font-black text-emerald-600 mt-0.5">&lt; 15 Minutes</p>
            <span className="text-[9px] text-slate-500 font-semibold block">Fast Resolution Time</span>
          </div>
        </div>
      </div>

      {/* Support Tickets Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#172033]">Active Support Tickets</h3>
            <p className="text-xs text-slate-400 font-semibold">Track and manage your submitted merchant queries</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket ID, subject..."
              className="px-3.5 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <button
              onClick={() => setShowRaiseModal(true)}
              className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Raise Ticket</span>
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="pb-2.5">TICKET ID</th>
                <th className="pb-2.5">CATEGORY</th>
                <th className="pb-2.5">SUBJECT</th>
                <th className="pb-2.5">PRIORITY</th>
                <th className="pb-2.5">STATUS</th>
                <th className="pb-2.5">ASSIGNED AGENT</th>
                <th className="pb-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                      <span className="text-xs font-semibold">Loading support tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <LifeBuoy className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No support tickets found</p>
                      <p className="text-[11px] text-slate-400">
                        {search
                          ? 'Try searching with another query.'
                          : 'Click "+ Raise Ticket" above to submit a new merchant query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((tkt) => (
                  <tr key={tkt.ticketId || tkt._id || tkt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-extrabold text-[#172033] font-mono text-[11px]">
                      {tkt.ticketId || tkt.id}
                    </td>
                    <td className="py-3">
                      <span className="bg-orange-50 text-[#F97316] font-extrabold text-[10px] px-2 py-0.5 rounded">
                        {tkt.category}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-[#172033]">
                      <span className="truncate max-w-[220px] block">{tkt.subject}</span>
                    </td>
                    <td className="py-3 font-bold">
                      {tkt.priority?.toLowerCase().includes('urgent') && (
                        <span className="text-rose-600 font-extrabold">Urgent Priority</span>
                      )}
                      {tkt.priority?.toLowerCase().includes('high') && (
                        <span className="text-orange-600 font-extrabold">High Priority</span>
                      )}
                      {tkt.priority?.toLowerCase().includes('medium') && (
                        <span className="text-blue-600 font-extrabold">Medium Priority</span>
                      )}
                      {tkt.priority?.toLowerCase().includes('low') && (
                        <span className="text-slate-500 font-semibold">Low Priority</span>
                      )}
                      {!['urgent', 'high', 'medium', 'low'].some((p) =>
                        tkt.priority?.toLowerCase().includes(p)
                      ) && <span>{tkt.priority || 'Normal'}</span>}
                    </td>
                    <td className="py-3 font-bold">
                      {tkt.status === 'Open' && (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          Open
                        </span>
                      )}
                      {tkt.status === 'In Progress' && (
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          In Progress
                        </span>
                      )}
                      {tkt.status === 'Resolved' && (
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                          Resolved
                        </span>
                      )}
                      {!['Open', 'In Progress', 'Resolved'].includes(tkt.status) && (
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {tkt.status || 'Active'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 font-medium text-[11px]">
                      {tkt.assignedAgent || 'Priya Sharma'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleOpenView(tkt)}
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
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <span className="font-bold text-[#172033]">{filteredTickets.length}</span> of{' '}
            <span className="font-bold text-[#172033]">{totalTickets || tickets.length}</span> tickets
            {pages > 1 && (
              <span className="text-slate-400 ml-1">
                (Page {page} of {pages})
              </span>
            )}
          </span>

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
      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-[#F97316]" />
          <h3 className="text-sm font-extrabold text-[#172033]">Merchant Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="border border-slate-200/80 rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-3.5 text-left font-extrabold text-[#172033] bg-[#F8FAFC] hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white text-slate-600 font-medium leading-relaxed border-t border-slate-100 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Raise Ticket Modal Dialog (API 37) */}
      {showRaiseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">Raise Support Ticket</h3>
              </div>
              <button
                onClick={() => setShowRaiseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Ticket Category *
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                >
                  <option value="Payout & Settlement">Payout & Settlement</option>
                  <option value="Order Dispatch & Logistics">Order Dispatch & Logistics</option>
                  <option value="Product Catalog Listing">Product Catalog Listing</option>
                  <option value="Account & Verification">Account & Verification</option>
                  <option value="Technical Glitch">Technical Glitch</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief summary of issue..."
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Priority Level *
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                >
                  <option value="Low Priority">Low Priority</option>
                  <option value="Medium Priority">Medium Priority</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Urgent Priority">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-[#172033] uppercase tracking-wider mb-1">
                  Detailed Description *
                </label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide all necessary details so our support team can assist you quickly..."
                  className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRaiseModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Support Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Ticket Details & Reply Modal (APIs 36 & 38) */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#F97316]" />
                <h3 className="text-base font-extrabold text-[#172033]">
                  Ticket — <span className="font-mono text-[#F97316]">{currentTicket?.ticketId || viewingTicket.ticketId || viewingTicket.id}</span>
                </h3>
              </div>
              <button
                onClick={handleCloseView}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
                  <span className="text-xs font-semibold">Loading ticket conversation...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="bg-orange-100 text-[#EA580C] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    {currentTicket?.category || viewingTicket.category}
                  </span>
                  <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {currentTicket?.status || viewingTicket.status || 'In Progress'}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-[#172033]">
                  {currentTicket?.subject || viewingTicket.subject}
                </h4>

                {/* Main Ticket Description */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-medium space-y-2">
                  <p>{currentTicket?.description || viewingTicket.description || viewingTicket.message}</p>
                  <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Support Agent assigned: {currentTicket?.assignedAgent || viewingTicket.assignedAgent || 'Priya Sharma'}</span>
                  </div>
                </div>

                {/* Conversation Thread / Replies */}
                {currentTicket?.replies && currentTicket.replies.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Conversation Thread ({currentTicket.replies.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentTicket.replies.map((reply, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            reply.sender === 'Vendor'
                              ? 'bg-orange-50/70 border-orange-200 ml-4'
                              : 'bg-slate-50 border-slate-200 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 font-bold">
                            <span className={reply.sender === 'Vendor' ? 'text-[#F97316]' : 'text-blue-700'}>
                              {reply.sender || 'Support Team'}
                            </span>
                            {reply.timestamp && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 font-medium">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Reply Form (API 38) */}
                <form onSubmit={handleAddReply} className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-extrabold text-[#172033] uppercase tracking-wider text-[11px]">
                    Add Reply / Note to Support Team
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder="Type your message..."
                    className="w-full p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCloseView}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={replying}
                      className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      {replying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
