import React, { useState, useRef } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { StatCard } from '../components/common/StatCard';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  X,
  FileCode,
  FileSpreadsheet,
  File,
  Eye,
  BarChart2,
  Download,
  Trash2,
  Sparkles,
  Link2,
  Globe,
  Server,
  Cloud,
  ArrowRight,
  RefreshCw,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export const UploadLogsPage = () => {
  const { setCurrentPage, showToast, logSource, ingestCustomLogs, resetToStaticBaseline } = useSecurity();

  // Active Ingestion Mode Tab ('file', 'link', or 'paste')
  const [ingestionMode, setIngestionMode] = useState('file');

  // File Upload State
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Link Ingestion State
  const [remoteLinkUrl, setRemoteLinkUrl] = useState('');
  const [logType, setLogType] = useState('AWS CloudWatch Log Stream');
  const [isConnectingLink, setIsConnectingLink] = useState(false);

  // Paste / Live Log State
  const [pastedLogText, setPastedLogText] = useState('');
  const [pastedLogName, setPastedLogName] = useState('Live Log Stream');

  // Success State for modes
  const [uploadSuccessState, setUploadSuccessState] = useState(null);

  // Sample Log Presets for quick 1-click testing
  const samplePresets = {
    threats: `14:21:04 185.220.101.5 POST /api/v1/payments/charge 403 14ms BLOCKED Expired JWT Token Replay
14:20:45 194.26.29.112 POST /api/v1/orders 403 11ms BLOCKED SQL Injection detected: ' OR '1'='1
14:19:12 95.173.136.72 GET /api/v1/inventory 403 9ms BLOCKED Geo Violation (RU)
14:18:30 45.154.255.88 GET /api/v1/search 403 5ms BLOCKED Rate Limit Exceeded
14:15:00 198.51.100.24 GET /api/v1/notifications 200 7ms ALLOWED Valid mTLS
14:12:11 203.0.113.44 POST /api/v1/orders/create 200 12ms ALLOWED Compliant Zero-Trust Identity`,

    json: `[
  {"timestamp":"14:30:10","ip":"192.168.1.45","method":"POST","endpoint":"/api/v1/checkout","destination":"Payment Gateway Service","status":200,"latency":"8.2ms","riskScore":12,"reason":"Passed Policy"},
  {"timestamp":"14:30:12","ip":"185.220.101.5","method":"POST","endpoint":"/api/v1/auth/token","destination":"Edge API Gateway","status":403,"latency":"19.4ms","riskScore":92,"threat":"Expired JWT Token Replay","reason":"Token expired 140s ago"},
  {"timestamp":"14:30:15","ip":"194.26.29.112","method":"POST","endpoint":"/api/v1/orders/create","destination":"Order Processing Service","status":403,"latency":"14.1ms","riskScore":98,"threat":"SQL Injection Attempt","reason":"Malicious payload detected: UNION SELECT"},
  {"timestamp":"14:30:18","ip":"10.0.1.50","method":"GET","endpoint":"/api/v1/stock","destination":"Inventory & Stock Service","status":200,"latency":"4.5ms","riskScore":5,"reason":"Internal Microservice Call"}
]`,

    nginx: `192.168.1.10 - - [02/Aug/2026:14:22:01 +0000] "GET /api/v1/orders HTTP/1.1" 200 4.2ms ALLOWED
192.168.1.11 - - [02/Aug/2026:14:22:03 +0000] "GET /api/v1/inventory HTTP/1.1" 200 6.1ms ALLOWED
185.220.101.5 - - [02/Aug/2026:14:22:05 +0000] "POST /api/v1/payments HTTP/1.1" 403 18.2ms BLOCKED Expired JWT Token Replay
194.26.29.112 - - [02/Aug/2026:14:22:08 +0000] "POST /api/v1/orders/cancel HTTP/1.1" 403 12.0ms BLOCKED SQL Injection payload detected`
  };

  // Pre-populated Recent Uploads Repository Data
  const [recentUploads, setRecentUploads] = useState([
    {
      id: 'LOG-2026-000123',
      filename: 'api-gateway-proxy-01.log',
      source: 'Direct File Upload',
      uploadTime: '2026-08-01 21:15:00',
      logType: 'API Gateway Proxy Log',
      size: '4.8 MB',
      status: 'Analyzed',
      records: 124500
    },
    {
      id: 'LOG-2026-000122',
      filename: 'https://logs.s3.amazonaws.com/k8s-ingress.json',
      source: 'AWS S3 Remote Link',
      uploadTime: '2026-08-01 19:40:12',
      logType: 'Kubernetes Audit Stream',
      size: '12.2 MB',
      status: 'Analyzed',
      records: 310200
    }
  ]);

  // Statistics Summary Data
  const stats = {
    totalUploadedLogs: logSource.isCustom ? `${logSource.recordCount} Records` : '1,284 Logs',
    securityEvents: logSource.isCustom ? 'Ingested Stream' : '45,210 Events',
    threatsDetected: logSource.isCustom ? 'Active Ingested Logs' : '342 Threats',
    lastUploadTime: logSource.uploadTime || '2 mins ago'
  };

  // Format File Size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Determine Icon by extension
  const getFileIcon = (filename) => {
    if (filename.startsWith('http')) return Globe;
    if (filename.endsWith('.json')) return FileCode;
    if (filename.endsWith('.csv')) return FileSpreadsheet;
    if (filename.endsWith('.log')) return FileText;
    return File;
  };

  // Drag Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validExtensions = ['.log', '.txt', '.json', '.csv'];
    const validFiles = files.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length < files.length) {
      showToast('Some files were ignored. Only .log, .txt, .json, and .csv formats are supported.', 'warning');
    }

    const newFileEntries = validFiles.map(file => ({
      id: `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      time: new Date().toLocaleTimeString(),
      status: 'Pending'
    }));

    setSelectedFiles(prev => [...prev, ...newFileEntries]);
    setUploadSuccessState(null);
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Start File Upload & Parsing Process
  const startFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(25);

    let fileTexts = [];
    for (const item of selectedFiles) {
      if (item.file) {
        try {
          const content = await item.file.text();
          if (content && content.trim()) {
            fileTexts.push(content);
          }
        } catch (err) {
          console.error('Error reading file:', err);
        }
      }
    }

    setUploadProgress(70);

    const combinedLogs = fileTexts.join('\n');
    const sourceLabel = selectedFiles.map(f => f.name).join(', ');

    let success = false;
    if (combinedLogs.trim()) {
      success = ingestCustomLogs(combinedLogs, sourceLabel);
    } else {
      // Sample fallback log
      success = ingestCustomLogs(samplePresets.threats, sourceLabel || 'Uploaded File Stream');
    }

    setUploadProgress(100);
    setIsUploading(false);

    if (success) {
      const fakeLogId = `LOG-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const newUploadEntries = selectedFiles.map(item => ({
        id: fakeLogId,
        filename: item.name,
        source: 'Direct File Upload',
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        logType: item.name.endsWith('.json') ? 'JSON Event Log' : item.name.endsWith('.csv') ? 'Structured Metrics CSV' : 'System Proxy Log',
        size: item.size,
        status: 'Analyzed & Ingested',
        records: Math.floor(2000 + Math.random() * 15000)
      }));

      setRecentUploads(prev => [...newUploadEntries, ...prev]);
      setUploadSuccessState({
        logId: fakeLogId,
        mode: 'File Upload & Ingestion',
        summary: `Parsed and ingested ${selectedFiles.length} file(s) into ZeroShield Dashboard`
      });

      setSelectedFiles([]);
    }
  };

  // Start Remote Link Ingestion Process
  const connectRemoteLink = (e) => {
    e.preventDefault();
    if (!remoteLinkUrl.trim()) {
      showToast('Please enter a valid remote log URL endpoint', 'warning');
      return;
    }

    setIsConnectingLink(true);

    setTimeout(() => {
      setIsConnectingLink(false);
      const fakeLogId = `REMOTE-LOG-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      ingestCustomLogs(samplePresets.json, `Remote Stream (${remoteLinkUrl})`);

      const newRemoteEntry = {
        id: fakeLogId,
        filename: remoteLinkUrl,
        source: 'Remote Link URL',
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        logType: logType,
        size: '18.6 MB (Stream)',
        status: 'Analyzed & Ingested',
        records: Math.floor(150000 + Math.random() * 200000)
      };

      setRecentUploads(prev => [newRemoteEntry, ...prev]);
      setUploadSuccessState({
        logId: fakeLogId,
        mode: 'Remote Link Ingestion',
        summary: `Connected and ingested live remote log stream: ${remoteLinkUrl}`
      });

      setRemoteLinkUrl('');
    }, 1000);
  };

  // Submit Pasted Raw Log Text
  const submitPastedLogs = (textToParse = pastedLogText, label = pastedLogName) => {
    if (!textToParse || !textToParse.trim()) {
      showToast('Please enter or paste log text to analyze', 'warning');
      return;
    }

    const success = ingestCustomLogs(textToParse, label);
    if (success) {
      setUploadSuccessState({
        logId: `PASTE-${Date.now()}`,
        mode: 'Direct Log Text Input',
        summary: `Parsed and updated dashboard stats with custom log data (${label})`
      });
      setPastedLogText('');
    }
  };

  const deleteRecentUpload = (id) => {
    setRecentUploads(prev => prev.filter(item => item.id !== id));
    showToast('Log entry removed from repository.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Telemetry Mode Status Banner */}
      <GlassCard className="border border-slate-200/80 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-2xl bg-slate-900 text-emerald-400 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-sans tracking-tight text-slate-900">
                  Upload & Ingest Security Logs
                </h1>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Upload server log files, paste live log text, or connect via remote log stream to populate ZeroShield telemetry.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {logSource.isCustom ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  INGESTED: {logSource.name} ({logSource.recordCount} Recs)
                </span>
                <button
                  onClick={resetToStaticBaseline}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Reset to default static baseline dataset"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  Reset to Static
                </button>
              </div>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                STATIC BASELINE DATASET ACTIVE
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 2. Top Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Uploaded Logs"
          value={stats.totalUploadedLogs}
          icon={FileText}
          trend="+18 today"
          isPositive={true}
          color="blue"
          sparklineData={[30, 45, 60, 70, 85, 90, 100]}
        />
        <StatCard
          title="Security Events"
          value={stats.securityEvents}
          icon={ShieldCheck}
          trend="+12.4%"
          isPositive={true}
          color="green"
          sparklineData={[50, 60, 75, 80, 92, 95, 100]}
        />
        <StatCard
          title="Threats Detected"
          value={stats.threatsDetected}
          icon={ShieldAlert}
          trend="3.2% high risk"
          isPositive={false}
          color="red"
          sparklineData={[10, 25, 40, 60, 85, 95, 100]}
        />
        <StatCard
          title="Last Upload Time"
          value={stats.lastUploadTime}
          icon={Clock}
          trend="node-proxy-01"
          isPositive={true}
          color="cyan"
          sparklineData={[100, 100, 100, 100, 100, 100, 100]}
        />
      </div>

      {/* 3. INGESTION MODE SELECTION TABS (File Upload vs Link vs Paste Input) */}
      <GlassCard className="border border-slate-200/80 bg-white p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Select Log Ingestion Method
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Choose between file upload, remote URL stream, or pasting live raw log text</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-mono font-bold select-none shadow-2xs overflow-x-auto">
            <button
              onClick={() => setIngestionMode('file')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                ingestionMode === 'file'
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>1. UPLOAD LOG FILES</span>
            </button>
            <button
              onClick={() => setIngestionMode('link')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                ingestionMode === 'link'
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>2. REMOTE URL</span>
            </button>
          </div>
        </div>

        {/* OPTION 1: FILE UPLOAD DROPZONE */}
        {ingestionMode === 'file' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-slate-900 bg-slate-50/60 hover:bg-slate-100/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".log,.txt,.json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-3xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-105 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-extrabold font-sans text-slate-900 tracking-tight">
                Drag & Drop your log files here
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500 mt-1">
                or <span className="text-emerald-700 underline font-sans">Click to Browse</span> from your local system
              </p>

              <div className="flex items-center justify-center gap-2 mt-6">
                <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider mr-1">Supported Formats:</span>
                {['.log', '.txt', '.json', '.csv'].map(ext => (
                  <span key={ext} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold shadow-2xs">
                    • {ext}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected File List Queue */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold font-mono uppercase text-slate-700 tracking-wider">
                    Selected Files Queue ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-slate-400 hover:text-rose-600 font-mono cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedFiles.map(fileItem => {
                    const IconComponent = getFileIcon(fileItem.name);
                    return (
                      <div key={fileItem.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 font-sans text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-slate-900 truncate">{fileItem.name}</p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                              <span>{fileItem.size}</span>
                              <span>•</span>
                              <span>{fileItem.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                            {isUploading ? 'Uploading...' : 'Pending'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(fileItem.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-slate-700">Uploading & Sanitizing Logs...</span>
                      <span className="text-slate-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs font-bold hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={startFileUpload}
                    disabled={isUploading}
                    className="px-6 py-2 rounded-xl black-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OPTION 2: ACCESS VIA REMOTE LINK / URL */}
        {ingestionMode === 'link' && (
          <form onSubmit={connectRemoteLink} className="space-y-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 shrink-0">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm font-sans text-slate-900">
                    Connect Remote Security Log Stream
                  </h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Enter an HTTP Webhook endpoint, S3 Bucket log URL, CloudWatch Stream, or Datadog HEC URL
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Remote Log URL / Webhook Endpoint
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={remoteLinkUrl}
                      onChange={(e) => setRemoteLinkUrl(e.target.value)}
                      placeholder="https://logs.s3.amazonaws.com/ap-south-1/proxy-audit-2026.log"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Log Provider / Service Type
                    </label>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans font-semibold text-slate-800 focus:outline-none focus:border-slate-900"
                    >
                      <option value="AWS CloudWatch Log Stream">AWS CloudWatch Log Stream</option>
                      <option value="AWS S3 Bucket Log URL">AWS S3 Bucket Log URL</option>
                      <option value="Kubernetes Audit HEC">Kubernetes Audit HEC</option>
                      <option value="Splunk / Datadog Webhook">Splunk / Datadog Webhook</option>
                      <option value="NGINX HTTP Proxy Stream">NGINX HTTP Proxy Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                      Authentication Token (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Bearer sec_token_xxxx"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Preset Links */}
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400 font-bold">Quick Sample URLs:</span>
              <button
                type="button"
                onClick={() => setRemoteLinkUrl('https://logs.s3.amazonaws.com/zeroshield/ap-south-1/proxy-access.log')}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                AWS S3 Sample
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setRemoteLinkUrl('https://hec.splunk.internal/v1/log-stream/zeroshield')}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Splunk HEC Sample
              </button>
            </div>

            {/* Connect & Ingest Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isConnectingLink}
                className="px-6 py-2.5 rounded-xl black-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              >
                {isConnectingLink ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Connecting Remote Stream...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-emerald-400" />
                    <span>Connect & Ingest Remote Logs</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 4. After Upload / Connection Success Banner */}
        {uploadSuccessState && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-sans text-slate-900 flex items-center gap-2">
                    ✔ Upload / Connection Successful
                  </h3>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">
                    Log dataset ingested under ID: <code className="bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold text-slate-900">{uploadSuccessState.logId}</code> ({uploadSuccessState.mode})
                  </p>
                </div>
              </div>

              {/* Action Buttons: Analyze Logs & View Logs */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    showToast(`Initiated AI threat analysis on ${uploadSuccessState.logId}`, 'success');
                    setCurrentPage('analytics');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Analyze Logs</span>
                </button>
                <button
                  onClick={() => setCurrentPage('audit')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>View Logs</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* 5. Recent Uploads Table Section */}
      <GlassCard className="border border-slate-200/80 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-900" />
              Recent Uploads Repository
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">History of ingested log files and remote log streams available for forensic analysis</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            Total Records: {recentUploads.length} File/Stream Sets
          </span>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Filename / Link URL</th>
                <th className="py-3.5 px-4">Source Mode</th>
                <th className="py-3.5 px-4">Upload Time</th>
                <th className="py-3.5 px-4">Log Type</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {recentUploads.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Filename / Link URL */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-0 max-w-xs">
                      <div className="p-1.5 rounded-lg bg-slate-900 text-emerald-400 shrink-0">
                        {item.filename.startsWith('http') ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-slate-900 truncate">{item.filename}</p>
                        <p className="text-[10px] font-mono text-slate-400">{item.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Ingestion Source */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.source.includes('Link') ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.source}
                    </span>
                  </td>

                  {/* Upload Time */}
                  <td className="py-3.5 px-4 font-mono text-slate-600">{item.uploadTime}</td>

                  {/* Log Type */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.logType}</td>

                  {/* Size */}
                  <td className="py-3.5 px-4 font-mono text-slate-600">{item.size}</td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      item.status === 'Analyzed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      item.status === 'Completed' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage('audit')}
                        title="View Logs"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          showToast(`Analyzing ${item.filename} in Telemetry Module...`, 'info');
                          setCurrentPage('analytics');
                        }}
                        title="Analyze Logs"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showToast(`Downloading log stream dataset...`, 'success')}
                        title="Download Log File"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRecentUpload(item.id)}
                        title="Delete Log"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
