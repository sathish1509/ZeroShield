import { asyncHandler } from '../utils/asyncHandler.js';
import { createThreatRecord, findThreatById, findThreats, updateThreatStatusRecord } from '../models/threatModel.js';
import { broadcastThreatEvent } from '../realtime/websocket.js';
import { z } from 'zod';

const createThreatSchema = z.object({
  ruleId: z.number().int().optional().nullable(),
  sourceServiceId: z.number().int().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  description: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']),
});

export const getThreats = asyncHandler(async (req, res) => {
  const { severity, status, sourceServiceId, page, limit } = req.query;

  const result = await findThreats({
    severity,
    status,
    sourceServiceId,
    page,
    limit,
  });

  res.json({
    status: 'success',
    data: {
      threats: result.threats,
      pagination: result.pagination,
    },
  });
});

export const createThreat = asyncHandler(async (req, res) => {
  const validated = createThreatSchema.parse(req.body);
  const threat = await createThreatRecord(validated);

  // Broadcast threat event to connected WebSocket clients
  broadcastThreatEvent(threat);

  res.status(201).json({
    status: 'success',
    data: { threat },
  });
});

export const updateThreatStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validated = updateStatusSchema.parse(req.body);

  const existing = await findThreatById(id);
  if (!existing) {
    return res.status(404).json({
      status: 'fail',
      message: `Threat with ID ${id} not found`,
    });
  }

  const updatedThreat = await updateThreatStatusRecord(id, validated.status, req.user.id);

  // Broadcast updated threat state
  broadcastThreatEvent(updatedThreat);

  res.json({
    status: 'success',
    data: { threat: updatedThreat },
  });
});
