import React from 'react';
import { cn } from '@/lib/utils';

export function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative flex items-center">
        {Icon && <Icon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />}
        <input
          className={cn(
            'w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
            Icon ? 'pl-9 pr-3' : 'px-3.5',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
