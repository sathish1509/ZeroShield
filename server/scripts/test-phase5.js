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

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const text = await response.text();
  let json = null;
  if (isJson) {
    try {
      json = JSON.parse(text);
    } catch (_e) {
      json = null;
    }
  }

  return { status: response.status, headers: response.headers, text, json };
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

    // 1. Test Audit Log Refinement & Search
    console.log('\n--- 1. Testing Refined Audit Search & Search Filters ---');
    const searchRes = await requestJson(baseUrl, '/api/audit?query=POLICY', { token: adminToken });
    if (searchRes.status !== 200 || !Array.isArray(searchRes.json?.data?.logs)) {
      throw new Error(`Audit search failed: ${JSON.stringify(searchRes.json)}`);
    }
    console.log(`  ✓ Search query 'POLICY' returned ${searchRes.json.data.logs.length} matching audit logs`);

    // 2. Test Audit Log Export (CSV and JSON) across Roles
    console.log('\n--- 2. Testing Audit Log Export (ADMIN vs ANALYST vs DEVOPS) ---');
    // ADMIN Full JSON & CSV Export
    const adminExportJson = await requestJson(baseUrl, '/api/audit/export?format=json', { token: adminToken });
    if (adminExportJson.status !== 200 || adminExportJson.json?.data?.viewType !== 'FULL') {
      throw new Error(`ADMIN JSON export failed: ${JSON.stringify(adminExportJson.json)}`);
    }
    console.log(`  ✓ ADMIN full JSON audit export returned ${adminExportJson.json.data.logs.length} logs`);

    const adminExportCsv = await requestJson(baseUrl, '/api/audit/export?format=csv', { token: adminToken });
    if (adminExportCsv.status !== 200 || !adminExportCsv.text.startsWith('ID,Timestamp,User ID')) {
      throw new Error('ADMIN CSV export failed header verification');
    }
    console.log('  ✓ ADMIN CSV export returned formatted raw log header and records');

    // DEVOPS Summary-Only Export (JSON & CSV)
    const devopsExportJson = await requestJson(baseUrl, '/api/audit/export?format=json', { token: devopsToken });
    if (devopsExportJson.status !== 200 || devopsExportJson.json?.data?.viewType !== 'SUMMARY_ONLY') {
      throw new Error(`Expected SUMMARY_ONLY for DEVOPS JSON export: ${JSON.stringify(devopsExportJson.json)}`);
    }
    console.log('  ✓ DEVOPS JSON export returned summary-only metrics (raw log details omitted)');

    const devopsExportCsv = await requestJson(baseUrl, '/api/audit/export?format=csv', { token: devopsToken });
    if (devopsExportCsv.status !== 200 || !devopsExportCsv.text.startsWith('Category,Key,Count')) {
      throw new Error('DEVOPS CSV export failed summary header verification');
    }
    console.log('  ✓ DEVOPS CSV export returned aggregated category summary counts');

    // 3. Test Analytics Aggregation Endpoints for All Roles (including DEVOPS)
    console.log('\n--- 3. Testing Analytics Aggregation Endpoints (DEVOPS Full Analytics Access) ---');

    // Traffic Summary
    const trafficSum = await requestJson(baseUrl, '/api/analytics/traffic-summary?range=24h', { token: devopsToken });
    if (trafficSum.status !== 200 || !Array.isArray(trafficSum.json?.data?.statusDistribution)) {
      throw new Error(`Traffic summary failed: ${JSON.stringify(trafficSum.json)}`);
    }
    console.log(`  ✓ GET /api/analytics/traffic-summary returned ${trafficSum.json.data.statusDistribution.length} status categories`);

    // Threat Summary
    const threatSum = await requestJson(baseUrl, '/api/analytics/threat-summary?range=7d', { token: analystToken });
    if (threatSum.status !== 200 || !Array.isArray(threatSum.json?.data?.bySeverity)) {
      throw new Error(`Threat summary failed: ${JSON.stringify(threatSum.json)}`);
    }
    console.log(`  ✓ GET /api/analytics/threat-summary returned ${threatSum.json.data.bySeverity.length} severity breakdowns`);

    // Service Health Metrics
    const serviceHealth = await requestJson(baseUrl, '/api/analytics/service-health?range=24h', { token: adminToken });
    if (serviceHealth.status !== 200 || !Array.isArray(serviceHealth.json?.data?.services)) {
      throw new Error(`Service health failed: ${JSON.stringify(serviceHealth.json)}`);
    }
    console.log(`  ✓ GET /api/analytics/service-health returned uptime & response times for ${serviceHealth.json.data.services.length} services`);

    // Audit Summary
    const auditSum = await requestJson(baseUrl, '/api/analytics/audit-summary?range=24h', { token: devopsToken });
    if (auditSum.status !== 200 || !Array.isArray(auditSum.json?.data?.byAction)) {
      throw new Error(`Audit summary failed: ${JSON.stringify(auditSum.json)}`);
    }
    console.log(`  ✓ GET /api/analytics/audit-summary returned ${auditSum.json.data.byAction.length} action types`);

    // 4. Test Dashboard Landing Summary Endpoint
    console.log('\n--- 4. Testing Dashboard Summary Endpoint (/api/dashboard/summary) ---');
    const dashSummary = await requestJson(baseUrl, '/api/dashboard/summary', { token: adminToken });
    if (
      dashSummary.status !== 200 ||
      !dashSummary.json?.data?.servicesSummary ||
      !dashSummary.json?.data?.threatsSummary ||
      !dashSummary.json?.data?.trafficToday
    ) {
      throw new Error(`Dashboard landing summary failed: ${JSON.stringify(dashSummary.json)}`);
    }
    console.log(
      `  ✓ GET /api/dashboard/summary returned services (${dashSummary.json.data.servicesSummary.totalServices}), open threats (${dashSummary.json.data.threatsSummary.openThreatsCount}), and traffic today (${dashSummary.json.data.trafficToday.requestCount})`
    );

    console.log('\n🎉 ALL PHASE 5 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await close();
  }
}

runTests().catch((error) => {
  console.error('\n❌ Phase 5 test suite failed:', error);
  process.exitCode = 1;
});
