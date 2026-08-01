import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Network,
  ShieldAlert,
  Sliders,
  FileText,
  BarChart3,
  Zap,
  Settings,
  Key,
  RotateCcw,
  Lock,
  HelpCircle
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const Sidebar = () => {
  const { currentPage, setCurrentPage, isSimulating, stopSimulation, checkPageAccess } = useSecurity();

  const navItems = [
    { id: 'dashboard', label: 'VAULT', icon: LayoutDashboard },
    { id: 'traffic', label: 'LIVE TRAFFIC', icon: Activity },
    { id: 'topology', label: 'SERVICE MESH', icon: Network },
    { id: 'threats', label: 'THREAT DETECTION', icon: ShieldAlert },
    { id: 'policies', label: 'POLICY ENGINE', icon: Sliders },
    { id: 'audit', label: 'AUDIT LOGS', icon: FileText },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'simulation', label: 'ATTACK SIMULATION', icon: Zap, highlight: true },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col justify-between p-4 shrink-0 hidden md:flex">
      <div className="space-y-4">
        {/* Identity Verified Badge Card */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-slate-900 text-white">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs font-mono tracking-wide text-slate-900 uppercase">ZEROSHIELD VAULT</h3>
            <p className="text-[10px] text-emerald-600 font-bold font-mono">Identity Verified</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isHighlight = item.highlight;
            const accessLevel = checkPageAccess(item.id);

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'mint-active-pill'
                    : accessLevel === 'RESTRICTED'
                    ? 'text-slate-400 hover:bg-slate-200/50 opacity-70'
                    : isHighlight && isSimulating
                    ? 'bg-red-500 text-white shadow-md animate-pulse'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {accessLevel === 'RESTRICTED' ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  )}
                  <span>{item.label}</span>
                </div>

                {accessLevel === 'RESTRICTED' && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-slate-200 text-slate-500">
                    RESTRICTED
                  </span>
                )}

                {accessLevel === 'VIEW_ONLY' && !isActive && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                    VIEW ONLY
                  </span>
                )}

                {isHighlight && accessLevel === 'ALLOWED' && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    WAR-ROOM
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls & Footer */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <button
          onClick={stopSimulation}
          className="w-full py-2.5 px-4 rounded-xl black-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>+ RESET & PURGE THREATS</span>
        </button>

        <div className="space-y-2 pt-2 text-[11px] font-mono font-bold text-slate-500">
          <button
            onClick={() => setCurrentPage('settings')}
            className="flex items-center gap-2 hover:text-slate-900 w-full text-left cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SECURITY SETTINGS</span>
          </button>
          <div className="flex items-center gap-2 hover:text-slate-900 cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>SUPPORT & DOCS</span>
          </div>
        </div>

        <div className="text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-2 flex justify-between">
          <span>ZT-LEDGER-V4.02</span>
          <span>SHARD-AP-SOUTH-1</span>
        </div>
      </div>
    </aside>
  );
};
