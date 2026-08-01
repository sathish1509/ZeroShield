import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { FileText, Download, Filter } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const AuditLogsPage = () => {
  const { auditLogs, searchQuery, showToast } = useSecurity();
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService = serviceFilter === 'ALL' || log.destination.includes(serviceFilter);
    const matchesDecision = decisionFilter === 'ALL' || log.decision === decisionFilter;

    return matchesSearch && matchesService && matchesDecision;
  });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Timestamp,Source,Destination,Endpoint,Decision,Reason,Latency,RiskScore"]
      .concat(filteredLogs.map(l => `${l.timestamp},${l.source},${l.destination},${l.endpoint},${l.decision},"${l.reason}",${l.latency},${l.riskScore}`))
      .join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ZeroShield_Audit_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported audit logs to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Enterprise Audit Logs & Compliance Ledger
          </h1>
          <p className="text-xs text-slate-500 font-mono">Immutable audit history of all proxy decisions, access attempts, and threat interventions</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl black-btn font-mono text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export Audit Logs (CSV)
        </button>
      </GlassCard>

      {/* Filter Bar */}
      <GlassCard className="p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-slate-900" />
            <span>Filter By:</span>
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
          >
            <option value="ALL">All Destination Services</option>
            <option value="Payment">Payment Service</option>
            <option value="Order">Order Service</option>
            <option value="Inventory">Inventory Service</option>
            <option value="Gateway">Edge API Gateway</option>
          </select>

          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
          >
            <option value="ALL">All Decisions</option>
            <option value="Allowed">Allowed Only</option>
            <option value="Blocked">Blocked Only</option>
          </select>
        </div>

        <div className="text-slate-500 text-xs">
          Showing <span className="text-slate-900 font-bold">{filteredLogs.length}</span> of {auditLogs.length} Records
        </div>
      </GlassCard>

      {/* Audit Logs Table */}
      <GlassCard className="p-0 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Source IP</th>
                <th className="py-3.5 px-4">Destination Service</th>
                <th className="py-3.5 px-4">Endpoint</th>
                <th className="py-3.5 px-4 text-center">Decision</th>
                <th className="py-3.5 px-4">Reason / Rule Trigger</th>
                <th className="py-3.5 px-4 text-right">Latency</th>
                <th className="py-3.5 px-4 text-center">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.source}</td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{log.destination}</td>
                  <td className="py-3 px-4 text-slate-900 font-bold">{log.endpoint}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={log.decision === 'Allowed' ? 'allowed' : 'blocked'}>
                      {log.decision}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.reason}>
                    {log.reason}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">{log.latency}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className={log.riskScore > 70 ? 'text-red-600 font-bold' : 'text-emerald-600'}>
                      {log.riskScore}/100
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
