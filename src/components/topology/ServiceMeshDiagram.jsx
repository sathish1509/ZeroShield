import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Shield, Server, Database, User, Cpu, Lock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const ServiceMeshDiagram = () => {
  const { isSimulating, activeSimulation } = useSecurity();
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 'user', label: 'User / Client', icon: User, x: 50, y: 150, jwt: 'Valid (RS256)', risk: 10, latency: '2ms', type: 'Client' },
    { id: 'gw', label: 'API Gateway', icon: Cpu, x: 220, y: 150, jwt: 'Verified', risk: 8, latency: '4ms', type: 'Gateway' },
    { id: 'proxy', label: 'Zero Trust Proxy', icon: Shield, x: 410, y: 150, jwt: 'Enforced', risk: 5, latency: '8.4ms', type: 'Security Proxy' },
    { id: 'ord', label: 'Order Service', icon: Server, x: 600, y: 70, jwt: isSimulating && activeSimulation === 'sqli' ? 'Compromised' : 'Valid', risk: isSimulating && activeSimulation === 'sqli' ? 98 : 12, latency: '12ms', type: 'Microservice' },
    { id: 'pay', label: 'Payment Service', icon: Server, x: 600, y: 150, jwt: isSimulating && activeSimulation === 'jwt' ? 'Expired' : 'Valid', risk: isSimulating && activeSimulation === 'jwt' ? 88 : 15, latency: '14ms', type: 'PCI Service' },
    { id: 'inv', label: 'Inventory Service', icon: Server, x: 600, y: 230, jwt: isSimulating && activeSimulation === 'geo' ? 'Blocked (RU)' : 'Valid', risk: isSimulating && activeSimulation === 'geo' ? 82 : 14, latency: '9ms', type: 'Microservice' },
    { id: 'db', label: 'Database Vault', icon: Database, x: 790, y: 150, jwt: 'Encrypted mTLS', risk: 2, latency: '3ms', type: 'Database' },
  ];

  return (
    <GlassCard className="relative overflow-hidden border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Interactive Zero-Trust Service Mesh
          </h2>
          <p className="text-xs text-slate-500 font-mono">Live traffic connection vectors & access authorization flows</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono font-bold">
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Allowed Traffic
          </span>
          <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Blocked Threat
          </span>
        </div>
      </div>

      <div className="relative w-full h-[320px] bg-slate-50 rounded-2xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 880 300">
          <defs>
            <linearGradient id="greenPulseLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="redPulseLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#EF4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Lines */}
          <line x1="50" y1="150" x2="220" y2="150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 50 150 L 220 150" stroke="url(#greenPulseLight)" strokeWidth="3" fill="none" />

          <line x1="220" y1="150" x2="410" y2="150" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M 220 150 L 410 150" stroke="url(#greenPulseLight)" strokeWidth="4" fill="none" />

          <line x1="410" y1="150" x2="600" y2="70" stroke={isSimulating && activeSimulation === 'sqli' ? '#EF4444' : '#CBD5E1'} strokeWidth="2" />
          <path d="M 410 150 L 600 70" stroke={isSimulating && activeSimulation === 'sqli' ? 'url(#redPulseLight)' : 'url(#greenPulseLight)'} strokeWidth="3" fill="none" />

          <line x1="410" y1="150" x2="600" y2="150" stroke={isSimulating && activeSimulation === 'jwt' ? '#EF4444' : '#CBD5E1'} strokeWidth="2" />
          <path d="M 410 150 L 600 150" stroke={isSimulating && activeSimulation === 'jwt' ? 'url(#redPulseLight)' : 'url(#greenPulseLight)'} strokeWidth="3" fill="none" />

          <line x1="410" y1="150" x2="600" y2="230" stroke={isSimulating && activeSimulation === 'geo' ? '#EF4444' : '#CBD5E1'} strokeWidth="2" />
          <path d="M 410 150 L 600 230" stroke={isSimulating && activeSimulation === 'geo' ? 'url(#redPulseLight)' : 'url(#greenPulseLight)'} strokeWidth="3" fill="none" />

          <line x1="600" y1="70" x2="790" y2="150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="600" y1="150" x2="790" y2="150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="600" y1="230" x2="790" y2="150" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const NodeIcon = node.icon;
          const isAttackTarget =
            (node.id === 'ord' && activeSimulation === 'sqli') ||
            (node.id === 'pay' && activeSimulation === 'jwt') ||
            (node.id === 'inv' && activeSimulation === 'geo');

          return (
            <div
              key={node.id}
              style={{ left: `${(node.x / 880) * 90}%`, top: `${(node.y / 300) * 80 + 5}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                  isAttackTarget
                    ? 'bg-red-500 text-white border-red-600 shadow-lg animate-pulse'
                    : node.id === 'proxy'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-110'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 hover:scale-105 shadow-sm'
                }`}
              >
                <NodeIcon className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-mono font-bold whitespace-nowrap">{node.label}</span>
              </div>

              {/* Hover Popover */}
              {hoveredNode?.id === node.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white rounded-xl p-3 shadow-xl border border-slate-200 z-30 font-mono text-[11px] space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-bold text-slate-900">
                    <span>{node.label}</span>
                    <span className="text-[10px] text-emerald-600">{node.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">JWT Status:</span>
                    <span className={node.jwt.includes('Expired') || node.jwt.includes('Compromised') ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {node.jwt}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk Score:</span>
                    <span className={node.risk > 50 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{node.risk}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <span className="text-slate-800">{node.latency}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
