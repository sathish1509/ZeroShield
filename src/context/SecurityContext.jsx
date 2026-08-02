import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_SERVICES,
  INITIAL_ALERTS,
  INITIAL_POLICIES,
  INITIAL_TRAFFIC,
  INITIAL_AUDIT_LOGS
} from '../mock/mockData';
import { ROLES, checkPageAccess } from '../config/accessLimits';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('zeroshield_auth');
    return savedAuth === null ? true : savedAuth === 'true';
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('zeroshield_page');
    return savedPage && savedPage !== 'login' ? savedPage : 'dashboard';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const savedRole = localStorage.getItem('zeroshield_role');
    return savedRole && ROLES[savedRole] ? savedRole : 'ADMIN';
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Persist session to localStorage
  useEffect(() => {
    localStorage.setItem('zeroshield_auth', isAuthenticated);
    localStorage.setItem('zeroshield_page', currentPage);
    localStorage.setItem('zeroshield_role', currentRole);
  }, [isAuthenticated, currentPage, currentRole]);
  
  // Log Source Tracker (Static Baseline vs Ingested Custom Logs)
  const [logSource, setLogSource] = useState({
    isCustom: false,
    name: 'Static Baseline Data',
    recordCount: 1420500,
    uploadTime: null
  });

  // Real-time Telemetry State
  const INITIAL_STATS = {
    totalRequests: 1420500,
    allowedRequests: 1378000,
    blockedRequests: 42500,
    activeServices: 8,
    threatLevel: 'Elevated', // 'Low', 'Elevated', 'High', 'CRITICAL'
    avgLatency: 8.4
  };

  const [stats, setStats] = useState(INITIAL_STATS);

  const [services, setServices] = useState(INITIAL_SERVICES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [traffic, setTraffic] = useState(INITIAL_TRAFFIC);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  
  // Attack Simulation State
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState([]);

  // Gemini AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedAlertForAi, setSelectedAlertForAi] = useState(null);

  const openAiModal = (alertData = null) => {
    setSelectedAlertForAi(alertData);
    setIsAiModalOpen(true);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setSelectedAlertForAi(null);
  };

  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Log Parser & Custom Log Ingestion Engine
  const ingestCustomLogs = (logInput, sourceName = 'Uploaded Log Stream') => {
    try {
      let rawEntries = [];

      // 1. Try parsing if logInput is JSON
      if (typeof logInput === 'string') {
        const trimmed = logInput.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsedJson = JSON.parse(trimmed);
            rawEntries = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
          } catch (e) {
            // Split by lines if JSON.parse fails
            rawEntries = trimmed.split('\n').filter(Boolean);
          }
        } else {
          rawEntries = trimmed.split('\n').filter(Boolean);
        }
      } else if (Array.isArray(logInput)) {
        rawEntries = logInput;
      }

      if (rawEntries.length === 0) {
        showToast('No valid log records found in the provided input.', 'warning');
        return false;
      }

      // 2. Extract structured log objects
      let totalLatencySum = 0;
      let latencyCount = 0;
      const parsedTraffic = [];
      const parsedAlerts = [];
      const parsedAudit = [];

      const targetServices = [
        'Order Processing Service',
        'Payment Gateway Service',
        'Inventory & Stock Service',
        'Edge API Gateway',
        'Notification & SMS Engine',
        'Encrypted Core DB Cluster'
      ];

      rawEntries.forEach((entry, index) => {
        let timestamp = new Date().toTimeString().split(' ')[0];
        let ip = '192.168.1.100';
        let method = 'GET';
        let endpoint = '/api/v1/resource';
        let destination = targetServices[index % targetServices.length];
        let isThreat = false;
        let threatType = 'Security Anomaly';
        let reason = 'Inspection anomaly detected';
        let riskScore = 15;
        let latencyVal = 8.0;

        if (typeof entry === 'object' && entry !== null) {
          timestamp = entry.timestamp || entry.time || timestamp;
          ip = entry.ip || entry.source || entry.client_ip || ip;
          method = (entry.method || method).toUpperCase();
          endpoint = entry.endpoint || entry.path || entry.url || endpoint;
          destination = entry.destination || entry.service || destination;
          
          if (entry.status && (parseInt(entry.status) >= 400 || entry.status === 'Blocked')) {
            isThreat = true;
          }
          if (entry.threat || entry.reason || entry.riskScore > 50) {
            isThreat = true;
            threatType = entry.threat || entry.type || threatType;
            reason = entry.reason || reason;
          }
          riskScore = entry.riskScore || (isThreat ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 20));
          latencyVal = parseFloat(entry.latency || 8.4);
        } else if (typeof entry === 'string') {
          // Text line parsing
          const ipMatch = entry.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
          if (ipMatch) ip = ipMatch[0];

          const methodMatch = entry.match(/\b(GET|POST|PUT|DELETE|PATCH|OPTIONS)\b/i);
          if (methodMatch) method = methodMatch[0].toUpperCase();

          const epMatch = entry.match(/\/api\/[^\s"]+/);
          if (epMatch) endpoint = epMatch[0];

          const latMatch = entry.match(/(\d+(\.\d+)?)\s*ms/);
          if (latMatch) latencyVal = parseFloat(latMatch[1]);

          if (/blocked|error|critical|sqli|jwt|injection|401|403|500|invalid/i.test(entry)) {
            isThreat = true;
            if (/sqli|select|union/i.test(entry)) threatType = 'SQL Injection Attempt';
            else if (/jwt|token|expired/i.test(entry)) threatType = 'Expired JWT Token Replay';
            else if (/geo|country|location/i.test(entry)) threatType = 'Geo Policy Violation';
            else if (/rate|burst|limit/i.test(entry)) threatType = 'Rate Limit Exceeded';
            reason = `Ingested log event: ${entry.substring(0, 60)}...`;
            riskScore = Math.floor(Math.random() * 25 + 75);
          }
        }

        totalLatencySum += latencyVal;
        latencyCount++;

        const decision = isThreat ? 'Blocked' : 'Allowed';

        // Add to traffic
        const trafficItem = {
          id: `cust-tr-${Date.now()}-${index}`,
          timestamp,
          source: ip,
          destination,
          method,
          endpoint,
          jwtStatus: isThreat ? 'Invalid / Violation' : 'Valid (RS256)',
          riskScore,
          latency: `${latencyVal.toFixed(1)}ms`,
          decision
        };
        parsedTraffic.push(trafficItem);

        // Add to alerts if threat
        if (isThreat) {
          const alertItem = {
            id: `cust-alt-${Date.now()}-${index}`,
            time: timestamp,
            type: threatType,
            service: destination,
            severity: riskScore > 85 ? 'critical' : 'high',
            reason,
            ip,
            status: 'Blocked'
          };
          parsedAlerts.push(alertItem);
        }

        // Add to audit logs
        parsedAudit.push({
          id: `cust-aud-${Date.now()}-${index}`,
          timestamp: `2026-08-02 ${timestamp}`,
          source: ip,
          destination,
          endpoint,
          decision,
          reason: isThreat ? reason : 'Passed Policy & JWT Verification',
          latency: `${latencyVal.toFixed(1)}ms`,
          riskScore
        });
      });

      const allowedCount = parsedTraffic.filter(t => t.decision === 'Allowed').length;
      const blockedCount = parsedTraffic.filter(t => t.decision === 'Blocked').length;
      const avgLatencyVal = latencyCount > 0 ? (totalLatencySum / latencyCount).toFixed(1) : 8.4;
      const calculatedThreatLevel = blockedCount > (rawEntries.length * 0.25) ? 'CRITICAL' : blockedCount > 0 ? 'High' : 'Low';

      const logTime = new Date().toLocaleTimeString();

      setLogSource({
        isCustom: true,
        name: sourceName,
        recordCount: rawEntries.length,
        uploadTime: logTime
      });

      setStats({
        totalRequests: rawEntries.length,
        allowedRequests: allowedCount,
        blockedRequests: blockedCount,
        activeServices: 8,
        threatLevel: calculatedThreatLevel,
        avgLatency: parseFloat(avgLatencyVal)
      });

      setTraffic(parsedTraffic.slice(0, 50));
      if (parsedAlerts.length > 0) {
        setAlerts(parsedAlerts);
      }
      setAuditLogs(parsedAudit.slice(0, 50));

      showToast(`Successfully ingested ${rawEntries.length} custom log records from "${sourceName}"!`, 'success');
      return true;
    } catch (err) {
      console.error('Error ingesting logs:', err);
      showToast('Failed to parse log content. Please check the log format.', 'error');
      return false;
    }
  };

  // Reset to Initial Static Baseline Data
  const resetToStaticBaseline = () => {
    setLogSource({
      isCustom: false,
      name: 'Static Baseline Data',
      recordCount: 1420500,
      uploadTime: null
    });
    setStats(INITIAL_STATS);
    setServices(INITIAL_SERVICES);
    setAlerts(INITIAL_ALERTS);
    setTraffic(INITIAL_TRAFFIC);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    showToast('Reset telemetry to initial static baseline data.', 'info');
  };

  // Traffic Generator ONLY runs during explicit attack simulation mode
  useEffect(() => {
    if (!isSimulating) return; // Keep static when not simulating

    const interval = setInterval(() => {
      const isThreat = Math.random() < 0.75;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      const sampleEndpoints = [
        { ep: '/api/v1/orders', dest: 'Order Processing Service', method: 'GET' },
        { ep: '/api/v1/payments/checkout', dest: 'Payment Gateway Service', method: 'POST' },
        { ep: '/api/v1/inventory/query', dest: 'Inventory & Stock Service', method: 'GET' },
        { ep: '/api/v1/user/profile', dest: 'Edge API Gateway', method: 'GET' }
      ];

      const chosenEp = sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)];
      
      const newTrafficItem = {
        id: `tr-${Date.now()}`,
        timestamp: timeStr,
        source: isThreat ? 'Untrusted IP' : 'External Client',
        destination: chosenEp.dest,
        method: chosenEp.method,
        endpoint: chosenEp.ep,
        jwtStatus: isThreat ? 'Expired / Invalid' : 'Valid (RS256)',
        riskScore: isThreat ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20),
        latency: `${(Math.random() * 8 + 4).toFixed(1)}ms`,
        decision: isThreat ? 'Blocked' : 'Allowed'
      };

      setTraffic(prev => [newTrafficItem, ...prev.slice(0, 49)]);

      // Update counters
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        allowedRequests: isThreat ? prev.allowedRequests : prev.allowedRequests + 1,
        blockedRequests: isThreat ? prev.blockedRequests + 1 : prev.blockedRequests
      }));

    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Attack Trigger Handler
  const triggerAttack = (attackType) => {
    setIsSimulating(true);
    setActiveSimulation(attackType);

    const timeStr = new Date().toTimeString().split(' ')[0];
    let alertDetails = {};

    switch (attackType) {
      case 'sqli':
        alertDetails = {
          type: 'SQL Injection Attack',
          service: 'Order Processing Service',
          severity: 'critical',
          reason: "Malicious payload detected: UNION SELECT * FROM users--",
          ip: '194.26.29.112'
        };
        break;
      case 'jwt':
        alertDetails = {
          type: 'Expired JWT Token Replay',
          service: 'Payment Gateway Service',
          severity: 'high',
          reason: 'Token signature timestamp invalid (replayed credentials)',
          ip: '185.220.101.5'
        };
        break;
      case 'geo':
        alertDetails = {
          type: 'Geo-Fencing Violation',
          service: 'Inventory & Stock Service',
          severity: 'high',
          reason: 'Blocked connection attempt originating from Restricted Region (RU/CN)',
          ip: '95.173.136.72'
        };
        break;
      case 'ddos':
        alertDetails = {
          type: 'Distributed Denial of Service (DDoS)',
          service: 'Edge API Gateway',
          severity: 'critical',
          reason: 'High volume burst traffic detected (50,000 req/sec)',
          ip: 'Botnet Cluster (14,200 IPs)'
        };
        break;
      case 'lateral':
        alertDetails = {
          type: 'Lateral Movement Attempt',
          service: 'Encrypted Core DB Cluster',
          severity: 'critical',
          reason: 'Unauthorized microservice connection attempt without mTLS ticket',
          ip: '10.0.3.30 (Compromised)'
        };
        break;
      case 'replay':
        alertDetails = {
          type: 'Token Replay & Forgery',
          service: 'Payment Gateway Service',
          severity: 'critical',
          reason: 'Forged JWT HMAC secret mismatch',
          ip: '198.51.100.24'
        };
        break;
      default:
        alertDetails = {
          type: 'Cyber Security Anomaly',
          service: 'Zero Trust Proxy',
          severity: 'high',
          reason: 'Unknown payload signature pattern',
          ip: '192.0.2.1'
        };
    }

    const newAlert = {
      id: `alt-${Date.now()}`,
      time: timeStr,
      status: 'Blocked',
      ...alertDetails
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Add to Audit Log
    const newLog = {
      id: `aud-${Date.now()}`,
      timestamp: `2026-08-01 ${timeStr}`,
      source: alertDetails.ip,
      destination: alertDetails.service,
      endpoint: '/api/v1/attack-vector',
      decision: 'Blocked',
      reason: alertDetails.reason,
      latency: '0.4ms',
      riskScore: 99
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update Threat Level & Stats
    setStats(prev => ({
      ...prev,
      blockedRequests: prev.blockedRequests + 1450,
      threatLevel: 'CRITICAL'
    }));

    showToast(`🚨 ATTACK DETECTED: ${alertDetails.type} - Automatically Blocked by Proxy!`, 'error');

    // Auto cool-down after 8 seconds
    setTimeout(() => {
      setIsSimulating(false);
      setStats(prev => ({
        ...prev,
        threatLevel: 'Elevated'
      }));
    }, 8000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setActiveSimulation(null);
    setStats(prev => ({ ...prev, threatLevel: 'Low' }));
    showToast('Attack simulation neutralized. ZeroShield operating normally.', 'success');
  };

  // Toggle Policy
  const togglePolicy = (policyId) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        const nextState = !p.enabled;
        showToast(`Policy "${p.name}" ${nextState ? 'ENABLED' : 'DISABLED'}`, nextState ? 'success' : 'warning');
        return { ...p, enabled: nextState };
      }
      return p;
    }));
  };

  const login = (roleKey = 'ADMIN') => {
    if (ROLES[roleKey]) {
      setCurrentRole(roleKey);
    }
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    showToast(`Authenticated as ${ROLES[roleKey]?.title || 'SecOps Admin'}`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
    showToast('Logged out of ZeroShield', 'info');
  };

  const switchRole = (newRoleKey) => {
    if (ROLES[newRoleKey]) {
      setCurrentRole(newRoleKey);
      showToast(`Switched access role to ${ROLES[newRoleKey].title}`, 'info');
    }
  };

  return (
    <SecurityContext.Provider value={{
      isAuthenticated,
      currentPage,
      setCurrentPage,
      currentRole,
      setCurrentRole,
      switchRole,
      ROLES,
      checkPageAccess: (pageId) => checkPageAccess(currentRole, pageId),
      searchQuery,
      setSearchQuery,
      stats,
      logSource,
      ingestCustomLogs,
      resetToStaticBaseline,
      services,
      alerts,
      policies,
      traffic,
      auditLogs,
      activeSimulation,
      isSimulating,
      triggerAttack,
      stopSimulation,
      isAiModalOpen,
      selectedAlertForAi,
      openAiModal,
      closeAiModal,
      togglePolicy,
      login,
      logout,
      toastMessage,
      showToast
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);
