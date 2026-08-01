import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import {
  createPolicySchema,
  updatePolicySchema,
  validateRuleConfig,
} from '../utils/validation.js';
import {
  createPolicy as createPolicyDb,
  deletePolicy as deletePolicyDb,
  findAllPolicies,
  findPolicyById,
  updatePolicy as updatePolicyDb,
} from '../models/policyModel.js';

export const getPolicies = asyncHandler(async (_req, res) => {
  const policies = await findAllPolicies();
  res.json({
    status: 'success',
    data: {
      policies,
    },
  });
});

export const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await findPolicyById(req.params.id);
  if (!policy) {
    throw new AppError('Policy not found', 'NOT_FOUND', 404);
  }
  res.json({
    status: 'success',
    data: {
      policy,
    },
  });
});

export const createPolicy = asyncHandler(async (req, res) => {
  const body = createPolicySchema.parse(req.body);

  try {
    validateRuleConfig(body.ruleType, body.ruleConfig);
  } catch (err) {
    throw new AppError(`Invalid rule_config for ${body.ruleType}: ${err.message}`, 'VALIDATION_ERROR', 400);
  }

  const policy = await createPolicyDb({
    ...body,
    createdBy: req.user.id,
  });

  req.auditContext = {
    action: 'POLICY_CREATE',
    resource: 'policies',
    resourceId: String(policy.id),
    details: { name: policy.name, ruleType: policy.ruleType, status: policy.status },
  };

  res.status(201).json({
    status: 'success',
    data: {
      policy,
    },
  });
});

export const updatePolicy = asyncHandler(async (req, res) => {
  const existing = await findPolicyById(req.params.id);
  if (!existing) {
    throw new AppError('Policy not found', 'NOT_FOUND', 404);
  }

  const body = updatePolicySchema.parse(req.body);

  const effectiveRuleType = body.ruleType || existing.ruleType;
  const effectiveRuleConfig = body.ruleConfig || existing.ruleConfig;

  if (body.ruleType || body.ruleConfig) {
    try {
      validateRuleConfig(effectiveRuleType, effectiveRuleConfig);
    } catch (err) {
      throw new AppError(`Invalid rule_config for ${effectiveRuleType}: ${err.message}`, 'VALIDATION_ERROR', 400);
    }
  }

  const updated = await updatePolicyDb(req.params.id, body);

  req.auditContext = {
    action: 'POLICY_UPDATE',
    resource: 'policies',
    resourceId: String(updated.id),
    details: { name: updated.name, ruleType: updated.ruleType, status: updated.status },
  };

  res.json({
    status: 'success',
    data: {
      policy: updated,
    },
  });
});

export const deletePolicy = asyncHandler(async (req, res) => {
  const existing = await findPolicyById(req.params.id);
  if (!existing) {
    throw new AppError('Policy not found', 'NOT_FOUND', 404);
  }

  await deletePolicyDb(req.params.id);

  req.auditContext = {
    action: 'POLICY_DELETE',
    resource: 'policies',
    resourceId: String(existing.id),
    details: { name: existing.name },
  };

  res.json({
    status: 'success',
    message: 'Policy deleted successfully',
  });
});
