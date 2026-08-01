import { WebSocketServer, WebSocket } from 'ws';
import { verifyAccessToken } from '../utils/token.js';

let wss = null;

export const initWebSocketServer = (server) => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let token = url.searchParams.get('token');

      if (!token && req.headers['authorization']?.startsWith('Bearer ')) {
        token = req.headers['authorization'].slice(7);
      }

      if (!token) {
        ws.close(4001, 'Authentication token required');
        return;
      }

      const payload = verifyAccessToken(token);
      ws.user = {
        id: Number(payload.sub),
        role: payload.role,
        email: payload.email,
        name: payload.name,
      };

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.send(
        JSON.stringify({
          type: 'SYSTEM_CONNECTED',
          message: 'Connected to ZeroShield Real-Time Security Stream',
          user: ws.user,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (_err) {
      ws.close(4001, 'Invalid or expired authentication token');
    }
  });

  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
};

export const broadcastTrafficEvent = (trafficData) => {
  if (!wss) return;
  const payload = JSON.stringify({
    type: 'TRAFFIC_EVENT',
    data: trafficData,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.user) {
      client.send(payload);
    }
  });
};

export const broadcastThreatEvent = (threatData) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.user) {
      let payloadData = threatData;
      if (client.user.role === 'DEVOPS') {
        payloadData = {
          id: threatData.id,
          severity: threatData.severity,
          status: threatData.status,
          detectedAt: threatData.detectedAt,
          summary: 'Threat alert registered on monitored service mesh element',
        };
      }

      client.send(
        JSON.stringify({
          type: 'THREAT_DETECTED',
          data: payloadData,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });
};

export const broadcastSimulationEvent = (eventType, simulationData) => {
  if (!wss) return;
  const payload = JSON.stringify({
    type: eventType, // e.g. SIMULATION_STARTED, SIMULATION_STEP, SIMULATION_COMPLETED, SIMULATION_STOPPED
    data: simulationData,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.user) {
      client.send(payload);
    }
  });
};
