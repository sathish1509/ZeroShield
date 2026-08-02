import React from 'react';
import { GlassCard } from './GlassCard';
import { ShieldAlert, AlertOctagon, Clock, ShieldX, Globe, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { Badge } from './Badge';

export const RecentAlertsCard = () => {
  const { alerts, openAiModal } = useSecurity();

  const getThreatIcon = (type) => {
    if (type.includes('SQL')) return <ShieldX className="w-4 h-4 text-red-600" />;
    if (type.includes('JWT')) return <AlertOctagon className="w-4 h-4 text-amber-600" />;
    if (type.includes('Geo')) return <Globe className="w-4 h-4 text-purple-600" />;
    if (type.includes('Rate')) return <Zap className="w-4 h-4 text-cyan-600" />;
    return <ShieldAlert className="w-4 h-4 text-red-600" />;
  };

  return (
    <GlassCard className="h-full flex flex-col justify-between border border-slate-200">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold font-mono text-slate-900">Recent Security Alerts</h2>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            {alerts.length} Incidents
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              onClick={() => openAiModal(alert)}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 transition-all flex items-start gap-3 group cursor-pointer"
              title="Click for Gemini AI Threat Analysis & RCA"
            >
              <div className="p-2 rounded-lg bg-red-100 shrink-0 mt-0.5">
                {getThreatIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold font-mono text-slate-900 truncate flex items-center gap-1">
                    <span>{alert.type}</span>
                    <Sparkles className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>
                <p className="text-[11px] font-mono text-slate-500 truncate mb-1">
                  <span className="text-slate-400">Target: </span>{alert.service}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 truncate max-w-[140px]" title={alert.reason}>
                    {alert.reason}
                  </span>
                  <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1">
                    AI RCA →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 mt-2 flex justify-between items-center text-xs font-mono">
        <span className="text-slate-500">SOC Auto-Mitigation:</span>
        <span className="text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Active Guardrails
        </span>
      </div>
    </GlassCard>
  );
};
