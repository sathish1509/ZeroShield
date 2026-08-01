import http from 'node:http';
import app from '../src/app.js';

const demoUsers = {
  ADMIN: { email: 'admin@zeroshield.io', password: 'admin_secret_key_2026' },
  ANALYST: { email: 'analyst@zeroshield.io', password: 'analyst_sec_key_2026' },
  DEVOPS: { email: 'devops@zeroshield.io', password: 'devops_infra_key_2026' },
};

const server = http.createServer(app);

const listen = () =>
  new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address()));
  });

const close = () =>
  new Promise((resolve) => {
    server.close(resolve);
  });

async function requestJson(baseUrl, path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = {};
  if (body) headers['content-type'] = 'application/json';
  if (token) headers['authorization'] = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();
  return { status: response.status, json };
}

async function loginUser(baseUrl, credentials) {
  const res = await requestJson(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: credentials,
  });
  if (res.status !== 200 || !res.json?.data?.accessToken) {
    throw new Error(`Login failed for ${credentials.email}: ${JSON.stringify(res.json)}`);
  }
  return res.json.data.accessToken;
}

async function runTests() {
  const address = await listen();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    console.log('--- Logging in demo users ---');
    const adminToken = await loginUser(baseUrl, demoUsers.ADMIN);
    const analystToken = await loginUser(baseUrl, demoUsers.ANALYST);
    const devopsToken = await loginUser(baseUrl, demoUsers.DEVOPS);

    console.log('✅ Auth tokens retrieved for ADMIN, ANALYST, DEVOPS');

    // 1. Test Ingress Traffic Ingestion & Query APIs
    console.log('\n--- 1. Testing Traffic Ingestion & Log Queries ---');
    const createTrafficRes = await requestJson(baseUrl, '/api/traffic', {
      method: 'POST',
      token: adminToken,
      body: {
        method: 'POST',
        endpoint: '/api/v1/orders/checkout',
        statusCode: 200,
        responseTimeMs: 110,
        requestSizeBytes: 540,
        ipAddress: '203.0.113.15',
      },
    });
    if (createTrafficRes.status !== 201 || !createTrafficRes.json?.data?.log) {
      throw new Error(`Traffic creation failed: ${JSON.stringify(createTrafficRes.json)}`);
    }
    console.log(`  ✓ Ingress traffic log recorded (ID: ${createTrafficRes.json.data.log.id})`);

    for (const [role, token] of Object.entries({ ADMIN: adminToken, ANALYST: analystToken, DEVOPS: devopsToken })) {
      const trafficRes = await requestJson(baseUrl, '/api/traffic', { token });
      if (trafficRes.status !== 200 || !Array.isArray(trafficRes.json?.data?.logs)) {
        throw new Error(`GET /api/traffic failed for ${role}: ${JSON.stringify(trafficRes.json)}`);
      }
      console.log(`  ✓ ${role} retrieved ${trafficRes.json.data.logs.length} traffic log frames`);
    }

    // 2. Test Threat Detection & Status Management
    console.log('\n--- 2. Testing Threat Engine & Resolution RBAC ---');
    const createThreatRes = await requestJson(baseUrl, '/api/threats', {
      method: 'POST',
      token: adminToken,
      body: {
        description: 'Test Threat: Suspicious Authentication Anomaly',
        severity: 'HIGH',
        status: 'OPEN',
        ipAddress: '198.51.100.99',
      },
    });
    if (createThreatRes.status !== 201 || !createThreatRes.json?.data?.threat) {
      throw new Error(`Threat creation failed: ${JSON.stringify(createThreatRes.json)}`);
    }
    const testThreatId = createThreatRes.json.data.threat.id;
    console.log(`  ✓ Security threat registered (ID: ${testThreatId})`);

    // ANALYST resolves threat -> 200 OK
    const analystResolve = await requestJson(baseUrl, `/api/threats/${testThreatId}/status`, {
      method: 'PUT',
      token: analystToken,
      body: { status: 'RESOLVED' },
    });
    if (analystResolve.status !== 200 || analystResolve.json?.data?.threat?.status !== 'RESOLVED') {
      throw new Error(`ANALYST resolving threat failed: ${JSON.stringify(analystResolve.json)}`);
    }
    console.log('  ✓ ANALYST updated threat status to RESOLVED');

    // DEVOPS attempts to update threat status -> 403 FORBIDDEN
    const devopsResolve = await requestJson(baseUrl, `/api/threats/${testThreatId}/status`, {
      method: 'PUT',
      token: devopsToken,
      body: { status: 'OPEN' },
    });
    if (devopsResolve.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS updating threat status, got ${devopsResolve.status}`);
    }
    console.log('  ✓ DEVOPS threat status update returned 403 FORBIDDEN');

    // 3. Test SOC Attack War-Room Simulator
    console.log('\n--- 3. Testing SOC Attack War-Room Simulator Execution ---');
    // DEVOPS attempt to execute simulation -> 403 FORBIDDEN
    const devopsSim = await requestJson(baseUrl, '/api/simulation/execute', {
      method: 'POST',
      token: devopsToken,
      body: { attackType: 'SQL_INJECTION' },
    });
    if (devopsSim.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS simulation execution, got ${devopsSim.status}`);
    }
    console.log('  ✓ DEVOPS simulation execution returned 403 FORBIDDEN');

    // ADMIN executes all 6 attack scenarios
    const scenarios = [
      'SQL_INJECTION',
      'EXPIRED_JWT',
      'GEO_FENCING',
      'DDOS_SURGE',
      'LATERAL_MOVEMENT',
      'TOKEN_FORGERY',
    ];
    for (const attackType of scenarios) {
      const simRes = await requestJson(baseUrl, '/api/simulation/execute', {
        method: 'POST',
        token: adminToken,
        body: { attackType },
      });
      if (simRes.status !== 200 || simRes.json?.data?.executionStatus !== 'COMPLETED') {
        throw new Error(`Simulation failed for ${attackType}: ${JSON.stringify(simRes.json)}`);
      }
      console.log(`  ✓ Simulated ${attackType} -> Threat #${simRes.json.data.threatId} created`);
    }

    // 4. Test System Metrics & Telemetry Analytics APIs
    console.log('\n--- 4. Testing Dashboard KPIs & Telemetry Analytics ---');
    const dashRes = await requestJson(baseUrl, '/api/dashboard', { token: adminToken });
    if (dashRes.status !== 200 || typeof dashRes.json?.data?.kpis?.totalTrafficLogs !== 'number') {
      throw new Error(`Dashboard metrics failed: ${JSON.stringify(dashRes.json)}`);
    }
    console.log(`  ✓ Dashboard KPIs retrieved: ${dashRes.json.data.kpis.totalTrafficLogs} logs, ${dashRes.json.data.kpis.openThreatsCount} open threats`);

    const analyticsRes = await requestJson(baseUrl, '/api/analytics', { token: analystToken });
    if (analyticsRes.status !== 200 || !analyticsRes.json?.data?.overview) {
      throw new Error(`Analytics metrics failed: ${JSON.stringify(analyticsRes.json)}`);
    }
    console.log(`  ✓ Analytics telemetry retrieved: ${analyticsRes.json.data.overview.totalLogs} total requests, ${analyticsRes.json.data.topTargetedEndpoints.length} top targeted endpoints`);

    // 5. Verify Automatic Audit Logs for Phase 4 Actions
    console.log('\n--- 5. Verifying Automatic Audit Logs for Phase 4 ---');
    await new Promise((r) => setTimeout(r, 150));
    const auditRes = await requestJson(baseUrl, '/api/audit', { token: adminToken });
    if (auditRes.status !== 200 || !auditRes.json?.data?.logs?.length) {
      throw new Error(`Audit logs failed: ${JSON.stringify(auditRes.json)}`);
    }
    const actions = auditRes.json.data.logs.map((l) => l.action);
    console.log(`  ✓ Audit actions recorded: ${[...new Set(actions)].join(', ')}`);

    console.log('\n🎉 ALL PHASE 4 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await close();
  }
}

runTests().catch((error) => {
  console.error('\n❌ Phase 4 test suite failed:', error);
  process.exitCode = 1;
});
