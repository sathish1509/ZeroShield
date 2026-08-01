import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Settings as SettingsIcon, Shield, Key, Bell, Database, Lock, RefreshCw, Layers, CheckCircle2, Eye, XCircle, Crown, Wrench } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { ROLES, PAGE_ACCESS_MATRIX } from '../config/accessLimits';

export const SettingsPage = () => {
  const { showToast, currentRole } = useSecurity();

  const [jwtExpiration, setJwtExpiration] = useState('3600');
  const [mtlsRequired, setMtlsRequired] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [logRetentionDays, setLogRetentionDays] = useState('90');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('System & Proxy settings updated successfully', 'success');
  };

  const matrixRows = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'traffic', name: 'Live Traffic' },
    { id: 'topology', name: 'Service Mesh' },
    { id: 'threats', name: 'Threat Detection' },
    { id: 'policies', name: 'Policy Engine' },
    { id: 'audit', name: 'Audit Logs' },
    { id: 'simulation', name: 'Attack Simulation' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'settings', name: 'Settings & User Mgmt' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="border border-slate-200/80 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">
              System Settings & Access Controls
            </h1>
            <p className="text-xs text-slate-500 font-sans">
              Proxy configuration, cryptographic identity keys, role permissions, and access limits matrix
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Role & Access Limits Matrix Section */}
      <GlassCard className="border border-slate-200/80 bg-white p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-slate-900" />
            <h2 className="text-base font-bold font-sans text-slate-900">ZeroShield Role & Access Control Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Enforced Role-Based Access Control (RBAC) definitions and module access authorization bounds
          </p>
        </div>

        {/* 3 Role Definition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(ROLES).map((role) => (
            <div
              key={role.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                currentRole === role.id ? 'bg-slate-100/70 border-slate-300 shadow-2xs' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-extrabold font-mono text-xs text-slate-900">
                    {role.id === 'ADMIN' && <Crown className="w-4 h-4 text-amber-500" />}
                    {role.id === 'ANALYST' && <Shield className="w-4 h-4 text-emerald-600" />}
                    {role.id === 'DEVOPS' && <Wrench className="w-4 h-4 text-sky-600" />}
                    <span>{role.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${role.badgeColor}`}>{role.tag}</span>
                </div>
                <p className="text-xs font-mono text-slate-600 mb-3">{role.description}</p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-800 block mb-1">Permissions:</span>
                    <ul className="space-y-0.5 text-slate-700">
                      {role.permissions.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-bold text-red-800 block mb-1">Restrictions:</span>
                    <ul className="space-y-0.5 text-slate-700">
                      {role.restrictions.map((r, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`w-full mt-4 py-2 rounded-xl text-xs font-mono font-bold text-center ${
                currentRole === role.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentRole === role.id ? 'Current Active Session Role' : 'Assigned at Authentication'}
              </div>
            </div>
          ))}
        </div>

        {/* Page Access Matrix Table */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider mb-3">Page Access Control Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Page Module</th>
                  <th className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-600" /> Administrator
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" /> Security Analyst
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-sky-600" /> DevOps Engineer
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matrixRows.map((row) => {
                  const access = PAGE_ACCESS_MATRIX[row.id];
                  return (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ALLOWED
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {access?.ANALYST === 'ALLOWED' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ALLOWED
                          </span>
                        )}
                        {access?.ANALYST === 'VIEW_ONLY' && (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[10px]">
                            <Eye className="w-3 h-3 text-amber-700" /> VIEW ONLY
                          </span>
                        )}
                        {access?.ANALYST === 'RESTRICTED' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> RESTRICTED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {access?.DEVOPS === 'ALLOWED' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ALLOWED
                          </span>
                        )}
                        {access?.DEVOPS === 'VIEW_ONLY' && (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[10px]">
                            <Eye className="w-3 h-3 text-amber-700" /> VIEW ONLY
                          </span>
                        )}
                        {access?.DEVOPS === 'RESTRICTED' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> RESTRICTED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>

      {/* Main Settings Form */}
      <GlassCard className="border border-slate-200/80 bg-white p-6">
        <form onSubmit={handleSaveSettings} className="space-y-6 font-mono text-xs">
          {/* JWT Security Config */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-900" /> Cryptographic Identity & JWT Rotation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold">Token Expiration Timeout (Seconds)</label>
                <input
                  type="number"
                  value={jwtExpiration}
                  onChange={(e) => setJwtExpiration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 font-bold">Mutual TLS (mTLS) Enforcement</label>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMtlsRequired(!mtlsRequired)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                      mtlsRequired ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </button>
                  <span className="font-bold text-slate-800">{mtlsRequired ? 'Strict mTLS Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Alerts Config */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-900" /> SIEM & Webhook Alert Integrations
            </h2>
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Webhook Listener Endpoint</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-slate-400"
              />
            </div>
          </div>

          {/* Data Retention */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-900" /> Audit Log Retention Policy
            </h2>
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Retention Horizon (Days)</label>
              <select
                value={logRetentionDays}
                onChange={(e) => setLogRetentionDays(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-slate-400"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days (Enterprise Standard)</option>
                <option value="180">180 Days</option>
                <option value="365">365 Days (SOX/PCI Compliance)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => showToast('Configuration changes discarded', 'info')}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl black-btn font-bold uppercase tracking-wider shadow-xs flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
