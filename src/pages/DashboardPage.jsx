import React from 'react';
import { StatCard } from '../components/common/StatCard';
import { ServiceMeshDiagram } from '../components/topology/ServiceMeshDiagram';
import { RecentAlertsCard } from '../components/common/RecentAlertsCard';
import { ThreatBreakdownCard } from '../components/common/ThreatBreakdownCard';
import { GlassCard } from '../components/common/GlassCard';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Server,
  Gauge,
  Zap,
  CheckCircle2,
  Shield,
  Lock,
  Cpu,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { HOURLY_REQUEST_DATA, RISK_SCORE_DISTRIBUTION } from '../mock/mockData';

export const DashboardPage = () => {
  const { stats, isSimulating, logSource, resetToStaticBaseline, setCurrentPage } = useSecurity();

  // Format large request count for header
  const formatVerifiedCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Dark Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Header */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between border border-slate-200/80 bg-white p-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <div>
                <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">ZeroShield Security Console</h1>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Welcome back, SecOps Admin. Microservice API traffic is mTLS encrypted and verified across 8 proxy nodes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ZERO-TRUST ENFORCED
                </span>
              </div>
            </div>

            {/* Telemetry Dataset Status Banner */}
            <div className="my-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase">Telemetry Mode:</span>
                {logSource.isCustom ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    INGESTED LOG DATA ({logSource.name} - {logSource.recordCount} Records)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    STATIC BASELINE DATASET
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {logSource.isCustom ? (
                  <button
                    onClick={resetToStaticBaseline}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    Reset to Static
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentPage('upload')}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Upload / Ingest Live Logs
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-3 border-t border-slate-100 text-left">
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900">
                  {formatVerifiedCount(stats.totalRequests)}
                </h2>
                <p className="text-xs font-semibold font-sans text-slate-500 mt-0.5">Verified API Requests</p>
                <div className="w-full bg-slate-900 h-1 rounded-full mt-2" />
              </div>
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900">06</h2>
                <p className="text-xs font-semibold font-sans text-slate-500 mt-0.5">Active Security Policies</p>
                <div className="w-full bg-slate-700 h-1 rounded-full mt-2" />
              </div>
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900">
                  {stats.totalRequests > 0
                    ? ((stats.allowedRequests / stats.totalRequests) * 100).toFixed(1) + '%'
                    : '99.9%'}
                </h2>
                <p className="text-xs font-semibold font-sans text-slate-500 mt-0.5">Threat Defense Rate</p>
                <div className="w-full bg-slate-900 h-1 rounded-full mt-2" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>mTLS Gateway Node: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">node-proxy-ap-south-1</code></span>
            </div>
            <button className="text-xs text-slate-900 font-bold uppercase hover:underline cursor-pointer">
              VERIFY KEYS
            </button>
          </div>
        </GlassCard>

        {/* Dark Hero Card - Redesigned ZeroTrust Proxy Engine */}
        <GlassCard dark className="relative overflow-hidden flex flex-col justify-between p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group shadow-2xl rounded-3xl">
          {/* Ambient Cyber Ambient Gradient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 1. Header Section with Badge & Proxy ID */}
          <div className="space-y-3.5 relative z-10">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  <span className="absolute -inset-0.5 rounded-xl bg-emerald-500/20 blur-xs animate-pulse" />
                  <Shield className="relative w-5 h-5 text-emerald-400" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  MESH ONLINE
                </span>
              </div>
              <span className="text-slate-400 font-bold tracking-wider">ID: ZS-MESH-01</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  logSource.isCustom 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                    : 'bg-blue-950/90 text-blue-300 border border-blue-700'
                }`}>
                  {logSource.isCustom ? '⚡ INGESTED LOG DATA' : '📌 STATIC BASELINE'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Sub-10ms Verified</span>
              </div>
              
              <h2 className="text-xl font-black font-sans text-white tracking-tight flex items-center gap-2">
                ZeroTrust Proxy Engine
              </h2>
              <p className="text-xs font-mono text-emerald-400/90 mt-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>mTLS 1.3 & RS256 Active Protection</span>
              </p>
            </div>

            {/* Live Metrics Quick Grid inside Card */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Proxy Latency</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-white">{stats.avgLatency} ms</span>
                  <span className="text-[9px] text-emerald-400 font-bold">&lt;15ms OK</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Proxy Shards</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-white">8 / 8 Online</span>
                  <span className="text-[9px] text-emerald-400 font-bold">100%</span>
                </div>
              </div>
            </div>

            {/* 8 Proxy Shards Live Status Dots Visual */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Mesh Node Shards:</span>
              <div className="flex items-center gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <span 
                    key={i} 
                    className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                    title={`Proxy Node ${i + 1}: Healthy`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Interactive Action Footer */}
          <div className="pt-3 border-t border-slate-800/90 flex items-center justify-between gap-2 relative z-10 mt-3">
            <button
              onClick={() => setCurrentPage('proxy')}
              className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Proxy Interception</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>

            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono font-bold">
              mTLS 1.3 + JWT
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          icon={Activity}
          trend="+12.4%"
          isPositive={true}
          color="blue"
          sparklineData={[40, 55, 60, 85, 70, 95, 100]}
        />
        <StatCard
          title="Allowed Requests"
          value={stats.allowedRequests.toLocaleString()}
          icon={ShieldCheck}
          trend="+14.1%"
          isPositive={true}
          color="green"
          sparklineData={[50, 65, 75, 80, 90, 92, 98]}
        />
        <StatCard
          title="Blocked Requests"
          value={stats.blockedRequests.toLocaleString()}
          icon={ShieldAlert}
          trend={isSimulating ? "+340%" : "-4.2%"}
          isPositive={!isSimulating}
          color="red"
          sparklineData={isSimulating ? [20, 40, 65, 90, 100, 100, 100] : [80, 60, 45, 30, 20, 15, 10]}
        />
        <StatCard
          title="Active Services"
          value={`${stats.activeServices} / 8`}
          icon={Server}
          trend="100% Online"
          isPositive={true}
          color="cyan"
          sparklineData={[100, 100, 100, 100, 100, 100, 100]}
        />
        <StatCard
          title="Threat Level"
          value={isSimulating ? "CRITICAL" : stats.threatLevel}
          icon={Gauge}
          trend={isSimulating ? "ATTACK ACTIVE" : "Normal SOC"}
          isPositive={!isSimulating}
          color={isSimulating ? "red" : "amber"}
          sparklineData={isSimulating ? [10, 30, 60, 80, 100, 100, 100] : [20, 30, 25, 40, 35, 30, 25]}
        />
        <StatCard
          title="Avg Proxy Latency"
          value={`${stats.avgLatency}ms`}
          icon={Zap}
          trend="Target <15ms"
          isPositive={true}
          color="green"
          sparklineData={[40, 35, 50, 42, 38, 45, 40]}
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServiceMeshDiagram />
        </div>
        <div className="lg:col-span-1">
          <RecentAlertsCard />
        </div>
      </div>

      {/* Bottom Analytics Section (Monochrome Dark Navy & Slate Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border border-slate-200/80 bg-white p-5">
          <h3 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider mb-3">Request Trend (24h)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_REQUEST_DATA}>
                <defs>
                  <linearGradient id="colorReqMonoDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} hide />
                <Tooltip contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#FFFFFF' }} />
                <Area type="monotone" dataKey="total" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorReqMonoDark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <ThreatBreakdownCard compact />

        <GlassCard className="border border-slate-200/80 bg-white p-5">
          <h3 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider mb-3">Risk Distribution</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RISK_SCORE_DISTRIBUTION}>
                <XAxis dataKey="range" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} hide />
                <Tooltip contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#FFFFFF' }} />
                <Bar dataKey="count" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="border border-slate-200/80 bg-white p-5">
          <h3 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider mb-3">Proxy Latency (ms)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_REQUEST_DATA}>
                <defs>
                  <linearGradient id="colorLatMonoDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} hide />
                <Tooltip contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#FFFFFF' }} />
                <Area type="monotone" dataKey="latency" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorLatMonoDark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};