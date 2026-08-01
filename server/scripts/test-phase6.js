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

    // 1. Test Scenario Listing & RBAC Access
    console.log('\n--- 1. Testing GET /api/simulation/scenarios ---');
    const scenariosRes = await requestJson(baseUrl, '/api/simulation/scenarios', { token: adminToken });
    if (scenariosRes.status !== 200 || !Array.isArray(scenariosRes.json?.data?.scenarios)) {
      throw new Error(`Failed to list scenarios: ${JSON.stringify(scenariosRes.json)}`);
    }
    const scenarios = scenariosRes.json.data.scenarios;
    console.log(`  ✓ ADMIN fetched ${scenarios.length} predefined attack scenarios`);

    const targetScenario = scenarios[0];
    if (!targetScenario) throw new Error('No predefined scenarios found');

    // 2. Test ANALYST & DEVOPS 403 on Triggering Simulation Run
    console.log('\n--- 2. Testing ANALYST & DEVOPS 403 on POST /api/simulation/run ---');
    const analystRun = await requestJson(baseUrl, '/api/simulation/run', {
      method: 'POST',
      token: analystToken,
      body: { scenarioId: targetScenario.id },
    });
    if (analystRun.status !== 403) {
      throw new Error(`Expected 403 for ANALYST simulation run, got ${analystRun.status}`);
    }
    console.log('  ✓ ANALYST trigger simulation returned 403 FORBIDDEN');

    const devopsRun = await requestJson(baseUrl, '/api/simulation/run', {
      method: 'POST',
      token: devopsToken,
      body: { scenarioId: targetScenario.id },
    });
    if (devopsRun.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS simulation run, got ${devopsRun.status}`);
    }
    console.log('  ✓ DEVOPS trigger simulation returned 403 FORBIDDEN');

    // 3. Test ADMIN Simulation Run Execution & Real Threat Tagging
    console.log('\n--- 3. Testing ADMIN Trigger Simulation & Synthetic Threat Tagging ---');
    const runRes = await requestJson(baseUrl, '/api/simulation/run', {
      method: 'POST',
      token: adminToken,
      body: { scenarioId: targetScenario.id },
    });
    if (runRes.status !== 201 || !runRes.json?.data?.run?.id) {
      throw new Error(`ADMIN simulation run failed: ${JSON.stringify(runRes.json)}`);
    }
    const runId = runRes.json.data.run.id;
    console.log(`  ✓ Simulation run #${runId} started for '${targetScenario.name}'`);

    // Wait 1.5 seconds for background execution steps
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Test GET /api/simulation/runs/:id Detailed Timeline & Detection Latency
    console.log('\n--- 4. Testing GET /api/simulation/runs/:id (Timeline & Detection Latency) ---');
    const detailsRes = await requestJson(baseUrl, `/api/simulation/runs/${runId}`, { token: adminToken });
    if (detailsRes.status !== 200 || !detailsRes.json?.data?.metrics) {
      throw new Error(`Failed to get run details: ${JSON.stringify(detailsRes.json)}`);
    }
    const { metrics, timeline } = detailsRes.json.data;
    console.log(
      `  ✓ Run #${runId} metrics: ${metrics.totalTrafficInjected} traffic frames injected, ${metrics.threatsDetectedCount} threats triggered`
    );
    console.log(`  ✓ Detection Latency Stat: ${metrics.avgDetectionLatencyMs}ms average detection latency`);
    console.log(`  ✓ Timeline events count: ${timeline.length}`);

    if (metrics.threatsDetectedCount === 0) {
      throw new Error('Simulation run failed to trigger real threat records');
    }

    // 5. Test Stopping a Running Simulation Mid-Execution
    console.log('\n--- 5. Testing POST /api/simulation/runs/:id/stop (Mid-Run Halting) ---');
    const secondScenario = scenarios[1] || scenarios[0];
    const secondRun = await requestJson(baseUrl, '/api/simulation/run', {
      method: 'POST',
      token: adminToken,
      body: { scenarioId: secondScenario.id },
    });
    if (secondRun.status !== 201) {
      throw new Error(`Second simulation run failed: ${JSON.stringify(secondRun.json)}`);
    }
    const secondRunId = secondRun.json.data.run.id;

    // Immediately stop the second run
    const stopRes = await requestJson(baseUrl, `/api/simulation/runs/${secondRunId}/stop`, {
      method: 'POST',
      token: adminToken,
    });
    if (stopRes.status !== 200 || stopRes.json?.data?.run?.status !== 'STOPPED') {
      throw new Error(`Failed to stop simulation: ${JSON.stringify(stopRes.json)}`);
    }
    console.log(`  ✓ Simulation run #${secondRunId} successfully halted and status set to STOPPED`);

    // 6. Verify Automatic Audit Log Entries for Simulation Run & Stop
    console.log('\n--- 6. Verifying Automatic Audit Log Entries ---');
    await new Promise((r) => setTimeout(r, 150));
    const auditRes = await requestJson(baseUrl, '/api/audit?resource=simulation', { token: adminToken });
    if (auditRes.status !== 200 || !auditRes.json?.data?.logs?.length) {
      throw new Error(`Simulation audit logs not found: ${JSON.stringify(auditRes.json)}`);
    }
    console.log(`  ✓ Found ${auditRes.json.data.logs.length} simulation audit log records`);

    console.log('\n🎉 ALL PHASE 6 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await close();
  }
}

runTests().catch((error) => {
  console.error('\n❌ Phase 6 test suite failed:', error);
  process.exitCode = 1;
});
