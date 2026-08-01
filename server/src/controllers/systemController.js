import { asyncHandler } from '../utils/asyncHandler.js';
import { findAuditLogs, findAuditLogsForExport, getAuditSummary } from '../models/auditModel.js';
import { findTopologyData } from '../models/serviceModel.js';
import {
  getAnalyticsDetailedMetrics,
  getDashboardLandingSummary,
  getDashboardSummaryMetrics,
} from '../models/analyticsModel.js';

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

export const getDashboardLanding = asyncHandler(async (_req, res) => {
  const summary = await getDashboardLandingSummary();
  res.json({
    status: 'success',
    data: summary,
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
  const { userId, resource, action, query, startDate, endDate, page, limit } = req.query;

  if (req.user.role === 'DEVOPS') {
    const summary = await getAuditSummary({ startDate, endDate });
    return res.json({
      status: 'success',
      data: {
        viewType: 'SUMMARY_ONLY',
        summary,
        message: 'DevOps role has summary-only access to audit statistics. Detailed log content is restricted.',
      },
    });
  }

  const result = await findAuditLogs({
    userId,
    resource,
    action,
    query,
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

export const exportAuditLogs = asyncHandler(async (req, res) => {
  const { format = 'csv', userId, resource, action, query, startDate, endDate } = req.query;

  if (req.user.role === 'DEVOPS') {
    const summary = await getAuditSummary({ startDate, endDate });

    if (format.toLowerCase() === 'json') {
      return res.json({
        status: 'success',
        data: {
          viewType: 'SUMMARY_ONLY',
          summary,
        },
      });
    }

    // CSV format for DevOps Summary
    const csvRows = ['Category,Key,Count', `TotalLogs,,${summary.totalLogs}`];
    summary.actionsSummary.forEach((item) => {
      csvRows.push(`Action,${item.action},${item.count}`);
    });
    summary.resourcesSummary.forEach((item) => {
      csvRows.push(`Resource,${item.resource},${item.count}`);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-summary-export.csv"');
    return res.status(200).send(csvRows.join('\n'));
  }

  // Full export for ADMIN and ANALYST
  const logs = await findAuditLogsForExport({
    userId,
    resource,
    action,
    query,
    startDate,
    endDate,
  });

  if (format.toLowerCase() === 'json') {
    return res.json({
      status: 'success',
      data: {
        viewType: 'FULL',
        logs,
      },
    });
  }

  // CSV format for Admin/Analyst raw logs
  const headers = ['ID', 'Timestamp', 'User ID', 'User Name', 'User Email', 'User Role', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Details'];
  const rows = [headers.join(',')];

  logs.forEach((log) => {
    const detailsStr = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
    rows.push(
      [
        log.id,
        `"${log.createdAt.toISOString()}"`,
        log.userId,
        `"${log.user?.name || ''}"`,
        `"${log.user?.email || ''}"`,
        `"${log.user?.role || ''}"`,
        `"${log.action}"`,
        `"${log.resource}"`,
        `"${log.resourceId || ''}"`,
        `"${log.ipAddress || ''}"`,
        `"${detailsStr}"`,
      ].join(',')
    );
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-logs-export.csv"');
  return res.status(200).send(rows.join('\n'));
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