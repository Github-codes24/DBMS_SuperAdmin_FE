import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockNotifications } from '@/data/mockData';
import { Bell, CheckCircle2, Trash2, Filter } from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('All');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    return true;
  });

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  return (
    <div className="space-y-6">
      <Header title="Notifications & System Alerts" subtitle="Stay updated with vendor requests, order surges, and stock alerts">
        <Button variant="ghost" onClick={markAllRead}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mark All Read
        </Button>
        <Button variant="ghost" onClick={clearAll} className="text-rose-600 hover:bg-rose-50">
          <Trash2 className="w-4 h-4" /> Clear Notifications
        </Button>
      </Header>

      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter by status:</span>
          {['All', 'Unread', 'Read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No notifications available.</div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => toggleRead(n.id)}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  n.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70 font-medium'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                      {!n.read && <Badge variant="info">New</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    <span className="text-[11px] text-slate-400 mt-2 block">{n.time}</span>
                  </div>
                </div>
                <button className="text-xs font-semibold text-slate-400 hover:text-blue-600">
                  {n.read ? 'Mark Unread' : 'Mark Read'}
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
