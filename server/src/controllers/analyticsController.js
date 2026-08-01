import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getAuditAnalyticsSummary,
  getServiceHealthAnalytics,
  getThreatAnalyticsSummary,
  getTrafficAnalyticsSummary,
} from '../models/analyticsModel.js';

export const getTrafficSummaryHandler = asyncHandler(async (req, res) => {
  const { range, serviceId } = req.query;
  const summary = await getTrafficAnalyticsSummary({ range, serviceId });
  res.json({
    status: 'success',
    data: summary,
  });
});

export const getThreatSummaryHandler = asyncHandler(async (req, res) => {
  const { range } = req.query;
  const summary = await getThreatAnalyticsSummary({ range });
  res.json({
    status: 'success',
    data: summary,
  });
});

export const getServiceHealthHandler = asyncHandler(async (req, res) => {
  const { range } = req.query;
  const summary = await getServiceHealthAnalytics({ range });
  res.json({
    status: 'success',
    data: summary,
  });
});

export const getAuditSummaryHandler = asyncHandler(async (req, res) => {
  const { range } = req.query;
  const summary = await getAuditAnalyticsSummary({ range });
  res.json({
    status: 'success',
    data: summary,
  });
});
