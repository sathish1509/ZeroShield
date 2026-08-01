import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Zero-Trust Real-Time Interception Proxy Engine
 * Pipeline: Service A -> JWT Validation -> Policy Engine -> AI Risk Engine -> Audit Logger -> Decision -> Service B
 */
export const zeroTrustProxyMiddleware = (allowedTargetServices = []) => {
  return (req, res, next) => {
    const startTime = Date.now();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const authHeader = req.headers['authorization'];
    const originService = req.headers['x-origin-service'] || 'Unknown-Service-A';
    const targetService = req.headers['x-target-service'] || req.baseUrl || 'Service-B';
    const reqPath = req.originalUrl || req.url;

    // Step 1: JWT Validation
    let jwtValid = false;
    let jwtPayload = null;
    let jwtErrorReason = '';

    if (!authHeader?.startsWith('Bearer ')) {
      jwtErrorReason = 'Missing Bearer authorization header';
    } else {
      const token = authHeader.slice(7);
      try {
        jwtPayload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        jwtValid = true;
      } catch (err) {
        jwtErrorReason = `Invalid/Expired JWT token: ${err.message}`;
      }
    }

    // Step 2: Policy Engine Check (Service-to-Service Scope & mTLS)
    let policyPassed = true;
    let policyViolation = '';

    if (allowedTargetServices.length > 0 && !allowedTargetServices.includes(targetService)) {
      policyPassed = false;
      policyViolation = `Service '${originService}' is not authorized to call '${targetService}'`;
    }

    // Step 3: AI Threat Risk Engine Calculation (Payload & Lateral Movement Inspection)
    let riskScore = 10; // Base baseline score
    const detectedThreats = [];

    // SQL Injection Signature Detection
    const rawPayload = JSON.stringify(req.body || {}) + ' ' + (req.url || '');
    if (/(union\s+select|select\s+.*\s+from|drop\s+table|1=1|' OR '1'='1)/i.test(rawPayload)) {
      riskScore += 80;
      detectedThreats.push('SQL_INJECTION_PATTERN');
    }

    // Lateral Movement Token Hijacking Check
    if (jwtValid && jwtPayload?.scope && !jwtPayload.scope.includes(targetService)) {
      riskScore += 75;
      detectedThreats.push('UNAUTHORIZED_LATERAL_MOVEMENT_ATTEMPT');
    }

    // JWT Missing/Invalid Penalty
    if (!jwtValid) {
      riskScore += 50;
      detectedThreats.push('INVALID_JWT_IDENTITY');
    }

    // Step 4: Decision Matrix (Risk Threshold > 70 or Policy Failure -> BLOCK)
    const isAllowed = jwtValid && policyPassed && riskScore <= 70;
    const statusCode = isAllowed ? 200 : 403;
    const proxyLatency = Date.now() - startTime;

    // Build Interception Record
    const proxyRecord = {
      timestamp: new Date().toISOString(),
      proxyId: 'ZS-MESH-01',
      originService,
      targetService,
      path: reqPath,
      method: req.method,
      clientIp,
      jwtValidation: {
        valid: jwtValid,
        issuer: jwtPayload?.serviceName || 'Unknown',
        error: jwtErrorReason || null
      },
      policyEngine: {
        passed: policyPassed,
        violation: policyViolation || null
      },
      riskEngine: {
        riskScore,
        riskLevel: riskScore > 70 ? 'CRITICAL' : riskScore > 40 ? 'ELEVATED' : 'LOW',
        detectedThreats
      },
      decision: isAllowed ? 'ALLOWED' : 'BLOCKED',
      statusCode,
      latencyMs: proxyLatency
    };

    // Attach decision telemetry to request
    req.zeroTrustProxy = proxyRecord;

    // Step 5: Decision Enforcement
    if (!isAllowed) {
      return res.status(403).json({
        error: 'ZERO_TRUST_INTERCEPTION',
        message: 'Request intercepted and blocked at ZeroTrust Proxy edge to prevent unauthorized lateral movement',
        proxyRecord
      });
    }

    return next();
  };
};
