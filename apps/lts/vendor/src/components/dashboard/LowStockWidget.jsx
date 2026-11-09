import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockProducts } from '@/data/mockData';
import { AlertTriangle } from 'lucide-react';

export function LowStockWidget({ onRestock }) {
  const lowStockItems = mockProducts.filter((p) => p.stock <= 10);

  return (
    <Card>
      <CardHeader title="Low Stock Alerts" subtitle="Items that require immediate inventory restock" />
      <CardContent className="space-y-3">
        {lowStockItems.map((prod) => (
          <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 gap-3">
            <div className="flex items-center gap-3">
              <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
              <div>
                <p className="font-semibold text-xs text-slate-900 line-clamp-1">{prod.name}</p>
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" /> Stock left: {prod.stock} units
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onRestock(prod.name)} className="bg-white hover:bg-rose-100 text-rose-700 text-xs">
              Restock
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
