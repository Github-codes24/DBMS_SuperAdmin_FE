import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KpiCard({ title, value, change, isPositive, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md',
                  isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                )}
              >
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {change}
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        <div className={cn('p-3 rounded-2xl border', colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
