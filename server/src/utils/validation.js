import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const rateLimitConfigSchema = z.object({
  requestsPerMinute: z.number().int().positive('requestsPerMinute must be a positive integer').optional(),
  windowMs: z.number().int().positive('windowMs must be a positive integer').optional(),
  maxRequests: z.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'RATE_LIMIT config must contain at least one valid parameter (e.g. requestsPerMinute, windowMs, maxRequests)',
});

export const ipAllowlistConfigSchema = z.object({
  allowedIps: z.array(z.string().min(1)).min(1, 'allowedIps must contain at least one IP or CIDR block'),
});

export const authRequiredConfigSchema = z.object({
  authTypes: z.array(z.string().min(1)).optional(),
  tokenExpirationMs: z.number().int().positive().optional(),
  requireJwt: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'AUTH_REQUIRED config must specify authentication rules',
});

export const payloadValidationConfigSchema = z.object({
  maxSizeBytes: z.number().int().positive().optional(),
  allowedContentTypes: z.array(z.string()).optional(),
  strictSchema: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'PAYLOAD_VALIDATION config must specify payload limits or schema rules',
});

export const validateRuleConfig = (ruleType, ruleConfig) => {
  switch (ruleType) {
    case 'RATE_LIMIT':
      return rateLimitConfigSchema.parse(ruleConfig);
    case 'IP_ALLOWLIST':
      return ipAllowlistConfigSchema.parse(ruleConfig);
    case 'AUTH_REQUIRED':
      return authRequiredConfigSchema.parse(ruleConfig);
    case 'PAYLOAD_VALIDATION':
      return payloadValidationConfigSchema.parse(ruleConfig);
    default:
      throw new Error(`Unsupported rule_type: ${ruleType}`);
  }
};

export const createPolicySchema = z.object({
  name: z.string().trim().min(3, 'Policy name must be at least 3 characters'),
  description: z.string().trim().optional(),
  ruleType: z.enum(['RATE_LIMIT', 'IP_ALLOWLIST', 'AUTH_REQUIRED', 'PAYLOAD_VALIDATION']),
  ruleConfig: z.record(z.any(), z.any()),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

export const updatePolicySchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().optional(),
  ruleType: z.enum(['RATE_LIMIT', 'IP_ALLOWLIST', 'AUTH_REQUIRED', 'PAYLOAD_VALIDATION']).optional(),
  ruleConfig: z.record(z.any(), z.any()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'ANALYST', 'DEVOPS']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ANALYST', 'DEVOPS']),
});