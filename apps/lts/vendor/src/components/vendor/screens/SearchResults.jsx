import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';

export const SearchResults = ({ query, onBack }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#F97316] mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-[#F97316]" />
        <h2 className="text-lg font-bold text-[#172033]">
          Search results for "{query}"
        </h2>
      </div>

      {/*
        TODO: Replace this placeholder with real matching against your
        vendors/products/orders/customers data source (Redux slice or API call).
        Example shape once wired up:

        const results = useSelector(state => selectSearchResults(state, query));
      */}
      <div className="py-16 text-center text-slate-400 text-sm">
        No results source connected yet — wire this screen up to your
        products/orders/customers data to show real matches for "{query}".
      </div>
    </div>
  );
};