import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const base = "inline-flex items-center font-mono font-semibold rounded-full border shadow-sm transition-all";
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  const variants = {
    allowed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-green",
    blocked: "bg-red-500/10 text-red-400 border-red-500/30 glow-red",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30 glow-blue",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 glow-cyan",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    default: "bg-slate-800 text-slate-300 border-slate-700"
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};
