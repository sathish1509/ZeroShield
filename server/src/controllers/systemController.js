import { asyncHandler } from '../utils/asyncHandler.js';
import { findAuditLogs, getAuditSummary } from '../models/auditModel.js';
import { findTopologyData } from '../models/serviceModel.js';
import { getAnalyticsDetailedMetrics, getDashboardSummaryMetrics } from '../models/analyticsModel.js';

const buildPayload = (module, message, req) => ({
  module,
  message,
  user: req.user,
});

export const getDashboard = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummaryMetrics();
  res.json({
    status: 'success',
    data: {
      user: req.user,
      kpis: summary.kpis,
      recentAlerts: summary.recentAlerts,
    },
  });
});

export const getTopology = asyncHandler(async (_req, res) => {
  const topology = await findTopologyData();
  res.json({
    status: 'success',
    data: topology,
  });
});

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

export const getAnalytics = asyncHandler(async (req, res) => {
  const metrics = await getAnalyticsDetailedMetrics();
  res.json({
    status: 'success',
    data: {
      user: req.user,
      ...metrics,
    },
  });
});

export const getSettings = (req, res) => {
  res.json({ data: buildPayload('settings', 'Settings access granted.', req) });
};