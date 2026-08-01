import { asyncHandler } from '../utils/asyncHandler.js';
import { findAuditLogs, getAuditSummary } from '../models/auditModel.js';
import { findTopologyData } from '../models/serviceModel.js';

const buildPayload = (module, message, req) => ({
  module,
  message,
  user: req.user,
});

export const getDashboard = (req, res) => {
  res.json({ data: buildPayload('dashboard', 'Authenticated dashboard access granted.', req) });
};

export const getTraffic = (req, res) => {
  res.json({ data: buildPayload('traffic', 'Traffic inspection access granted.', req) });
};

export const getTopology = asyncHandler(async (_req, res) => {
  const topology = await findTopologyData();
  res.json({
    status: 'success',
    data: topology,
  });
});

export const getThreats = (req, res) => {
  res.json({ data: buildPayload('threats', 'Threat monitoring access granted.', req) });
};

export const getAuditLogs = asyncHandler(async (req, res) => {
  if (req.user.role === 'DEVOPS') {
    const summary = await getAuditSummary();
    return res.json({
      status: 'success',
      data: {
        viewType: 'SUMMARY_ONLY',
        summary,
        message: 'DevOps role has summary-only access to audit statistics. Detailed log content is restricted.',
      },
    });
  }

  const { userId, resource, startDate, endDate, page, limit } = req.query;

  const result = await findAuditLogs({
    userId,
    resource,
    startDate,
    endDate,
    page,
    limit,
  });

  res.json({
    status: 'success',
    data: {
      viewType: 'FULL',
      logs: result.logs,
      pagination: result.pagination,
    },
  });
});

export const getSimulation = (req, res) => {
  res.json({ data: buildPayload('simulation', 'Attack simulation access granted.', req) });
};

export const getAnalytics = (req, res) => {
  res.json({ data: buildPayload('analytics', 'Analytics access granted.', req) });
};

export const getSettings = (req, res) => {
  res.json({ data: buildPayload('settings', 'Settings access granted.', req) });
};