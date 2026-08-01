import { asyncHandler } from '../utils/asyncHandler.js';
import { createTrafficLogEntry, findTrafficLogs } from '../models/trafficModel.js';
import { broadcastTrafficEvent } from '../realtime/websocket.js';
import { z } from 'zod';

const createTrafficSchema = z.object({
  sourceServiceId: z.number().int().optional().nullable(),
  targetServiceId: z.number().int().optional().nullable(),
  method: z.string().min(1),
  endpoint: z.string().min(1),
  statusCode: z.number().int(),
  responseTimeMs: z.number().int().optional(),
  requestSizeBytes: z.number().int().optional(),
  ipAddress: z.string().optional(),
});

export const getTraffic = asyncHandler(async (req, res) => {
  const { statusCode, method, sourceServiceId, targetServiceId, ipAddress, page, limit } = req.query;

  const result = await findTrafficLogs({
    statusCode,
    method,
    sourceServiceId,
    targetServiceId,
    ipAddress,
    page,
    limit,
  });

  res.json({
    status: 'success',
    data: {
      logs: result.logs,
      pagination: result.pagination,
    },
  });
});

export const createTrafficLog = asyncHandler(async (req, res) => {
  const validated = createTrafficSchema.parse(req.body);
  const log = await createTrafficLogEntry(validated);

  // Broadcast traffic frame to connected WebSocket clients
  broadcastTrafficEvent(log);

  res.status(201).json({
    status: 'success',
    data: { log },
  });
});
