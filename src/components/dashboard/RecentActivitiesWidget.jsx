import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { mockActivities } from '@/data/mockData';
import { Activity } from 'lucide-react';

export function RecentActivitiesWidget() {
  return (
    <Card>
      <CardHeader title="Recent Platform Activity" subtitle="Live logs from vendors, buyers & admins" />
      <CardContent>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {mockActivities.map((act) => (
            <div key={act.id} className="relative flex flex-col gap-0.5">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
              <p className="text-xs font-semibold text-slate-800">{act.action}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{act.user}</span>
                <span>•</span>
                <span>{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
