import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { ShieldAlert, Flame } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { THREAT_DISTRIBUTION_DATA } from '../../mock/mockData';

export const ThreatBreakdownCard = ({ compact = false }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const totalThreatsCount = 42500;
  const activeSlice = hoveredSlice || THREAT_DISTRIBUTION_DATA[0];

  return (
    <GlassCard className="border border-slate-200/80 bg-white p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Threat Category Breakdown
          </h3>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Real-time threat classification & volume ratio</p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold flex items-center gap-1">
          <Flame className="w-3 h-3 text-rose-500" />
          AI CLASSIFIED
        </span>
      </div>

      {/* Main Visual Section */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4 items-center`}>
        {/* Donut Chart with Center Text Overlay */}
        <div className="relative h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={THREAT_DISTRIBUTION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
                onMouseEnter={(data) => setHoveredSlice(data)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                {THREAT_DISTRIBUTION_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all cursor-pointer hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip wrapperStyle={{ display: 'none' }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text Readout Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl font-black font-sans tracking-tight text-slate-900">
              {activeSlice ? `${activeSlice.value}%` : '42.5K'}
            </span>
            <span className="text-[9px] font-bold font-sans text-slate-500 max-w-[80px] leading-tight truncate">
              {activeSlice ? activeSlice.name : 'Total Threats'}
            </span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="space-y-2 font-sans text-xs">
          {THREAT_DISTRIBUTION_DATA.map((item, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredSlice(item)}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-1.5 rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                activeSlice?.name === item.name
                  ? 'bg-slate-100 border-slate-300 shadow-2xs font-bold'
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[120px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-900 font-extrabold">{item.value}%</span>
                <span className="text-slate-400 text-[10px]">({Math.round((item.value / 100) * totalThreatsCount).toLocaleString()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
