import React, { useState } from 'react';
import { Shield, Search, Bell, CheckCircle2, RefreshCw, AlertTriangle, LogOut } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const TopNav = () => {
  const { searchQuery, setSearchQuery, alerts, logout, currentRole } = useSecurity();
  const [showNotifications, setShowNotifications] = useState(false);

  const rolePills = [
    { id: 'ADMIN', label: 'SOC ADMIN' },
    { id: 'ANALYST', label: 'ANALYST' },
    { id: 'DEVOPS', label: 'DEVOPS' }
  ];

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-900 text-emerald-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base font-sans tracking-tight text-slate-900">ZeroShield</h1>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
              v3.4
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider">
            ZERO-TRUST IDENTITY VERIFIED
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center relative w-80">
        <Search className="w-4 h-4 absolute left-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search secure records..."
          className="w-full bg-slate-100/90 border border-slate-200 rounded-full pl-10 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all font-sans"
        />
        <kbd className="absolute right-3.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-200 rounded-md">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls: Static Role Status Indicator */}
      <div className="flex items-center gap-3">
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

        {/* Refresh button */}
        <button
          onClick={() => window.location.reload()}
          title="Refresh Telemetry"
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Verified Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>SIGNATURE-VERIFIED</span>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 relative transition-all"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-lg border border-slate-200 p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">Security Alerts ({alerts.length})</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-mono"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {alerts.slice(0, 5).map((alt) => (
                  <div key={alt.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
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

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            A
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
