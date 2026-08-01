import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { StatCard } from '../components/common/StatCard';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Sliders,
  Brain,
  FileText,
  CheckCircle2,
  XCircle,
  Play,
  Zap,
  ArrowRight,
  Server,
  Lock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Activity,
  Cpu,
  CornerDownRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const ZeroTrustProxyPage = () => {
  const { showToast } = useSecurity();

  // Custom Request Simulator Inputs
  const [originService, setOriginService] = useState('Payment-Gateway-v1');
  const [targetService, setTargetService] = useState('Internal-Customer-Vault');
  const [httpMethod, setHttpMethod] = useState('POST');
  const [requestPath, setRequestPath] = useState('/api/v1/vault/customer/credentials');
  const [hasValidJwt, setHasValidJwt] = useState(true);
  const [hasLateralMovement, setHasLateralMovement] = useState(true); // Default to demonstrate threat prevention
  const [hasSqlPayload, setHasSqlPayload] = useState(false);

  // Execution State & Animate Pipeline Steps
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: JWT, 2: Policy, 3: Risk, 4: Logger, 5: Decision
  const [executionResult, setExecutionResult] = useState(null);

  // Initial Interception History Log
  const [interceptionHistory, setInterceptionHistory] = useState([
    {
      id: 'PRX-2026-9901',
      time: '12 seconds ago',
      origin: 'Untrusted-Microservice-04',
      target: 'Internal-Customer-Vault',
      method: 'POST',
      jwtValid: false,
      policyPassed: false,
      riskScore: 98,
      decision: 'BLOCKED',
      reason: 'Unauthorized Lateral Movement & Invalid Scope'
    },
    {
      id: 'PRX-2026-9900',
      time: '1 min ago',
      origin: 'Auth-Service-v2',
      target: 'User-Profile-API',
      method: 'GET',
      jwtValid: true,
      policyPassed: true,
      riskScore: 12,
      decision: 'ALLOWED',
      reason: 'Valid mTLS & Verified JWT Scope'
    },
    {
      id: 'PRX-2026-9899',
      time: '3 mins ago',
      origin: 'Analytics-Worker-01',
      target: 'Payment-Gateway-v1',
      method: 'POST',
      jwtValid: true,
      policyPassed: false,
      riskScore: 88,
      decision: 'BLOCKED',
      reason: 'SQL Injection Payload Pattern Intercepted'
    }
  ]);

  // Handle Preset Quick Scenarios
  const applyPreset = (presetType) => {
    setExecutionResult(null);
    setActiveStep(0);

    if (presetType === 'authorized') {
      setOriginService('Auth-Service-v2');
      setTargetService('User-Profile-API');
      setHttpMethod('GET');
      setRequestPath('/api/v1/users/profile');
      setHasValidJwt(true);
      setHasLateralMovement(false);
      setHasSqlPayload(false);
      showToast('Loaded Preset: Valid Authorized Inter-Service Call', 'info');
    } else if (presetType === 'lateral') {
      setOriginService('Compromised-Analytics-Worker');
      setTargetService('Internal-Customer-Vault');
      setHttpMethod('POST');
      setRequestPath('/api/v1/vault/secret-keys');
      setHasValidJwt(true);
      setHasLateralMovement(true);
      setHasSqlPayload(false);
      showToast('Loaded Preset: Lateral Movement Attack Scenario', 'warning');
    } else if (presetType === 'sqli') {
      setOriginService('External-Ingress-Proxy');
      setTargetService('Payment-Gateway-v1');
      setHttpMethod('POST');
      setRequestPath('/api/v1/charge?account=1 UNION SELECT * FROM users');
      setHasValidJwt(true);
      setHasLateralMovement(false);
      setHasSqlPayload(true);
      showToast('Loaded Preset: SQL Injection Payload Attack Scenario', 'warning');
    } else if (presetType === 'unauthorized') {
      setOriginService('Unknown-Rogue-Container');
      setTargetService('Internal-Customer-Vault');
      setHttpMethod('DELETE');
      setRequestPath('/api/v1/vault/purge');
      setHasValidJwt(false);
      setHasLateralMovement(true);
      setHasSqlPayload(false);
      showToast('Loaded Preset: Rogue Container (No JWT)', 'warning');
    }
  };

  // Run Real-Time Step-by-Step Proxy Pipeline Execution
  const runProxyPipeline = () => {
    setIsExecuting(true);
    setExecutionResult(null);

    // Step 1: JWT
    setActiveStep(1);
    setTimeout(() => {
      // Step 2: Policy Engine
      setActiveStep(2);
      setTimeout(() => {
        // Step 3: Risk Engine
        setActiveStep(3);
        setTimeout(() => {
          // Step 4: Logger
          setActiveStep(4);
          setTimeout(() => {
            // Step 5: Final Decision Calculation
            setActiveStep(5);
            setIsExecuting(false);

            // Compute Real-Time Inspection Result
            const jwtValid = hasValidJwt;
            const policyPassed = !hasLateralMovement;
            
            let riskScore = 12;
            const detectedThreats = [];

            if (!jwtValid) {
              riskScore += 50;
              detectedThreats.push('INVALID_OR_MISSING_JWT_CREDENTIAL');
            }

            if (hasLateralMovement) {
              riskScore += 75;
              detectedThreats.push('UNAUTHORIZED_LATERAL_MOVEMENT_ATTEMPT');
            }

            if (hasSqlPayload) {
              riskScore += 80;
              detectedThreats.push('SQL_INJECTION_PATTERN_DETECTED');
            }

            const isAllowed = jwtValid && policyPassed && riskScore <= 70;
            const decision = isAllowed ? 'ALLOWED' : 'BLOCKED';
            const statusCode = isAllowed ? 200 : 403;

            const result = {
              id: `PRX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toLocaleTimeString(),
              origin: originService,
              target: targetService,
              method: httpMethod,
              path: requestPath,
              jwtValid,
              policyPassed,
              riskScore,
              detectedThreats,
              decision,
              statusCode,
              latencyMs: Math.floor(4 + Math.random() * 8),
              reason: !jwtValid
                ? 'JWT Credential Verification Failed'
                : hasLateralMovement
                ? `Unauthorized Lateral Attempt: '${originService}' lacks permission scope for '${targetService}'`
                : hasSqlPayload
                ? 'Malicious SQL Payload Pattern Intercepted'
                : 'All Cryptographic & Policy Checks Passed'
            };

            setExecutionResult(result);

            // Append to Interception History
            setInterceptionHistory(prev => [
              {
                id: result.id,
                time: 'Just now',
                origin: result.origin,
                target: result.target,
                method: result.method,
                jwtValid: result.jwtValid,
                policyPassed: result.policyPassed,
                riskScore: result.riskScore,
                decision: result.decision,
                reason: result.reason
              },
              ...prev
            ]);

            if (isAllowed) {
              showToast(`Proxy Decision: ALLOWED (200 OK) -> Request forwarded to ${targetService}`, 'success');
            } else {
              showToast(`Proxy Decision: BLOCKED (403 Forbidden) -> Lateral Movement Prevented at Edge!`, 'error');
            }
          }, 400);
        }, 400);
      }, 400);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Core Mission Statement */}
      <GlassCard className="border border-slate-200/80 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400 shadow-sm">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-sans tracking-tight text-slate-900">
                  Zero-Trust Real-Time Interception Proxy
                </h1>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Prevent lateral movement attacks between microservices in real time before unauthorized requests hit Service B.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              REAL-TIME PROXY EDGE ACTIVE (mTLS 1.3)
            </span>
          </div>
        </div>
      </GlassCard>

      {/* 2. Top Proxy Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Intercepted Lateral Threats"
          value="1,420 Blocked"
          icon={ShieldAlert}
          trend="100% Edge Intercept"
          isPositive={false}
          color="red"
          sparklineData={[20, 35, 50, 75, 90, 100]}
        />
        <StatCard
          title="mTLS Validated Traffic"
          value="1.42M Requests"
          icon={ShieldCheck}
          trend="Sub-10ms mTLS"
          isPositive={true}
          color="green"
          sparklineData={[40, 60, 80, 90, 95, 100]}
        />
        <StatCard
          title="Active Proxy Nodes"
          value="8 Proxy Shards"
          icon={Server}
          trend="0% Compromised"
          isPositive={true}
          color="blue"
          sparklineData={[100, 100, 100, 100, 100, 100]}
        />
        <StatCard
          title="Proxy Inspection Latency"
          value="6.2 ms"
          icon={Zap}
          trend="Target <15ms"
          isPositive={true}
          color="cyan"
          sparklineData={[40, 35, 45, 38, 42, 36]}
        />
      </div>

      {/* 3. ARCHITECTURAL ZERO-TRUST PROXY PIPELINE DIAGRAM */}
      <GlassCard className="border border-slate-200/80 bg-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Zero Trust Proxy Pipeline Visualizer
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Real-time inline evaluation flow: Service A ➔ Proxy Pipeline ➔ Decision ➔ Service B</p>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            ENFORCING ZERO TRUST MESH
          </span>
        </div>

        {/* Live Animated Pipeline Flow Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center py-4 px-2">
          {/* Service A (Origin) */}
          <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-900 text-white text-center space-y-2 shadow-md">
            <Server className="w-6 h-6 mx-auto text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase truncate">{originService}</h3>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-mono font-bold block">
              SERVICE A (Origin)
            </span>
          </div>

          <div className="lg:col-span-1 text-center flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse hidden lg:block" />
          </div>

          {/* Zero Trust Proxy Engine (Centerpiece Box) */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-50 border-2 border-slate-900 space-y-4 shadow-sm relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                ZERO TRUST PROXY CORE ENGINE
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                INLINE INTERCEPTOR
              </span>
            </div>

            {/* 4 Execution Steps */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep === 1 ? 'bg-slate-900 text-white border-slate-900 scale-[1.02]' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Key className={`w-3.5 h-3.5 ${activeStep === 1 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-bold">1. JWT Validation</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep === 2 ? 'bg-slate-900 text-white border-slate-900 scale-[1.02]' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Sliders className={`w-3.5 h-3.5 ${activeStep === 2 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-bold">2. Policy Engine</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep === 3 ? 'bg-slate-900 text-white border-slate-900 scale-[1.02]' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Brain className={`w-3.5 h-3.5 ${activeStep === 3 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-bold">3. Risk Engine</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${
                activeStep === 4 ? 'bg-slate-900 text-white border-slate-900 scale-[1.02]' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <FileText className={`w-3.5 h-3.5 ${activeStep === 4 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-bold">4. Audit Logger</span>
                </div>
              </div>
            </div>

            {/* Decision Status Banner */}
            <div className={`p-3 rounded-2xl text-center font-mono text-xs font-extrabold tracking-wider transition-all ${
              executionResult
                ? executionResult.decision === 'ALLOWED'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'bg-slate-200/70 text-slate-700'
            }`}>
              {executionResult ? (
                <span>DECISION: {executionResult.decision} ({executionResult.statusCode})</span>
              ) : (
                <span>STAGE 5: REAL-TIME DECISION (ALLOW / BLOCK)</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 text-center flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-400 animate-pulse hidden lg:block" />
          </div>

          {/* Service B (Destination Target) */}
          <div className={`lg:col-span-2 p-4 rounded-2xl text-center space-y-2 transition-all ${
            executionResult?.decision === 'BLOCKED'
              ? 'bg-rose-900 text-white shadow-md border-2 border-rose-500'
              : 'bg-slate-900 text-white shadow-md'
          }`}>
            <Lock className={`w-6 h-6 mx-auto ${executionResult?.decision === 'BLOCKED' ? 'text-rose-400' : 'text-emerald-400'}`} />
            <h3 className="font-mono text-xs font-bold uppercase truncate">{targetService}</h3>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold block">
              {executionResult?.decision === 'BLOCKED' ? 'PROTECTED (ISOLATED)' : 'SERVICE B (Target)'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* 4. INTERACTIVE REQUEST WORKBENCH & PRESET ATTACK SCENARIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Request Simulator Form */}
        <GlassCard className="lg:col-span-2 border border-slate-200/80 bg-white p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Real-Time Request Execution & Threat Injector
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Send test HTTP requests through the Zero Trust Proxy to verify instant real-time interception</p>
          </div>

          {/* Preset Attack Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Quick Test Attack Scenarios:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => applyPreset('authorized')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-left cursor-pointer transition-all"
              >
                <div className="text-[10px] text-emerald-700 font-bold">✔ VALID</div>
                <div className="truncate mt-0.5">Auth -&gt; Profile</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('lateral')}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-900 font-bold text-left cursor-pointer transition-all"
              >
                <div className="text-[10px] text-rose-700 font-bold">⚡ LATERAL ATTACK</div>
                <div className="truncate mt-0.5">Analytics -&gt; Vault</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('sqli')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-bold text-left cursor-pointer transition-all"
              >
                <div className="text-[10px] text-amber-800 font-bold">⚠️ SQL INJECTION</div>
                <div className="truncate mt-0.5">Ingress -&gt; Charge</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset('unauthorized')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-left cursor-pointer transition-all"
              >
                <div className="text-[10px] text-slate-600 font-bold">🔒 NO JWT TOKEN</div>
                <div className="truncate mt-0.5">Rogue -&gt; Vault</div>
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            <div>
              <label className="block font-mono font-bold uppercase text-slate-700 mb-1">
                Origin Microservice (Service A)
              </label>
              <input
                type="text"
                value={originService}
                onChange={(e) => setOriginService(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 font-bold focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-mono font-bold uppercase text-slate-700 mb-1">
                Target Microservice (Service B)
              </label>
              <input
                type="text"
                value={targetService}
                onChange={(e) => setTargetService(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 font-bold focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-mono font-bold uppercase text-slate-700 mb-1">
                HTTP Method & Path
              </label>
              <div className="flex gap-2">
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Checkbox Attack Injectors */}
            <div className="space-y-2 pt-2 font-mono text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasValidJwt}
                  onChange={(e) => setHasValidJwt(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="font-bold text-slate-800">Include Valid mTLS & JWT Identity</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-rose-700 font-bold">
                <input
                  type="checkbox"
                  checked={hasLateralMovement}
                  onChange={(e) => setHasLateralMovement(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Simulate Lateral Movement Scope Violation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-amber-800 font-bold">
                <input
                  type="checkbox"
                  checked={hasSqlPayload}
                  onChange={(e) => setHasSqlPayload(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Inject SQLi Payload Pattern</span>
              </label>
            </div>
          </div>

          {/* Trigger Request Execution Button */}
          <div className="pt-2">
            <button
              onClick={runProxyPipeline}
              disabled={isExecuting}
              className="w-full py-3 rounded-2xl black-btn font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{isExecuting ? 'INTERCEPTING THROUGH ZERO TRUST PROXY...' : 'SEND REQUEST THROUGH ZERO TRUST PROXY'}</span>
            </button>
          </div>
        </GlassCard>

        {/* Right 1 Col: Real-Time Proxy Inspection Output Card */}
        <GlassCard className="lg:col-span-1 border border-slate-200/80 bg-white p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Proxy Inspection Telemetry
            </h3>

            {executionResult ? (
              <div className="space-y-3 pt-3 font-mono text-xs">
                {/* Decision Badge */}
                <div className={`p-3 rounded-2xl text-center font-bold ${
                  executionResult.decision === 'ALLOWED'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500">FINAL DECISION</div>
                  <div className="text-lg font-black">{executionResult.decision} ({executionResult.statusCode})</div>
                </div>

                {/* Detailed Stage Results */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">1. JWT Identity:</span>
                    <span className={executionResult.jwtValid ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {executionResult.jwtValid ? '✔ VERIFIED' : '✕ INVALID'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">2. Policy Engine:</span>
                    <span className={executionResult.policyPassed ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {executionResult.policyPassed ? '✔ SCOPE OK' : '✕ VIOLATION'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">3. Threat Risk Score:</span>
                    <span className={`font-bold ${executionResult.riskScore > 70 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {executionResult.riskScore} / 100 ({executionResult.riskScore > 70 ? 'CRITICAL' : 'SAFE'})
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Proxy Inspection Latency:</span>
                    <span className="text-slate-900 font-bold">{executionResult.latencyMs} ms</span>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div className="p-3 rounded-xl bg-slate-900 text-white text-[11px]">
                  <span className="text-emerald-400 font-bold block mb-1">REASON & MITIGATION:</span>
                  <p className="text-slate-300">{executionResult.reason}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-mono text-xs space-y-2">
                <Cpu className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
                <p>Click "Send Request" to observe real-time proxy decision telemetry.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
            <span>PROXY ENGINE v3.4</span>
            <span>SHARD-01</span>
          </div>
        </GlassCard>
      </div>

      {/* 5. Intercepted Attacks Ledger Table */}
      <GlassCard className="border border-slate-200/80 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Live Intercepted Inter-Service Requests Ledger
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Real-time ledger of microservice requests processed by Zero Trust Proxy</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            Total Interceptions: {interceptionHistory.length}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Interception ID</th>
                <th className="py-3.5 px-4">Origin (Service A)</th>
                <th className="py-3.5 px-4">Target (Service B)</th>
                <th className="py-3.5 px-4 text-center">JWT / Scope</th>
                <th className="py-3.5 px-4 text-center">Risk Score</th>
                <th className="py-3.5 px-4 text-center">Decision</th>
                <th className="py-3.5 px-4">Interception Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {interceptionHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{item.origin}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{item.target}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.jwtValid && item.policyPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.jwtValid && item.policyPassed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    <span className={item.riskScore > 70 ? 'text-rose-600' : 'text-slate-900'}>
                      {item.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      item.decision === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {item.decision}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
