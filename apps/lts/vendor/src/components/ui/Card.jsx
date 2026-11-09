import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className, children }) {
  return (
    <div className={cn('p-5 border-b border-slate-100 flex items-center justify-between gap-4', className)}>
      <div>
        {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={cn('p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-sm', className)}>{children}</div>;
}
