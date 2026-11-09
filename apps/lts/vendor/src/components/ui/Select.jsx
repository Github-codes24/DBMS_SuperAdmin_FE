import React from 'react';
import { cn } from '@/lib/utils';

export function Select({ label, options = [], error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        className={cn(
          'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer',
          error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10',
          className
        )}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
