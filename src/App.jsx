import React from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { TopNav } from './components/layout/TopNav';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { GlassCard } from './components/common/GlassCard';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ZeroTrustProxyPage } from './pages/ZeroTrustProxyPage';
import { LiveTrafficPage } from './pages/LiveTrafficPage';
import { ServiceTopologyPage } from './pages/ServiceTopologyPage';
import { ThreatDetectionPage } from './pages/ThreatDetectionPage';
import { PolicyEnginePage } from './pages/PolicyEnginePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UploadLogsPage } from './pages/UploadLogsPage';
import { AttackSimulationPage } from './pages/AttackSimulationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GeminiAiModal } from './components/common/GeminiAiModal';

const AccessDeniedView = ({ pageId }) => {
  const { currentRole, ROLES, switchRole } = useSecurity();
  const roleInfo = ROLES[currentRole] || ROLES.ADMIN;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <GlassCard className="border border-red-200 bg-red-50/40 p-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-mono font-bold uppercase tracking-wider">
            Permission Restricted (HTTP 403)
          </span>
          <h2 className="text-2xl font-black font-sans text-slate-900">Access Restricted by Role Policy</h2>
          <p className="text-xs font-mono text-slate-600 max-w-md mx-auto">
            Your active role <strong className="text-slate-900">{roleInfo.title}</strong> does not have permission to access the requested component or modify system settings.
          </p>
        </div>

        {/* Role Restrictions Breakdown */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800">Role Profile:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleInfo.badgeColor}`}>{roleInfo.tag}</span>
          </div>
          <p className="text-slate-500">{roleInfo.description}</p>
          <div className="pt-2 border-t border-slate-100">
            <span className="font-bold text-red-700 block mb-1">Enforced Role Restrictions:</span>
            <ul className="space-y-1 text-[11px] text-slate-600">
              {roleInfo.restrictions.map((res, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-red-500 font-bold">✕</span> {res}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 max-w-md mx-auto shadow-md">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>ONLY ADMINISTRATORS CAN ACCESS THIS MODULE</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const MainContent = () => {
  const { isAuthenticated, currentPage, checkPageAccess, isAiModalOpen, closeAiModal, selectedAlertForAi } = useSecurity();

  if (!isAuthenticated || currentPage === 'login') {
    return <LoginPage />;
  }

  const accessStatus = checkPageAccess(currentPage);

  const renderPage = () => {
    if (accessStatus === 'RESTRICTED') {
      return <AccessDeniedView pageId={currentPage} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'proxy':
        return <ZeroTrustProxyPage />;
      case 'traffic':
        return <LiveTrafficPage />;
      case 'topology':
        return <ServiceTopologyPage />;
      case 'threats':
        return <ThreatDetectionPage />;
      case 'policies':
        return <PolicyEnginePage />;
      case 'audit':
        return <AuditLogsPage />;
      case 'upload':
        return <UploadLogsPage />;
      case 'simulation':
        return <AttackSimulationPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1700px] mx-auto w-full">
          {renderPage()}
        </main>
      </div>
      <GeminiAiModal isOpen={isAiModalOpen} onClose={closeAiModal} alertData={selectedAlertForAi} />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <SecurityProvider>
      <MainContent />
    </SecurityProvider>
  );
}
