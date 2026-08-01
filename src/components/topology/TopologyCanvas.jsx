import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Server, Shield, Database, Cpu, Bell, Activity, X, Lock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { Badge } from '../common/Badge';

export const TopologyCanvas = () => {
  const { services, isSimulating, activeSimulation } = useSecurity();
  const [selectedNode, setSelectedNode] = useState(null);

  const fullNodes = [
    { id: 'gw', label: 'Edge API Gateway', icon: Cpu, x: 120, y: 200, status: 'healthy', trust: 99, requests: '1.42M', latency: '4ms', identity: 'spiffe://cluster.local/ns/prod/sa/gateway', ip: '10.0.1.1' },
    { id: 'proxy', label: 'Zero Trust Proxy', icon: Shield, x: 340, y: 200, status: 'healthy', trust: 100, requests: '1.42M', latency: '8.4ms', identity: 'spiffe://cluster.local/ns/prod/sa/proxy', ip: '10.0.2.10' },
    { id: 'ord', label: 'Order Service', icon: Server, x: 580, y: 80, status: isSimulating && activeSimulation === 'sqli' ? 'blocked' : 'healthy', trust: isSimulating && activeSimulation === 'sqli' ? 20 : 96, requests: '620.4K', latency: '12ms', identity: 'spiffe://cluster.local/ns/prod/sa/orders', ip: '10.0.3.15' },
    { id: 'pay', label: 'Payment Service', icon: Server, x: 580, y: 160, status: isSimulating && activeSimulation === 'jwt' ? 'blocked' : 'healthy', trust: isSimulating && activeSimulation === 'jwt' ? 35 : 99, requests: '310.2K', latency: '14ms', identity: 'spiffe://cluster.local/ns/prod/sa/payments', ip: '10.0.3.20' },
    { id: 'inv', label: 'Inventory Service', icon: Server, x: 580, y: 240, status: isSimulating && activeSimulation === 'geo' ? 'warning' : 'healthy', trust: isSimulating && activeSimulation === 'geo' ? 65 : 94, requests: '412.0K', latency: '9ms', identity: 'spiffe://cluster.local/ns/prod/sa/inventory', ip: '10.0.3.25' },
    { id: 'ntf', label: 'Notification Service', icon: Bell, x: 580, y: 320, status: 'healthy', trust: 92, requests: '77.9K', latency: '11ms', identity: 'spiffe://cluster.local/ns/prod/sa/notifications', ip: '10.0.3.30' },
    { id: 'db', label: 'Encrypted Database Vault', icon: Database, x: 820, y: 200, status: 'healthy', trust: 100, requests: '1.34M', latency: '3ms', identity: 'spiffe://cluster.local/ns/prod/sa/database', ip: '10.0.4.50' }
  ];

  return (
    <div className="relative w-full h-[580px] glass-panel rounded-2xl border border-slate-200 p-4 overflow-hidden flex flex-col justify-between">
      {/* Top Topology Controls Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <h2 className="text-lg font-bold font-mono text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Enterprise Service Topology & Access Vectors
          </h2>
          <p className="text-xs text-slate-500 font-mono">Real-time microservice node health, mTLS identities, and authorization status</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Healthy
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Warning
          </div>
          <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Blocked Threat
          </div>
        </div>
      </div>

      {/* SVG Connections Graph */}
      <div className="relative w-full h-full my-2 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 950 400">
          <defs>
            <linearGradient id="greenPulseFullL" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="redPulseFullL" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#EF4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Lines */}
          <line x1="120" y1="200" x2="340" y2="200" stroke="#CBD5E1" strokeWidth="3" />
          <path d="M 120 200 L 340 200" stroke="url(#greenPulseFullL)" strokeWidth="4" fill="none" />

          <line x1="340" y1="200" x2="580" y2="80" stroke={isSimulating && activeSimulation === 'sqli' ? '#EF4444' : '#CBD5E1'} strokeWidth="3" />
          <path d="M 340 200 L 580 80" stroke={isSimulating && activeSimulation === 'sqli' ? 'url(#redPulseFullL)' : 'url(#greenPulseFullL)'} strokeWidth="4" fill="none" />

          <line x1="340" y1="200" x2="580" y2="160" stroke={isSimulating && activeSimulation === 'jwt' ? '#EF4444' : '#CBD5E1'} strokeWidth="3" />
          <path d="M 340 200 L 580 160" stroke={isSimulating && activeSimulation === 'jwt' ? 'url(#redPulseFullL)' : 'url(#greenPulseFullL)'} strokeWidth="4" fill="none" />

          <line x1="340" y1="200" x2="580" y2="240" stroke={isSimulating && activeSimulation === 'geo' ? '#F59E0B' : '#CBD5E1'} strokeWidth="3" />
          <path d="M 340 200 L 580 240" stroke="url(#greenPulseFullL)" strokeWidth="4" fill="none" />

          <line x1="340" y1="200" x2="580" y2="320" stroke="#CBD5E1" strokeWidth="3" />
          <path d="M 340 200 L 580 320" stroke="url(#greenPulseFullL)" strokeWidth="4" fill="none" />

          <line x1="580" y1="80" x2="820" y2="200" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="580" y1="160" x2="820" y2="200" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="580" y1="240" x2="820" y2="200" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="580" y1="320" x2="820" y2="200" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Nodes */}
        {fullNodes.map((node) => {
          const NodeIcon = node.icon;
          const isBlocked = node.status === 'blocked';
          const isWarning = node.status === 'warning';

          return (
            <div
              key={node.id}
              style={{ left: `${(node.x / 950) * 90 + 3}%`, top: `${(node.y / 400) * 80 + 10}%` }}
              onClick={() => setSelectedNode(node)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
                isBlocked
                  ? 'bg-red-500 text-white border-red-600 shadow-lg animate-pulse scale-110'
                  : isWarning
                  ? 'bg-amber-500 text-white border-amber-600 scale-105'
                  : node.id === 'proxy'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-110'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400 hover:scale-105 shadow-sm'
              }`}>
                <div className={`p-2 rounded-xl ${isBlocked ? 'bg-red-600 text-white' : node.id === 'proxy' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-800'}`}>
                  <NodeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono">{node.label}</h4>
                  <p className="text-[10px] font-mono opacity-80 flex items-center gap-1 mt-0.5">
                    <span>{node.ip}</span>
                    <span>•</span>
                    <span>{node.latency}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Inspector Drawer */}
      {selectedNode && (
        <div className="absolute right-4 top-16 bottom-4 w-80 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl z-30 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <selectedNode.icon className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold font-mono text-sm text-slate-900">{selectedNode.label}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold">SPIFFE Identity</span>
                <p className="p-2 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-800 break-all mt-1">
                  {selectedNode.identity}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500">Total Requests</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{selectedNode.requests}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500">Avg Latency</span>
                  <p className="text-base font-bold text-emerald-600 mt-1">{selectedNode.latency}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Trust Level Gauge</span>
                  <span className={selectedNode.trust > 80 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {selectedNode.trust}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedNode.trust > 80 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedNode.trust}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="w-full py-2.5 bg-slate-900 text-white font-mono text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
};
