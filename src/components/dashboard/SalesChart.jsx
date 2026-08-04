import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { salesChartData } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';

export function SalesChart() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader
        title="Monthly Sales Performance"
        subtitle="Revenue growth and order volume over the last 7 months"
      />
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
