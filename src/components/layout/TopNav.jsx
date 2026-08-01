import React, { useState } from 'react';
import { Shield, Search, Bell, RefreshCw, AlertTriangle, LogOut, User } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const TopNav = () => {
  const { searchQuery, setSearchQuery, alerts, logout, currentRole, ROLES } = useSecurity();
  const [showNotifications, setShowNotifications] = useState(false);

  const rolePills = [
    { id: 'ADMIN', label: 'SOC ADMIN' },
    { id: 'ANALYST', label: 'ANALYST' },
    { id: 'DEVOPS', label: 'DEVOPS' }
  ];

  const activeRoleObj = ROLES[currentRole] || ROLES.ADMIN;

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
      {/* 1. Left Brand Section */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base font-sans tracking-tight text-slate-900 leading-none">ZeroShield</h1>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              v3.4
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mt-0.5">
            SOC COMMAND CENTER
          </p>
        </div>
      </div>

      {/* 2. Middle Search Bar (Centered & Clean Width) */}
      <div className="hidden md:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search endpoints, IP records, security logs (Press ⌘K)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-12 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 transition-all font-sans"
        />
        <kbd className="absolute right-3 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-200/80 rounded-md pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* 3. Right Action Controls & User Profile (Aligned Horizontal Row) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Static Role Status Indicator Pill */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-full text-[11px] font-bold font-mono border border-slate-200 select-none">
          {rolePills.map((role) => (
            <span
              key={role.id}
              className={`px-3 py-1 rounded-full transition-all ${
                currentRole === role.id ? 'bg-slate-900 text-white shadow-xs font-extrabold' : 'text-slate-500'
              }`}
            >
              {role.label}
            </span>
          ))}
        </div>

        {/* Refresh Telemetry Button */}
        <button
          onClick={() => window.location.reload()}
          title="Refresh Telemetry Data"
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Icon with Drawer */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="View Security Alerts"
            className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-all cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {alerts.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Security Alerts ({alerts.length})</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-mono font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {alerts.slice(0, 5).map((alt) => (
                  <div key={alt.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900">{alt.type}</span>
                        <span className="text-[10px] font-mono text-slate-400">{alt.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{alt.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Avatar & Role Summary */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {activeRoleObj.name.charAt(0)}
          </div>
          <div className="hidden xl:block text-left font-sans">
            <p className="text-xs font-bold text-slate-900 leading-none">{activeRoleObj.name}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{currentRole.toLowerCase()}@zeroshield.io</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
