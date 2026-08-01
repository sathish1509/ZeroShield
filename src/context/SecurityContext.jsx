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
  
  // Real-time Telemetry State
  const [stats, setStats] = useState({
    totalRequests: 1420500,
    allowedRequests: 1378000,
    blockedRequests: 42500,
    activeServices: 8,
    threatLevel: 'Elevated', // 'Low', 'Elevated', 'High', 'CRITICAL'
    avgLatency: 8.4
  });

  const [services, setServices] = useState(INITIAL_SERVICES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [traffic, setTraffic] = useState(INITIAL_TRAFFIC);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  
  // Attack Simulation State
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState([]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Real-time Traffic Simulator (background activity)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live incoming traffic
      const isThreat = Math.random() < (activeSimulation ? 0.8 : 0.08);
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
  }, [activeSimulation]);

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
      services,
      alerts,
      policies,
      traffic,
      auditLogs,
      activeSimulation,
      isSimulating,
      triggerAttack,
      stopSimulation,
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
