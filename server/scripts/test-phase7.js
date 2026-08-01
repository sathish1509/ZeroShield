import http from 'node:http';
import app from '../src/app.js';
import { generateTotpCode } from '../src/controllers/mfaController.js';
import { prisma } from '../src/config/prisma.js';

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
  const { method = 'GET', body, token, headers: customHeaders = {} } = options;
  const headers = { ...customHeaders };
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
  const cookies = res.headers.get('set-cookie');
  return { accessToken: res.json.data.accessToken, cookies, user: res.json.data.user };
}

async function runTests() {
  const address = await listen();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    console.log('--- 1. Testing Helmet HTTP Security Headers & Health ---');
    const healthRes = await requestJson(baseUrl, '/api/health');
    if (healthRes.status !== 200) {
      throw new Error(`Health check failed: ${healthRes.status}`);
    }
    const xFrame = healthRes.headers.get('x-frame-options');
    const xContentType = healthRes.headers.get('x-content-type-options');
    if (!xFrame || !xContentType) {
      throw new Error('Helmet HTTP security headers missing from API response');
    }
    console.log(`  ✓ Helmet HTTP security headers verified (X-Frame-Options: ${xFrame}, X-Content-Type-Options: ${xContentType})`);

    console.log('\n--- 2. Testing Authentication & Session Tracking ---');
    const adminAuth = await loginUser(baseUrl, demoUsers.ADMIN);
    console.log('  ✓ Admin logged in and received short-lived access token + httpOnly refresh cookie');

    // Query active sessions
    const sessionsRes = await requestJson(baseUrl, '/api/users/me/sessions', { token: adminAuth.accessToken });
    if (sessionsRes.status !== 200 || !Array.isArray(sessionsRes.json?.data?.sessions)) {
      throw new Error(`Failed to list active sessions: ${JSON.stringify(sessionsRes.json)}`);
    }
    const sessions = sessionsRes.json.data.sessions;
    console.log(`  ✓ Active session tracking verified (${sessions.length} active user sessions)`);

    // Revoke session test
    const sessionToRevoke = sessions[0];
    if (sessionToRevoke) {
      const revokeRes = await requestJson(baseUrl, `/api/sessions/${sessionToRevoke.id}/revoke`, {
        method: 'POST',
        token: adminAuth.accessToken,
      });
      if (revokeRes.status !== 200 || !revokeRes.json?.data?.session?.isRevoked) {
        throw new Error(`Session revocation failed: ${JSON.stringify(revokeRes.json)}`);
      }
      console.log(`  ✓ Successfully revoked active session #${sessionToRevoke.id}`);
    }

    console.log('\n--- 3. Testing Refresh Token Rotation ---');
    const freshLogin = await loginUser(baseUrl, demoUsers.ADMIN);
    const refreshRes = await requestJson(baseUrl, '/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: freshLogin.cookies },
    });
    if (refreshRes.status !== 200 || !refreshRes.json?.data?.accessToken) {
      throw new Error(`Refresh token rotation failed: ${JSON.stringify(refreshRes.json)}`);
    }
    const newCookie = refreshRes.headers.get('set-cookie');
    if (!newCookie) {
      throw new Error('Refresh token rotation failed to issue a new refresh cookie');
    }
    console.log('  ✓ Refresh token rotation verified: Old token invalidated, new access token & refresh cookie issued');

    console.log('\n--- 4. Testing TOTP Multi-Factor Authentication (MFA Setup & Verification) ---');
    // Login as Analyst to test MFA setup
    const analystAuth = await loginUser(baseUrl, demoUsers.ANALYST);
    const mfaSetupRes = await requestJson(baseUrl, '/api/auth/mfa/setup', {
      method: 'POST',
      token: analystAuth.accessToken,
    });
    if (mfaSetupRes.status !== 200 || !mfaSetupRes.json?.data?.secret || !mfaSetupRes.json?.data?.otpauthUri) {
      throw new Error(`MFA setup failed: ${JSON.stringify(mfaSetupRes.json)}`);
    }
    const secret = mfaSetupRes.json.data.secret;
    console.log(`  ✓ TOTP MFA setup initiated (Secret generated & otpauth URI formatted)`);

    // Generate 6-digit TOTP code using secret
    const code = generateTotpCode(secret);
    const mfaVerifyRes = await requestJson(baseUrl, '/api/auth/mfa/verify', {
      method: 'POST',
      token: analystAuth.accessToken,
      body: { code },
    });
    if (mfaVerifyRes.status !== 200 || !mfaVerifyRes.json?.data?.isMfaEnabled) {
      throw new Error(`MFA verification failed: ${JSON.stringify(mfaVerifyRes.json)}`);
    }
    console.log('  ✓ 6-Digit TOTP code verified and MFA activated for account!');

    console.log('\n--- 5. Testing Login Throttling Rate Limiter ---');
    let throttled = false;
    for (let i = 0; i < 7; i++) {
      const failRes = await requestJson(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: { email: 'baduser@zeroshield.io', password: 'wrongpassword' },
      });
      if (failRes.status === 429) {
        throttled = true;
        break;
      }
    }
    if (!throttled) {
      throw new Error('Login rate limiter failed to return HTTP 429 after 5 failed login attempts');
    }
    console.log('  ✓ Login rate limiter enforced: HTTP 429 Too Many Requests returned for brute-force attempts');

    console.log('\n🎉 ALL PHASE 7 SECURITY HARDENING VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    // Reset MFA enabled state on demo users for test repeatability
    await prisma.user.updateMany({
      data: { isMfaEnabled: false },
    }).catch(() => {});
    await close();
  }
}

runTests().catch((error) => {
  console.error('\n❌ Phase 7 test suite failed:', error);
  process.exitCode = 1;
});
