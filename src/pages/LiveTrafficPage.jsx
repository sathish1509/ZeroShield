import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Activity, Play, Pause, Search } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const LiveTrafficPage = () => {
  const { traffic, searchQuery } = useSecurity();
  const [isPaused, setIsPaused] = useState(false);
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const filteredTraffic = traffic.filter(item => {
    const matchesSearch =
      item.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDecision = decisionFilter === 'ALL' || item.decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600 animate-pulse" />
            Real-Time Zero-Trust Traffic Inspector
          </h1>
          <p className="text-xs text-slate-500 font-mono">Live HTTP/gRPC request authorization stream and risk score telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border flex items-center gap-2 transition-all ${
              isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'STREAM PAUSED' : 'AUTO-STREAMING'}</span>
          </button>

          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 font-mono text-xs">
            <button
              onClick={() => setDecisionFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${decisionFilter === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({traffic.length})
            </button>
            <button
              onClick={() => setDecisionFilter('Allowed')}
              className={`px-3 py-1 rounded-lg transition-all ${decisionFilter === 'Allowed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Allowed
            </button>
            <button
              onClick={() => setDecisionFilter('Blocked')}
              className={`px-3 py-1 rounded-lg transition-all ${decisionFilter === 'Blocked' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Blocked
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Real-time Streaming Table */}
      <GlassCard className="p-0 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Source Service</th>
                <th className="py-3.5 px-4">Destination Service</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Endpoint</th>
                <th className="py-3.5 px-4">JWT Status</th>
                <th className="py-3.5 px-4 text-center">Risk Score</th>
                <th className="py-3.5 px-4 text-right">Latency</th>
                <th className="py-3.5 px-4 text-center">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredTraffic.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    idx === 0 && !isPaused ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{item.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.source}</td>
                  <td className="py-3 px-4 text-slate-700">{item.destination}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.method === 'GET' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      item.method === 'POST' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {item.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-bold text-[11px]">{item.endpoint}</td>
                  <td className="py-3 px-4">
                    <span className={item.jwtStatus.includes('Expired') || item.jwtStatus.includes('Invalid') ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {item.jwtStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.riskScore > 70 ? 'bg-red-100 text-red-700 border border-red-200' :
                      item.riskScore > 40 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.riskScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">{item.latency}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={item.decision === 'Allowed' ? 'allowed' : 'blocked'}>
                      {item.decision === 'Allowed' ? '✓ ALLOWED' : '✕ BLOCKED'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
