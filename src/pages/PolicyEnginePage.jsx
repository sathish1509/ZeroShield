import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Sliders, ShieldCheck, Clock, Globe, Zap, Search, Lock, Save } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { Badge } from '../components/common/Badge';

export const PolicyEnginePage = () => {
  const { policies, togglePolicy, showToast } = useSecurity();
  const [businessHours, setBusinessHours] = useState('09:00 - 18:00');
  const [allowedCountries, setAllowedCountries] = useState(['India', 'Singapore']);
  const [maxRequests, setMaxRequests] = useState(100);
  const [riskThreshold, setRiskThreshold] = useState(80);

  const handleCountryToggle = (country) => {
    if (allowedCountries.includes(country)) {
      setAllowedCountries(allowedCountries.filter(c => c !== country));
    } else {
      setAllowedCountries([...allowedCountries, country]);
    }
  };

  const handleSavePolicies = () => {
    showToast('Zero-Trust Policy Rules saved & deployed to proxy mesh nodes!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-600" />
            Zero-Trust Policy Engine Rules
          </h1>
          <p className="text-xs text-slate-500 font-mono">Configure real-time mTLS enforcement, geofencing, rate limits, and risk thresholds</p>
        </div>

        <button
          onClick={handleSavePolicies}
          className="px-5 py-2.5 rounded-xl black-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          Deploy Policy Changes
        </button>
      </GlassCard>

      {/* Grid of Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. JWT Validation */}
        <GlassCard className="border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900">JWT Validation</h3>
                <span className="text-[10px] font-mono text-slate-500">Cryptographic RS256 Verification</span>
              </div>
            </div>
            <button
              onClick={() => togglePolicy('pol-1')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                policies.find(p => p.id === 'pol-1')?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                policies.find(p => p.id === 'pol-1')?.enabled ? 'left-6.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <p className="text-xs font-mono text-slate-600">Strict signature verification and expiry checks on incoming HTTP authorization headers.</p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-mono">
            <span className="text-slate-500">Enforcement:</span>
            <Badge variant="allowed">STRICT ON</Badge>
          </div>
        </GlassCard>

        {/* 2. Business Hours */}
        <GlassCard className="border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900">Business Hours Window</h3>
                <span className="text-[10px] font-mono text-slate-500">Time-based Access Control</span>
              </div>
            </div>
            <button
              onClick={() => togglePolicy('pol-2')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                policies.find(p => p.id === 'pol-2')?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                policies.find(p => p.id === 'pol-2')?.enabled ? 'left-6.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-500 block mb-1">Operating Hours Range</label>
            <input
              type="text"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-mono">
            <span className="text-slate-500">UTC Window:</span>
            <span className="text-emerald-700 font-bold">{businessHours}</span>
          </div>
        </GlassCard>

        {/* 3. Allowed Countries */}
        <GlassCard className="border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900">Allowed Countries</h3>
                <span className="text-[10px] font-mono text-slate-500">Geo-IP Whitelisting</span>
              </div>
            </div>
            <button
              onClick={() => togglePolicy('pol-3')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                policies.find(p => p.id === 'pol-3')?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                policies.find(p => p.id === 'pol-3')?.enabled ? 'left-6.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['India', 'Singapore', 'United States', 'Germany'].map((country) => {
              const isSelected = allowedCountries.includes(country);
              return (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {isSelected ? `✓ ${country}` : `+ ${country}`}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* 4. Maximum Requests */}
        <GlassCard className="border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900">Maximum Requests</h3>
                <span className="text-[10px] font-mono text-slate-500">IP Burst Rate Limiter</span>
              </div>
            </div>
            <button
              onClick={() => togglePolicy('pol-4')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                policies.find(p => p.id === 'pol-4')?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                policies.find(p => p.id === 'pol-4')?.enabled ? 'left-6.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-500">Rate Limit Threshold:</span>
              <span className="text-emerald-700 font-bold">{maxRequests} req/min</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              value={maxRequests}
              onChange={(e) => setMaxRequests(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </GlassCard>

        {/* 5. Payload Inspection */}
        <GlassCard className="border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900">Payload Inspection</h3>
                <span className="text-[10px] font-mono text-slate-500">WAF Body Scanner</span>
              </div>
            </div>
            <button
              onClick={() => togglePolicy('pol-5')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                policies.find(p => p.id === 'pol-5')?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                policies.find(p => p.id === 'pol-5')?.enabled ? 'left-6.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <p className="text-xs font-mono text-slate-600">Inspects JSON/XML body content against SQLi, XSS, and command injection rules.</p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-mono">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-700 font-bold">Enabled & Deep Scanned</span>
          </div>
        </GlassCard>

        {/* 6. Risk Threshold */}
        <GlassCard className="border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900">Risk Score Threshold</h3>
                <span className="text-[10px] font-mono text-slate-500">AI Threat Drop Limit</span>
              </div>
            </div>
            <button
              onClick={() => togglePolicy('pol-6')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                policies.find(p => p.id === 'pol-6')?.enabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                policies.find(p => p.id === 'pol-6')?.enabled ? 'left-6.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-500">Drop Request if Risk &gt;:</span>
              <span className="text-red-600 font-bold">{riskThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full accent-red-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
