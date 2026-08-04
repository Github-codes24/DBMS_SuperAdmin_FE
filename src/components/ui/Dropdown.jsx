import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Dropdown({ trigger, children, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 border border-slate-100 animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

Dropdown.Item = function DropdownItem({ children, onSelect, destructive, className }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left',
        destructive
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        className
      )}
    >
      {children}
    </button>
  );
};
