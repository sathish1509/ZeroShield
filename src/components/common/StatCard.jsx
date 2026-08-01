import React from 'react';
import { GlassCard } from './GlassCard';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  isPositive = true,
  color = 'blue',
  sparklineData = []
}) => {
  const chartData = sparklineData.map((val, i) => ({ i, val }));

  // Pure Black & Dark Slate Palette with Red for Negative/Threat Trends
  const colorMap = {
    green: { stroke: '#0F172A', fill: '#0F172A', text: 'text-slate-900', bg: 'bg-slate-100' },
    blue: { stroke: '#0F172A', fill: '#0F172A', text: 'text-slate-900', bg: 'bg-slate-100' },
    red: { stroke: '#F43F5E', fill: '#F43F5E', text: 'text-rose-600', bg: 'bg-rose-50 border border-rose-200' },
    amber: { stroke: '#334155', fill: '#334155', text: 'text-slate-800', bg: 'bg-slate-100' },
    cyan: { stroke: '#0F172A', fill: '#0F172A', text: 'text-slate-900', bg: 'bg-slate-100' }
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <GlassCard className="p-4 flex flex-col justify-between border border-slate-200/80 bg-white">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500">{title}</span>
          {Icon && (
            <div className={`p-1.5 rounded-lg ${selectedColor.bg}`}>
              <Icon className={`w-4 h-4 ${selectedColor.text}`} />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xl font-black font-sans tracking-tight text-slate-900">{value}</h3>
          {trend && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isPositive ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      {sparklineData.length > 0 && (
        <div className="h-10 mt-3 -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedColor.fill} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={selectedColor.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={selectedColor.stroke}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${title.replace(/\s+/g, '')})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
};
