import React from 'react';
import { StatCard } from '../components/common/StatCard';
import { ServiceMeshDiagram } from '../components/topology/ServiceMeshDiagram';
import { RecentAlertsCard } from '../components/common/RecentAlertsCard';
import { ThreatBreakdownCard } from '../components/common/ThreatBreakdownCard';
import { GlassCard } from '../components/common/GlassCard';
import { Activity, ShieldCheck, ShieldAlert, Server, Gauge, Zap, CheckCircle2, Shield } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { HOURLY_REQUEST_DATA, THREAT_DISTRIBUTION_DATA, RISK_SCORE_DISTRIBUTION } from '../mock/mockData';

export const DashboardPage = () => {
  const { stats, isSimulating } = useSecurity();

  return (
    <div className="space-y-6">
      {/* Top Banner with Dark Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Header */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between border border-slate-200/80 bg-white p-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">ZeroShield Security Console</h1>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Welcome back, SecOps Admin. Microservice API traffic is mTLS encrypted and verified across 8 proxy nodes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ZERO-TRUST ENFORCED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t border-slate-100 text-left">
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900">1.42M</h2>
                <p className="text-xs font-semibold font-sans text-slate-500 mt-0.5">Verified API Requests</p>
                <div className="w-full bg-slate-900 h-1 rounded-full mt-2" />
              </div>
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900">06</h2>
                <p className="text-xs font-semibold font-sans text-slate-500 mt-0.5">Active Security Policies</p>
                <div className="w-full bg-slate-700 h-1 rounded-full mt-2" />
              </div>
              <div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-slate-900">99.9%</h2>
                <p className="text-xs font-semibold font-sans text-slate-500 mt-0.5">Threat Defense Rate</p>
                <div className="w-full bg-slate-900 h-1 rounded-full mt-2" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>mTLS Gateway Node: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">node-proxy-ap-south-1</code></span>
            </div>
            <button className="text-xs text-slate-900 font-bold uppercase hover:underline cursor-pointer">
              VERIFY KEYS
            </button>
          </div>
        </GlassCard>

        {/* Dark Hero Card - ZeroTrust Proxy Engine */}
        <GlassCard dark className="flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>PROXY ID: ZS-MESH-01</span>
            </div>

            <div>
              <h2 className="text-xl font-bold font-sans text-white tracking-tight">ZeroTrust Proxy Engine</h2>
              <p className="text-xs font-mono text-emerald-400 mt-1">mTLS 1.3 & RS256 Active</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">MESH PROTOCOL</span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-mono font-bold">
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

      {/* Bottom Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border border-slate-200/80 bg-white p-5">
          <h3 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider mb-3">Request Trend (24h)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_REQUEST_DATA}>
                <defs>
                  <linearGradient id="colorReqBlack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} hide />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
                <Area type="monotone" dataKey="total" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorReqBlack)" />
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
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
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
                  <linearGradient id="colorLatBlack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} hide />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#0F172A' }} />
                <Area type="monotone" dataKey="latency" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorLatBlack)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};