import http from 'node:http';
import app from '../src/app.js';

const baseUsers = [
  {
    role: 'ADMIN',
    email: 'admin@zeroshield.io',
    password: 'admin_secret_key_2026',
  },
  {
    role: 'ANALYST',
    email: 'analyst@zeroshield.io',
    password: 'analyst_sec_key_2026',
  },
  {
    role: 'DEVOPS',
    email: 'devops@zeroshield.io',
    password: 'devops_infra_key_2026',
  },
];

const server = http.createServer(app);

const listen = () =>
  new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address()));
  });

const close = () =>
  new Promise((resolve) => {
    server.close(resolve);
  });

const parseCookies = (setCookieHeader = '') =>
  String(setCookieHeader)
    .split(/,(?=[^;]+=[^;]+)/g)
    .map((value) => value.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');

async function postJson(baseUrl, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  return { response, json };
}

async function getJson(baseUrl, path, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, { headers });
  const json = await response.json();
  return { response, json };
}

async function verifyRole(baseUrl, user) {
  const loginResult = await postJson(baseUrl, '/api/auth/login', {
    email: user.email,
    password: user.password,
  });

  if (!loginResult.response.ok) {
    throw new Error(`Login failed for ${user.role}: ${JSON.stringify(loginResult.json)}`);
  }

  const accessToken = loginResult.json?.data?.accessToken;
  const refreshCookie = parseCookies(loginResult.response.headers.get('set-cookie'));

  if (!accessToken) {
    throw new Error(`No access token returned for ${user.role}`);
  }

  const dashboardResult = await getJson(baseUrl, '/api/dashboard', {
    authorization: `Bearer ${accessToken}`,
  });

  if (!dashboardResult.response.ok) {
    throw new Error(`Dashboard access failed for ${user.role}: ${JSON.stringify(dashboardResult.json)}`);
  }

  const refreshResult = await postJson(
    baseUrl,
    '/api/auth/refresh',
    {},
    refreshCookie ? { cookie: refreshCookie } : {},
  );

  if (!refreshResult.response.ok || !refreshResult.json?.data?.accessToken) {
    throw new Error(`Refresh failed for ${user.role}: ${JSON.stringify(refreshResult.json)}`);
  }

  const logoutResult = await postJson(
    baseUrl,
    '/api/auth/logout',
    {},
    refreshCookie ? { cookie: refreshCookie } : {},
  );

  if (!logoutResult.response.ok) {
    throw new Error(`Logout failed for ${user.role}: ${JSON.stringify(logoutResult.json)}`);
  }

  return true;
}

async function main() {
  const address = await listen();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    for (const user of baseUsers) {
      await verifyRole(baseUrl, user);
      console.log(`Verified auth flow for ${user.role}`);
    }

    console.log('All demo auth flows passed.');
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});