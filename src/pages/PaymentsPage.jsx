import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { mockPayments, mockRefundRequests } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, IndianRupee, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

export function PaymentsPage() {
  const [refunds, setRefunds] = useState(mockRefundRequests);

  const handleRefundAction = (id, newStatus) => {
    setRefunds(refunds.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success': return <Badge variant="success">Success</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Refunded': return <Badge variant="danger">Refunded</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Payments & Revenue" subtitle="Financial transaction history, gateway logs, and refund approvals" />

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Processed" value={formatCurrency(478900)} change="+14%" isPositive={true} icon={IndianRupee} color="green" />
        <KpiCard title="Pending Vendor Payouts" value={formatCurrency(68200)} change="-4%" isPositive={true} icon={CreditCard} color="amber" />
        <KpiCard title="Refund Requests" value={formatCurrency(2410)} change="+2%" isPositive={false} icon={ArrowUpRight} color="purple" />
      </div>

      {/* Refund Requests Section */}
      <Card>
        <CardHeader title="Refund & Disputed Requests" subtitle="Review and approve customer refund claims" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Request ID</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{ref.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-blue-600">{ref.orderId}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{ref.customer}</td>
                    <td className="px-5 py-3.5 font-bold text-rose-600">{formatCurrency(ref.amount)}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs">{ref.reason}</td>
                    <td className="px-5 py-3.5">
                      {ref.status === 'Approved' ? (
                        <Badge variant="success">Approved</Badge>
                      ) : ref.status === 'Rejected' ? (
                        <Badge variant="danger">Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Under Review</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {ref.status === 'Under Review' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleRefundAction(ref.id, 'Approved')}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRefundAction(ref.id, 'Rejected')} className="text-rose-600 hover:bg-rose-50">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Table */}
      <Card>
        <CardHeader title="Transaction History Logs" subtitle="Live gateway logs for UPI, Cards, and Net Banking" />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Txn ID</th>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{p.id}</td>
                    <td className="px-5 py-3.5 text-blue-600 font-medium">{p.orderId}</td>
                    <td className="px-5 py-3.5 text-slate-800">{p.customer}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.date}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{p.method}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5">{getStatusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
