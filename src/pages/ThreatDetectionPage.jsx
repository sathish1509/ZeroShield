import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { StatCard } from '../components/common/StatCard';
import { ThreatBreakdownCard } from '../components/common/ThreatBreakdownCard';
import { ShieldAlert, AlertTriangle, ShieldX, Activity, Flame, Skull } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { THREAT_DISTRIBUTION_DATA } from '../mock/mockData';

export const ThreatDetectionPage = () => {
  const { stats, alerts, isSimulating } = useSecurity();

  const timelineData = [
    { time: '14:00', sqli: 4, jwt: 8, geo: 2, ddos: 0 },
    { time: '14:05', sqli: 12, jwt: 15, geo: 5, ddos: 0 },
    { time: '14:10', sqli: 8, jwt: 22, geo: 9, ddos: 0 },
    { time: '14:15', sqli: 35, jwt: 18, geo: 12, ddos: 0 },
    { time: '14:20', sqli: isSimulating ? 140 : 18, jwt: isSimulating ? 95 : 24, geo: 14, ddos: isSimulating ? 500 : 0 }
  ];

  const heatmapEndpoints = [
    { ep: '/api/v1/orders/checkout', sqli: 'CRITICAL', jwt: 'HIGH', geo: 'LOW', risk: 94 },
    { ep: '/api/v1/payments/charge', sqli: 'MEDIUM', jwt: 'CRITICAL', geo: 'HIGH', risk: 98 },
    { ep: '/api/v1/inventory/items', sqli: 'LOW', jwt: 'LOW', geo: 'CRITICAL', risk: 82 },
    { ep: '/api/v1/auth/token', sqli: 'HIGH', jwt: 'HIGH', geo: 'MEDIUM', risk: 78 },
    { ep: '/api/v1/admin/export', sqli: 'CRITICAL', jwt: 'CRITICAL', geo: 'HIGH', risk: 99 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Threat Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Detected Threats"
          value={alerts.length.toString()}
          icon={ShieldAlert}
          trend="+18 today"
          isPositive={false}
          color="red"
          sparklineData={[30, 45, 60, 80, 95, 100, 90]}
        />
        <StatCard
          title="Blocked Requests"
          value={stats.blockedRequests.toLocaleString()}
          icon={ShieldX}
          trend="100% Defense Rate"
          isPositive={true}
          color="green"
          sparklineData={[40, 60, 75, 90, 95, 100, 100]}
        />
        <StatCard
          title="Critical Alerts"
          value={alerts.filter(a => a.severity === 'critical').length.toString()}
          icon={Flame}
          trend="Zero Data Leaks"
          isPositive={true}
          color="amber"
          sparklineData={[10, 20, 40, 30, 50, 70, 60]}
        />
        <StatCard
          title="Overall Threat Level"
          value={isSimulating ? 'CRITICAL' : 'ELEVATED'}
          icon={Skull}
          trend={isSimulating ? 'ACTIVE SOC WAR' : 'AI Protection On'}
          isPositive={!isSimulating}
          color={isSimulating ? 'red' : 'green'}
          sparklineData={isSimulating ? [20, 50, 80, 100, 100, 100, 100] : [30, 40, 35, 45, 40, 35, 30]}
        />
      </div>

      {/* Threat Categories & Attack Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatBreakdownCard />

        <GlassCard className="border border-slate-200/80 bg-white p-6">
          <h3 className="text-base font-bold font-sans text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Attack Spike Timeline (Real-Time)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="sqli" stroke="#F43F5E" strokeWidth={2.5} name="SQL Injection" />
                <Line type="monotone" dataKey="jwt" stroke="#F59E0B" strokeWidth={2.5} name="Expired JWT" />
                <Line type="monotone" dataKey="geo" stroke="#334155" strokeWidth={2.5} name="Geo Attack" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Threat Heatmap Matrix */}
      <GlassCard className="border border-slate-200/80 bg-white p-6">
        <h3 className="text-base font-bold font-sans text-slate-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Targeted Endpoint Threat Heatmap Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4 text-center">SQLi Vulnerability</th>
                <th className="py-3 px-4 text-center">JWT Replay Exposure</th>
                <th className="py-3 px-4 text-center">Geo Threat Risk</th>
                <th className="py-3 px-4 text-center">Target Risk Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {heatmapEndpoints.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.ep}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-mono font-bold ${row.sqli === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800'}`}>
                      {row.sqli}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-mono font-bold ${row.jwt === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800'}`}>
                      {row.jwt}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-mono font-bold ${row.geo === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-200 text-slate-800'}`}>
                      {row.geo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-600">{row.risk}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
