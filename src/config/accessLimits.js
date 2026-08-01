export const ROLES = {
  ADMIN: {
    id: 'ADMIN',
    name: 'Administrator',
    title: 'Administrator',
    tag: 'Full Access',
    badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    description: "The Administrator is responsible for managing the entire ZeroShield platform, configuring security policies, and monitoring microservices.",
    permissions: [
      'View Dashboard',
      'Monitor Live API Traffic',
      'View Service Mesh',
      'Configure Zero Trust Policies',
      'Register New Microservices',
      'Generate & Manage JWT Identities',
      'View Threat Detection',
      'Access Audit Logs',
      'Run Attack Simulations',
      'View Analytics',
      'Manage Users & Roles',
      'System Settings'
    ],
    restrictions: [
      'None (Full Access)'
    ]
  },
  ANALYST: {
    id: 'ANALYST',
    name: 'Security Analyst',
    title: 'Security Analyst',
    tag: 'Read-Only Security Monitoring',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    description: "Continuously monitors API communications, investigates suspicious activities, and responds to security incidents. Cannot modify security configurations.",
    permissions: [
      'View Dashboard',
      'Monitor Live Traffic',
      'View Threat Detection',
      'View Audit Logs',
      'View Service Topology',
      'View Analytics'
    ],
    restrictions: [
      'Cannot change policies',
      'Cannot register services',
      'Cannot create users',
      'Cannot modify JWT settings',
      'Cannot change system configuration',
      'Cannot access admin settings'
    ]
  },
  DEVOPS: {
    id: 'DEVOPS',
    name: 'DevOps Engineer',
    title: 'DevOps Engineer',
    tag: 'Infrastructure Management',
    badgeColor: 'bg-slate-100 text-slate-800 border border-slate-200',
    description: "Responsible for deploying and maintaining microservices while ensuring they communicate securely through the Zero Trust Proxy.",
    permissions: [
      'Register Microservices',
      'View Service Mesh',
      'Generate Service JWT Tokens',
      'Monitor Service Health',
      'View Analytics',
      'View Dashboard'
    ],
    restrictions: [
      'Cannot change security policies',
      'Cannot manage users',
      'Cannot run attack simulations',
      'Cannot modify system settings',
      'Cannot access confidential security logs'
    ]
  }
};

export const PAGE_ACCESS_MATRIX = {
  dashboard: {
    pageName: 'Dashboard',
    ADMIN: 'ALLOWED',
    ANALYST: 'ALLOWED',
    DEVOPS: 'ALLOWED'
  },
  traffic: {
    pageName: 'Live Traffic',
    ADMIN: 'ALLOWED',
    ANALYST: 'ALLOWED',
    DEVOPS: 'VIEW_ONLY'
  },
  topology: {
    pageName: 'Service Mesh',
    ADMIN: 'ALLOWED',
    ANALYST: 'ALLOWED',
    DEVOPS: 'ALLOWED'
  },
  threats: {
    pageName: 'Threat Detection',
    ADMIN: 'ALLOWED',
    ANALYST: 'ALLOWED',
    DEVOPS: 'VIEW_ONLY'
  },
  policies: {
    pageName: 'Policy Engine',
    ADMIN: 'ALLOWED',
    ANALYST: 'RESTRICTED',
    DEVOPS: 'RESTRICTED'
  },
  audit: {
    pageName: 'Audit Logs',
    ADMIN: 'ALLOWED',
    ANALYST: 'ALLOWED',
    DEVOPS: 'VIEW_ONLY'
  },
  simulation: {
    pageName: 'Attack Simulation',
    ADMIN: 'ALLOWED',
    ANALYST: 'RESTRICTED',
    DEVOPS: 'RESTRICTED'
  },
  analytics: {
    pageName: 'Analytics',
    ADMIN: 'ALLOWED',
    ANALYST: 'ALLOWED',
    DEVOPS: 'ALLOWED'
  },
  settings: {
    pageName: 'Settings & User Mgmt',
    ADMIN: 'ALLOWED',
    ANALYST: 'RESTRICTED',
    DEVOPS: 'RESTRICTED'
  }
};

export const checkPageAccess = (roleId, pageId) => {
  const pageConfig = PAGE_ACCESS_MATRIX[pageId];
  if (!pageConfig) return 'ALLOWED';
  return pageConfig[roleId] || 'RESTRICTED';
};
