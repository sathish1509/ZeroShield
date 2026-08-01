const buildPayload = (module, message, req) => ({
  module,
  message,
  user: req.user,
});

export const getDashboard = (req, res) => {
  res.json({ data: buildPayload('dashboard', 'Authenticated dashboard access granted.', req) });
};

export const getPolicies = (req, res) => {
  res.json({ data: buildPayload('policies', 'Policy management placeholder for ADMIN users.', req) });
};

export const getTraffic = (req, res) => {
  res.json({ data: buildPayload('traffic', 'Traffic inspection placeholder.', req) });
};

export const getTopology = (req, res) => {
  res.json({ data: buildPayload('topology', 'Service topology placeholder.', req) });
};

export const getThreats = (req, res) => {
  res.json({ data: buildPayload('threats', 'Threat monitoring placeholder.', req) });
};

export const getAuditLogs = (req, res) => {
  res.json({ data: buildPayload('audit', 'Audit log placeholder.', req) });
};

export const getSimulation = (req, res) => {
  res.json({ data: buildPayload('simulation', 'Attack simulation placeholder for ADMIN users.', req) });
};

export const getAnalytics = (req, res) => {
  res.json({ data: buildPayload('analytics', 'Analytics placeholder.', req) });
};

export const getSettings = (req, res) => {
  res.json({ data: buildPayload('settings', 'Settings placeholder for ADMIN users.', req) });
};