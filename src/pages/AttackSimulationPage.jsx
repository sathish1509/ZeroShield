import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Zap, ShieldAlert, AlertTriangle, ShieldCheck, Radio, Terminal, Cpu, Flame } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const AttackSimulationPage = () => {
  const { isSimulating, activeSimulation, triggerAttack, stopSimulation } = useSecurity();

  const attackVectors = [
    { id: 'sqli', title: 'SQL Injection Attack', icon: ShieldAlert, desc: "Inject ' OR '1'='1 into /api/v1/orders query parameters.", color: 'red' },
    { id: 'jwt', title: 'Expired JWT Token Replay', icon: AlertTriangle, desc: 'Replay captured JWT authorization token after expiration window.', color: 'amber' },
    { id: 'geo', title: 'Geo-Fencing Attack', icon: Radio, desc: 'Simulate connection attempt from blocked geographic IP location (RU/CN).', color: 'purple' },
    { id: 'ddos', title: 'DDoS Traffic Surge', icon: Zap, desc: 'Simulate high-frequency request surge of 50,000 req/sec.', color: 'red' },
    { id: 'lateral', title: 'Lateral Movement', icon: Cpu, desc: 'Attempt unauthorized microservice hop into Encrypted Core DB Cluster.', color: 'cyan' },
    { id: 'replay', title: 'Token Replay & Forgery', icon: Flame, desc: 'Forge HMAC token signature key using invalid signing secrets.', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* War Room Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isSimulating ? 'glass-panel-danger border-red-300 animate-attack-alert' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border ${
              isSimulating ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-slate-900 text-emerald-400 border-slate-900'
            }`}>
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold font-mono text-slate-900">SOC Cyber Attack War-Room Simulator</h1>
                {isSimulating && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-600 text-white animate-ping">
                    ATTACK IN PROGRESS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Execute live simulated cyber exploits to evaluate ZeroShield auto-isolation & WAF defense capabilities
              </p>
            </div>
          </div>

          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              Neutralize Attack & Reset Mesh
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zero-Trust Defense Standing By
            </div>
          )}
        </div>
      </div>

      {/* Attack Launch Grid */}
      <div>
        <h2 className="text-sm font-bold font-mono text-slate-700 uppercase tracking-wider mb-4">
          Select Attack Vector to Execute
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attackVectors.map((vector) => {
            const Icon = vector.icon;
            const isCurrent = activeSimulation === vector.id;

            return (
              <GlassCard
                key={vector.id}
                onClick={() => triggerAttack(vector.id)}
                className={`cursor-pointer group transition-all duration-200 hover:shadow-md border ${
                  isCurrent
                    ? 'border-red-500 bg-red-50/50'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-slate-900 text-white group-hover:bg-red-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={isCurrent ? 'blocked' : 'default'} size="sm">
                    {isCurrent ? 'ACTIVE TARGET' : 'READY'}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold font-mono text-slate-900 mb-1 group-hover:text-red-600 transition-colors">
                  {vector.title}
                </h3>
                <p className="text-xs font-mono text-slate-500 leading-relaxed">
                  {vector.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-900 font-bold group-hover:underline">
                  <span>Launch Exploitation →</span>
                  <span className="text-emerald-600">0ms Isolation</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Real-time Console Log Card */}
      <GlassCard dark className="border border-slate-900 space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            SOC Proxy Interception Log Console
          </div>
          <span className="text-[10px] text-slate-400">Streaming Telemetry</span>
        </div>

        <div className="h-44 bg-slate-950 p-3 rounded-xl border border-slate-900 overflow-y-auto space-y-1.5 text-xs text-slate-300">
          <p className="text-slate-500">[SYSTEM READY] Listening for microservice traffic across control plane...</p>
          <p className="text-emerald-400">[0ms] Zero Trust Proxy initialized mTLS certificate validation (RS256).</p>
          {isSimulating && (
            <>
              <p className="text-red-400 font-bold animate-pulse">
                [ALERT] {activeSimulation?.toUpperCase()} Exploitation pattern intercepted on Edge Proxy!
              </p>
              <p className="text-amber-300">
                [AI ENGINE] Calculating Threat Risk Score: 98/100 (Threshold 80 Exceeded).
              </p>
              <p className="text-emerald-300 font-bold">
                [DEFENSE ENFORCED] Connection severed immediately. Source IP blacklisted. 0 bytes leaked.
              </p>
            </>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
