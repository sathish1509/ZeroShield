import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Sparkles, X, ShieldAlert, Globe, Cpu, CheckCircle2, RefreshCw, Send, Terminal, AlertTriangle } from 'lucide-react';
import { analyzeWithGeminiAI } from '../../services/geminiService';
import { checkAbuseIp } from '../../services/abuseIpdbService';
import { lookupIpInfo } from '../../services/ipinfoService';

export const GeminiAiModal = ({ isOpen, onClose, initialPrompt = '', alertData = null }) => {
  const [prompt, setPrompt] = useState(initialPrompt || (alertData ? `Analyze security alert: ${alertData.type} targeting ${alertData.service} from IP ${alertData.ip}` : ''));
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // IP Intelligence state
  const [targetIp, setTargetIp] = useState(alertData?.ip || '185.220.101.5');
  const [ipInfoData, setIpInfoData] = useState(null);
  const [abuseData, setAbuseData] = useState(null);
  const [isCheckingIp, setIsCheckingIp] = useState(false);

  if (!isOpen) return null;

  // Run Gemini AI Threat Analysis
  const handleRunAiAnalysis = async (customText = prompt) => {
    if (!customText || !customText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const result = await analyzeWithGeminiAI(customText);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setAnalysisResult('Error connecting to Gemini AI API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run IP Lookup (IPInfo + AbuseIPDB)
  const handleCheckIpIntelligence = async (ipToLookup = targetIp) => {
    if (!ipToLookup) return;
    setIsCheckingIp(true);

    try {
      const [ipInfo, abuse] = await Promise.all([
        lookupIpInfo(ipToLookup),
        checkAbuseIp(ipToLookup)
      ]);
      setIpInfoData(ipInfo);
      setAbuseData(abuse);
    } catch (err) {
      console.error('IP Intel lookup error:', err);
    } finally {
      setIsCheckingIp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <GlassCard className="w-full max-w-4xl bg-white border border-slate-200/90 p-6 space-y-6 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400 shadow-xs">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold font-sans text-slate-900">
                  Gemini AI Cyber Analyst & IP Intelligence
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  LIVE API INTEGRATED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Powered by Google Gemini 1.5 Flash, AbuseIPDB Threat Database, and IPInfo Geolocation API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live IP Lookup Banner Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>IP Threat Intelligence & Geolocation Lookup:</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                placeholder="Enter IP (e.g. 185.220.101.5)"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleCheckIpIntelligence(targetIp)}
                disabled={isCheckingIp}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isCheckingIp ? 'Querying APIs...' : 'Query AbuseIPDB & IPInfo'}
              </button>
            </div>
          </div>

          {/* IP Intelligence Results */}
          {(ipInfoData || abuseData) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">📍 IPInfo Geolocation Data</span>
                <p><strong className="text-emerald-400">Location:</strong> {ipInfoData?.city}, {ipInfoData?.region}, {ipInfoData?.country}</p>
                <p><strong className="text-emerald-400">ISP / Org:</strong> {ipInfoData?.org}</p>
                <p><strong className="text-emerald-400">Coordinates:</strong> {ipInfoData?.loc}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">🚨 AbuseIPDB Threat Score</span>
                <p>
                  <strong className="text-emerald-400">Abuse Confidence:</strong>{' '}
                  <span className={`px-2 py-0.5 rounded font-extrabold ${
                    abuseData?.abuseConfidenceScore > 50 ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                  }`}>
                    {abuseData?.abuseConfidenceScore}% Malicious
                  </span>
                </p>
                <p><strong className="text-emerald-400">Reports (90d):</strong> {abuseData?.totalReports} Community Complaints</p>
                <p><strong className="text-emerald-400">Domain / Type:</strong> {abuseData?.domain} ({abuseData?.usageType})</p>
              </div>
            </div>
          )}
        </div>

        {/* Gemini AI Prompt Input Box */}
        <div className="space-y-3">
          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
            Ask Gemini AI Security Analyst / Enter Incident Telemetry
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Gemini AI to analyze SQLi payloads, explain JWT replay vulnerabilities, or generate SOC RCA..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400 font-bold">Quick Presets:</span>
              <button
                type="button"
                onClick={() => {
                  const p = "Analyze SQL Injection payload ' UNION SELECT username, password FROM users-- on /api/v1/orders";
                  setPrompt(p);
                  handleRunAiAnalysis(p);
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Analyze SQLi
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  const p = "Explain Expired JWT Token Replay vulnerability and how RS256 prevents it in Zero Trust Mesh";
                  setPrompt(p);
                  handleRunAiAnalysis(p);
                }}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Explain JWT Replay
              </button>
            </div>

            <button
              onClick={() => handleRunAiAnalysis()}
              disabled={isAnalyzing || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl black-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Gemini AI Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Generate Gemini AI Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gemini AI Result Box */}
        {analysisResult && (
          <div className="p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3 animate-in fade-in font-mono text-xs leading-relaxed">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
                <Terminal className="w-4 h-4" />
                <span>Google Gemini AI Security Assessment Output</span>
              </div>
              <span className="text-[10px] text-slate-400">Gemini 1.5 Flash</span>
            </div>

            <div className="whitespace-pre-wrap text-slate-200 space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {analysisResult}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
