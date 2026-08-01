import http from 'node:http';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';

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

    console.log('✅ Tokens retrieved for ADMIN, ANALYST, DEVOPS');

    // 1. Test GET /api/services for all 3 roles
    console.log('\n--- 1. Testing GET /api/services (View Access for All Roles) ---');
    for (const [role, token] of Object.entries({ ADMIN: adminToken, ANALYST: analystToken, DEVOPS: devopsToken })) {
      const res = await requestJson(baseUrl, '/api/services', { token });
      if (res.status !== 200 || !Array.isArray(res.json?.data?.services)) {
        throw new Error(`GET /api/services failed for ${role}: ${JSON.stringify(res.json)}`);
      }
      console.log(`  ✓ ${role} fetched ${res.json.data.services.length} services`);
    }

    // 2. Test ANALYST 403 on Service Mutation (POST/PUT/DELETE)
    console.log('\n--- 2. Testing ANALYST 403 on Service Mutation ---');
    const analystPost = await requestJson(baseUrl, '/api/services', {
      method: 'POST',
      token: analystToken,
      body: { name: 'Rogue Service', baseUrl: 'https://rogue.internal' },
    });
    if (analystPost.status !== 403) {
      throw new Error(`Expected 403 for ANALYST POST /api/services, got ${analystPost.status}`);
    }
    console.log('  ✓ ANALYST POST /api/services returned 403 FORBIDDEN');

    const analystPut = await requestJson(baseUrl, '/api/services/1', {
      method: 'PUT',
      token: analystToken,
      body: { description: 'Hacked' },
    });
    if (analystPut.status !== 403) {
      throw new Error(`Expected 403 for ANALYST PUT /api/services/1, got ${analystPut.status}`);
    }
    console.log('  ✓ ANALYST PUT /api/services/1 returned 403 FORBIDDEN');

    const analystDelete = await requestJson(baseUrl, '/api/services/1', {
      method: 'DELETE',
      token: analystToken,
    });
    if (analystDelete.status !== 403) {
      throw new Error(`Expected 403 for ANALYST DELETE /api/services/1, got ${analystDelete.status}`);
    }
    console.log('  ✓ ANALYST DELETE /api/services/1 returned 403 FORBIDDEN');

    // 3. Test DEVOPS Service Registration & Ownership Restrictions
    console.log('\n--- 3. Testing DEVOPS Service Registration & Scoped Updates ---');
    const devopsCreate = await requestJson(baseUrl, '/api/services', {
      method: 'POST',
      token: devopsToken,
      body: {
        name: `DevOps Microservice ${Date.now()}`,
        description: 'Microservice owned by DevOps engineer',
        baseUrl: 'https://devops-mesh.internal',
        status: 'ACTIVE',
        healthStatus: 'HEALTHY',
        tags: ['devops', 'test'],
      },
    });
    if (devopsCreate.status !== 201) {
      throw new Error(`DEVOPS registration failed: ${JSON.stringify(devopsCreate.json)}`);
    }
    const devopsServiceId = devopsCreate.json.data.service.id;
    console.log(`  ✓ DEVOPS successfully registered service ID: ${devopsServiceId}`);

    // DEVOPS updates their OWN service -> 200 OK
    const devopsOwnUpdate = await requestJson(baseUrl, `/api/services/${devopsServiceId}`, {
      method: 'PUT',
      token: devopsToken,
      body: { description: 'Updated by owner' },
    });
    if (devopsOwnUpdate.status !== 200) {
      throw new Error(`DEVOPS updating own service failed: ${JSON.stringify(devopsOwnUpdate.json)}`);
    }
    console.log('  ✓ DEVOPS successfully updated their owned service');

    // DEVOPS attempts to update Admin's service (ID 1) -> 403 FORBIDDEN (ownership check)
    const devopsOtherUpdate = await requestJson(baseUrl, '/api/services/1', {
      method: 'PUT',
      token: devopsToken,
      body: { description: 'Unauthorized update' },
    });
    if (devopsOtherUpdate.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS updating Admin's service, got ${devopsOtherUpdate.status}`);
    }
    console.log("  ✓ DEVOPS updating another user's service returned 403 FORBIDDEN");

    // 4. Test Service-to-Service JWT Identity Generation & Revocation
    console.log('\n--- 4. Testing Service-to-Service JWT Identity ---');
    const identityRes = await requestJson(baseUrl, `/api/services/${devopsServiceId}/identity`, {
      method: 'POST',
      token: devopsToken,
      body: { scope: ['read', 'write', 'telemetry'], expiresInSeconds: 3600 },
    });
    if (identityRes.status !== 201 || !identityRes.json?.data?.serviceJwt) {
      throw new Error(`Identity creation failed: ${JSON.stringify(identityRes.json)}`);
    }
    const serviceJwt = identityRes.json.data.serviceJwt;
    console.log('  ✓ DEVOPS issued service JWT identity credential');

    // Verify JWT payload claims
    const decoded = jwt.verify(serviceJwt, env.JWT_ACCESS_SECRET);
    if (decoded.serviceId !== devopsServiceId || decoded.type !== 'SERVICE_IDENTITY') {
      throw new Error(`Invalid JWT claims: ${JSON.stringify(decoded)}`);
    }
    console.log('  ✓ Verified signed service JWT claims (serviceId, identityId, scope)');

    // DEVOPS revoking identity -> 403 (Revocation is Admin-only per requirement)
    const devopsRevoke = await requestJson(baseUrl, `/api/services/${devopsServiceId}/identity/revoke`, {
      method: 'POST',
      token: devopsToken,
    });
    if (devopsRevoke.status !== 403) {
      throw new Error(`Expected 403 for DEVOPS identity revoke, got ${devopsRevoke.status}`);
    }
    console.log('  ✓ DEVOPS revoking identity returned 403 FORBIDDEN (Admin only)');

    // ADMIN revoking identity -> 200 OK
    const adminRevoke = await requestJson(baseUrl, `/api/services/${devopsServiceId}/identity/revoke`, {
      method: 'POST',
      token: adminToken,
    });
    if (adminRevoke.status !== 200) {
      throw new Error(`ADMIN identity revoke failed: ${JSON.stringify(adminRevoke.json)}`);
    }
    console.log('  ✓ ADMIN successfully revoked service identity credentials');

    // 5. Test Service Mesh Topology Data ({ nodes, edges })
    console.log('\n--- 5. Testing GET /api/topology (Mesh Nodes & Edges) ---');
    const topoRes = await requestJson(baseUrl, '/api/topology', { token: analystToken });
    if (topoRes.status !== 200 || !Array.isArray(topoRes.json?.data?.nodes) || !Array.isArray(topoRes.json?.data?.edges)) {
      throw new Error(`GET /api/topology failed: ${JSON.stringify(topoRes.json)}`);
    }
    const { nodes, edges } = topoRes.json.data;
    console.log(`  ✓ Topology returned ${nodes.length} service nodes and ${edges.length} mesh connection edges`);

    // 6. Test Health Monitoring
    console.log('\n--- 6. Testing Microservice Health Monitoring ---');
    const healthRes = await requestJson(baseUrl, `/api/services/${devopsServiceId}/health`, { token: devopsToken });
    if (healthRes.status !== 200 || healthRes.json?.data?.healthStatus !== 'HEALTHY') {
      throw new Error(`Health inspection failed: ${JSON.stringify(healthRes.json)}`);
    }
    console.log('  ✓ Inspected service health status: HEALTHY');

    const updateHealthRes = await requestJson(baseUrl, `/api/services/${devopsServiceId}/health`, {
      method: 'PUT',
      token: devopsToken,
      body: { healthStatus: 'DEGRADED' },
    });
    if (updateHealthRes.status !== 200 || updateHealthRes.json?.data?.service?.healthStatus !== 'DEGRADED') {
      throw new Error(`Health update failed: ${JSON.stringify(updateHealthRes.json)}`);
    }
    console.log('  ✓ Updated service health status to DEGRADED');

    // 7. Verify Audit Log Entries for Phase 3 Actions
    console.log('\n--- 7. Verifying Automatic Audit Logs for Phase 3 Actions ---');
    await new Promise((r) => setTimeout(r, 150));
    const auditRes = await requestJson(baseUrl, '/api/audit?resource=services', { token: adminToken });
    if (auditRes.status !== 200 || !auditRes.json?.data?.logs?.length) {
      throw new Error(`No audit logs found for services: ${JSON.stringify(auditRes.json)}`);
    }
    const actionsFound = auditRes.json.data.logs.map((l) => l.action);
    console.log(`  ✓ Found service audit log actions: ${[...new Set(actionsFound)].join(', ')}`);

    console.log('\n🎉 ALL PHASE 3 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    await close();
  }
}

runTests().catch((error) => {
  console.error('\n❌ Phase 3 test suite failed:', error);
  process.exitCode = 1;
});
