import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const Toast = () => {
  const { toastMessage } = useSecurity();

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const icons = {
    error: <ShieldAlert className="w-5 h-5 text-red-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const borderColors = {
    error: 'border-red-500/50 bg-slate-900/90 text-red-200 glow-red',
    success: 'border-emerald-500/50 bg-slate-900/90 text-emerald-200 glow-green',
    warning: 'border-amber-500/50 bg-slate-900/90 text-amber-200',
    info: 'border-blue-500/50 bg-slate-900/90 text-blue-200 glow-blue'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${borderColors[type] || borderColors.info}`}>
        {icons[type] || icons.info}
        <span className="text-sm font-medium tracking-wide">{message}</span>
      </div>
    </div>
  );
};
