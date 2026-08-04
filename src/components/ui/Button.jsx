import React from 'react';
import { cn } from '@/lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl cursor-pointer';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20',
    secondary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs',
    destructive: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
