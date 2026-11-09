import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export function BackButton({ onClick, label = 'Back' }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="mb-4 text-slate-600">
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
