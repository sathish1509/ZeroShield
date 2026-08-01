import React from 'react';

export const GlassCard = ({ children, className = '', glow = false, danger = false, dark = false, onClick }) => {
  let styleClass = "glass-panel rounded-2xl p-5 transition-all duration-200 hover:shadow-md";

  if (dark) {
    styleClass = "dark-hero-card rounded-2xl p-5 shadow-lg transition-all duration-200";
  } else if (glow) {
    styleClass = "glass-panel-glow rounded-2xl p-5 transition-all duration-200";
  } else if (danger) {
    styleClass = "glass-panel-danger rounded-2xl p-5 animate-attack-alert transition-all duration-200";
  }

  return (
    <div onClick={onClick} className={`${styleClass} ${className}`}>
      {children}
    </div>
  );
};
