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

    // 1. Test GET /api/users/me/permissions
    console.log('\n--- 1. Testing GET /api/users/me/permissions ---');
    for (const [role, token] of Object.entries({ ADMIN: adminToken, ANALYST: analystToken, DEVOPS: devopsToken })) {
      const permRes = await requestJson(baseUrl, '/api/users/me/permissions', { token });
      if (permRes.status !== 200 || permRes.json?.data?.role !== role) {
        throw new Error(`Permissions check failed for ${role}: ${JSON.stringify(permRes.json)}`);
      }
      console.log(`  ✓ ${role} permissions returned (${permRes.json.data.permissions.length} rules)`);
    }

    // 2. Test ANALYST 403 on Policy Mutating Endpoints (POST/PUT/DELETE)
    console.log('\n--- 2. Testing ANALYST 403 on Policy Mutating Endpoints ---');
    const analystPost = await requestJson(baseUrl, '/api/policies', {
      method: 'POST',
      token: analystToken,
      body: {
        name: 'Analyst Hack Policy',
        ruleType: 'RATE_LIMIT',
        ruleConfig: { requestsPerMinute: 50 },
      },
    });
    if (analystPost.status !== 403) {
      throw new Error(`Expected 403 for ANALYST POST /api/policies, got ${analystPost.status}`);
    }
    console.log('  ✓ ANALYST POST /api/policies returned 403 FORBIDDEN');

    const analystPut = await requestJson(baseUrl, '/api/policies/1', {
      method: 'PUT',
      token: analystToken,
      body: { name: 'Updated by Analyst' },
    });
    if (analystPut.status !== 403) {
      throw new Error(`Expected 403 for ANALYST PUT /api/policies/1, got ${analystPut.status}`);
    }
    console.log('  ✓ ANALYST PUT /api/policies/1 returned 403 FORBIDDEN');

    const analystDelete = await requestJson(baseUrl, '/api/policies/1', {
      method: 'DELETE',
      token: analystToken,
    });
    if (analystDelete.status !== 403) {
      throw new Error(`Expected 403 for ANALYST DELETE /api/policies/1, got ${analystDelete.status}`);
    }
    console.log('  ✓ ANALYST DELETE /api/policies/1 returned 403 FORBIDDEN');

    // 3. Test DEVOPS 403 on /api/policies and /api/simulation
    console.log('\n--- 3. Testing DEVOPS 403 on /api/policies & /api/simulation ---');
    const devopsPolicies = await requestJson(baseUrl, '/api/policies', { token: devopsToken });
    if (devopsPolicies.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS GET /api/policies, got ${devopsPolicies.status}`);
    }
    console.log('  ✓ DEVOPS GET /api/policies returned 403 FORBIDDEN');

    const devopsSim = await requestJson(baseUrl, '/api/simulation', { token: devopsToken });
    if (devopsSim.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS GET /api/simulation, got ${devopsSim.status}`);
    }
    console.log('  ✓ DEVOPS GET /api/simulation returned 403 FORBIDDEN');

    // 4. Test Policy Creation & Automatic Audit Log Generation (ADMIN)
    console.log('\n--- 4. Testing Policy Engine CRUD & Auto Audit Logging ---');
    const newPolicyRes = await requestJson(baseUrl, '/api/policies', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Phase 2 Test Rate Limiter',
        description: 'Automated test policy for rate limiting',
        ruleType: 'RATE_LIMIT',
        ruleConfig: { requestsPerMinute: 250, windowMs: 60000 },
        status: 'ACTIVE',
      },
    });
    if (newPolicyRes.status !== 201) {
      throw new Error(`Failed to create policy: ${JSON.stringify(newPolicyRes.json)}`);
    }
    const createdPolicyId = newPolicyRes.json.data.policy.id;
    console.log(`  ✓ Policy created with ID: ${createdPolicyId}`);

    // Wait 100ms for async response finish event to record audit log
    await new Promise((r) => setTimeout(r, 150));

    // Verify Audit Log entry exists for POLICY_CREATE
    const auditCheck = await requestJson(baseUrl, '/api/audit?resource=policies', { token: adminToken });
    if (auditCheck.status !== 200 || !auditCheck.json.data.logs.some((l) => l.action === 'POLICY_CREATE')) {
      throw new Error(`Audit log entry for POLICY_CREATE not found: ${JSON.stringify(auditCheck.json)}`);
    }
    console.log('  ✓ Audit log entry for POLICY_CREATE successfully verified in DB!');

    // Update policy
    const updatePolicyRes = await requestJson(baseUrl, `/api/policies/${createdPolicyId}`, {
      method: 'PUT',
      token: adminToken,
      body: { status: 'INACTIVE' },
    });
    if (updatePolicyRes.status !== 200) {
      throw new Error(`Failed to update policy: ${JSON.stringify(updatePolicyRes.json)}`);
    }
    console.log('  ✓ Policy updated to INACTIVE');

    // 5. Test User Creation & Role Update with Audit Logs
    console.log('\n--- 5. Testing User Management & Audit Logging ---');
    const newUserRes = await requestJson(baseUrl, '/api/users', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Security Test Engineer',
        email: `test_sec_${Date.now()}@zeroshield.io`,
        password: 'secure_password_2026',
        role: 'ANALYST',
      },
    });
    if (newUserRes.status !== 201) {
      throw new Error(`Failed to create user: ${JSON.stringify(newUserRes.json)}`);
    }
    const newUserId = newUserRes.json.data.user.id;
    console.log(`  ✓ User created with ID: ${newUserId}`);

    const roleChangeRes = await requestJson(baseUrl, `/api/users/${newUserId}/role`, {
      method: 'PUT',
      token: adminToken,
      body: { role: 'DEVOPS' },
    });
    if (roleChangeRes.status !== 200 || roleChangeRes.json.data.user.role !== 'DEVOPS') {
      throw new Error(`Failed to update user role: ${JSON.stringify(roleChangeRes.json)}`);
    }
    console.log(`  ✓ User ${newUserId} role updated to DEVOPS`);

    // 6. Test Audit Log View for DEVOPS (Summary only) vs ADMIN (Full logs)
    console.log('\n--- 6. Testing Audit Log View Restrictions (DEVOPS vs ADMIN) ---');
    const devopsAudit = await requestJson(baseUrl, '/api/audit', { token: devopsToken });
    if (devopsAudit.status !== 200 || devopsAudit.json.data.viewType !== 'SUMMARY_ONLY') {
      throw new Error(`Expected SUMMARY_ONLY view for DEVOPS, got: ${JSON.stringify(devopsAudit.json)}`);
    }
    console.log('  ✓ DEVOPS received summary-only audit log view (raw log details restricted)');

    const adminAudit = await requestJson(baseUrl, '/api/audit', { token: adminToken });
    if (adminAudit.status !== 200 || adminAudit.json.data.viewType !== 'FULL' || !Array.isArray(adminAudit.json.data.logs)) {
      throw new Error(`Expected FULL logs for ADMIN, got: ${JSON.stringify(adminAudit.json)}`);
    }
    console.log(`  ✓ ADMIN received full paginated audit logs (${adminAudit.json.data.logs.length} entries)`);

    console.log('\n🎉 ALL PHASE 2 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await close();
  }
}

runTests().catch((error) => {
  console.error('\n❌ Phase 2 test suite failed:', error);
  process.exitCode = 1;
});
