import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface StatusBannerProps {
  status: 'idle' | 'success' | 'warning' | 'error';
  message: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, message }) => {
  if (status === 'idle') {
    return (
      <div className="flex items-center gap-3 p-3.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm">
        <Info className="w-5 h-5 text-slate-500 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm shadow-sm animate-fadeIn">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
    );
  }

  if (status === 'warning') {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs sm:text-sm shadow-sm animate-fadeIn">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm shadow-sm animate-fadeIn">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
};
