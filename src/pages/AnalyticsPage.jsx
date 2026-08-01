import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { BarChart3, TrendingUp, ShieldAlert, Activity, Clock, Target, Eye, Zap } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { HOURLY_REQUEST_DATA, RISK_SCORE_DISTRIBUTION } from '../mock/mockData';

export const AnalyticsPage = () => {
  // State for Hover Readout Placeholders
  const [hoveredVolume, setHoveredVolume] = useState(null);
  const [hoveredLatency, setHoveredLatency] = useState(null);
  const [hoveredRisk, setHoveredRisk] = useState(null);

  const targetedEndpoints = [
    { ep: '/api/v1/payments/charge', service: 'Payment Service', attempts: 18450, blocked: 18450, risk: '99/100', rating: 'Critical' },
    { ep: '/api/v1/orders/create', service: 'Order Processing Service', attempts: 14200, blocked: 14120, risk: '96/100', rating: 'High' },
    { ep: '/api/v1/inventory/query', service: 'Inventory & Stock Service', attempts: 8900, blocked: 8900, risk: '88/100', rating: 'High' },
    { ep: '/api/v1/notifications/send', service: 'Notification Engine', attempts: 3200, blocked: 3100, risk: '76/100', rating: 'Elevated' }
  ];

  // Default values when not hovering
  const defaultVolumePoint = HOURLY_REQUEST_DATA[HOURLY_REQUEST_DATA.length - 1];
  const activeVolume = hoveredVolume || defaultVolumePoint;

  const defaultLatencyPoint = HOURLY_REQUEST_DATA[HOURLY_REQUEST_DATA.length - 1];
  const activeLatency = hoveredLatency || defaultLatencyPoint;

  const defaultRiskPoint = RISK_SCORE_DISTRIBUTION[0];
  const activeRisk = hoveredRisk || defaultRiskPoint;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <GlassCard className="border border-slate-200/80 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-slate-900 text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">
                Enterprise Telemetry & Security Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Hover over graph points to display live metrics directly in the top readout placeholder
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY ACTIVE
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Row 1: Request Volume Breakdown (Values Display EXCLUSIVELY in Top Readout Header) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 border border-slate-200/80 bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-900" />
                  Request Volume Breakdown (Allowed vs Blocked)
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Move cursor along graph to update top placeholder values</p>
              </div>

              {/* DEDICATED TOP STATIC READOUT PLACEHOLDER BOX */}
              <div className="p-2.5 rounded-xl bg-slate-900 text-white font-mono text-xs flex items-center gap-4 shrink-0 shadow-sm border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>POINT: <strong className="text-white">{activeVolume.time}</strong></span>
                </div>
                <div className="border-l border-slate-700 pl-3">
                  <span className="text-slate-400">ALLOWED: </span>
                  <strong className="text-white">{activeVolume.allowed?.toLocaleString()} reqs</strong>
                </div>
                <div className="border-l border-slate-700 pl-3">
                  <span className="text-slate-400">BLOCKED: </span>
                  <strong className="text-rose-400">{activeVolume.blocked?.toLocaleString()} reqs</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={HOURLY_REQUEST_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    setHoveredVolume(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredVolume(null)}
              >
                <defs>
                  <linearGradient id="blackAllowedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />

                {/* Hide Floating Popup Tooltip (Values render in Top Readout Header) */}
                <Tooltip
                  wrapperStyle={{ display: 'none' }}
                  cursor={{ stroke: '#0F172A', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />

                <Area type="monotone" dataKey="allowed" stroke="#0F172A" strokeWidth={2.5} fillOpacity={1} fill="url(#blackAllowedGrad)" name="Allowed Requests" />
                <Area type="monotone" dataKey="blocked" stroke="#E11D48" strokeWidth={2.5} fillOpacity={1} fill="url(#blockedGrad)" name="Blocked Requests" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Overall Enforcement Ratio Donut */}
        <GlassCard className="lg:col-span-1 border border-slate-200/80 bg-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-900" />
              Overall Enforcement Ratio
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Authorization pass vs block percentage</p>
          </div>

          <div className="relative h-56 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Allowed', value: 97, color: '#0F172A' },
                    { name: 'Blocked Threats', value: 3, color: '#F43F5E' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill="#0F172A" />
                  <Cell fill="#F43F5E" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black font-sans tracking-tight text-slate-900">97%</span>
              <span className="text-xs font-bold font-sans text-slate-700">Allowed Traffic</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-sans font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <span className="text-slate-800">97% Allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-800">3% Blocked</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Average Proxy Latency & Risk Score Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Bar Chart Card */}
        <GlassCard className="border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-900" />
                Average Proxy Latency (ms)
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Hover bar to update top placeholder value</p>
            </div>

            {/* TOP LATENCY STATIC READOUT PLACEHOLDER */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-xs border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>TIME: <strong>{activeLatency.time}</strong></span>
              <span className="text-slate-700">|</span>
              <span>LATENCY: <strong className="text-white">{activeLatency.latency}ms</strong></span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={HOURLY_REQUEST_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    setHoveredLatency(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredLatency(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip wrapperStyle={{ display: 'none' }} />
                <Bar dataKey="latency" fill="#0F172A" radius={[8, 8, 0, 0]} name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Risk Histogram Card */}
        <GlassCard className="border border-slate-200/80 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-900" />
                Risk Score Distribution Histogram
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Hover bar to update top placeholder value</p>
            </div>

            {/* TOP RISK HISTOGRAM STATIC READOUT PLACEHOLDER */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-xs border border-slate-800">
              <span>RANGE: <strong className="text-white">{activeRisk.range}</strong></span>
              <span className="text-slate-700">|</span>
              <span>COUNT: <strong className="text-white">{activeRisk.count?.toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={RISK_SCORE_DISTRIBUTION}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                onMouseMove={(state) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    setHoveredRisk(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredRisk(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="range" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip wrapperStyle={{ display: 'none' }} />
                <Bar dataKey="count" fill="#334155" radius={[8, 8, 0, 0]} name="Request Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Top Targeted Services Ranking Table */}
      <GlassCard className="border border-slate-200/80 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              Top Targeted Services & Endpoints Ranking
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">High-frequency attack endpoints intercepted by zero-trust proxy</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Endpoint</th>
                <th className="py-3.5 px-4">Destination Service</th>
                <th className="py-3.5 px-4 text-right">Attempts</th>
                <th className="py-3.5 px-4 text-right">Auto-Blocked</th>
                <th className="py-3.5 px-4 text-center">Threat Risk Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {targetedEndpoints.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.ep}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.service}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">{item.attempts.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-bold">{item.blocked.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                      item.rating === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      item.rating === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {item.risk} ({item.rating})
                    </span>
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
