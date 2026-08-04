import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { mockVendors } from '@/data/mockData';
import { Star, Store } from 'lucide-react';

export function TopVendorsWidget() {
  return (
    <Card>
      <CardHeader title="Top Performing Vendors" subtitle="Based on rating & monthly sales volume" />
      <CardContent className="space-y-4">
        {mockVendors.slice(0, 4).map((vendor) => (
          <div key={vendor.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-slate-900">{vendor.shopName}</p>
                <p className="text-[11px] text-slate-500">{vendor.name} • {vendor.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-700 text-xs font-bold border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{vendor.rating}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
