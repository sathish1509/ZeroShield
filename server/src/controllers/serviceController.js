import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';
import { hashPassword } from '../utils/password.js';
import {
  createIdentitySchema,
  createServiceSchema,
  updateHealthSchema,
  updateServiceSchema,
} from '../utils/validation.js';
import {
  createService as createServiceDb,
  createServiceIdentity,
  deleteService as deleteServiceDb,
  findAllServices,
  findServiceById,
  findServiceByName,
  revokeServiceIdentities,
  updateService as updateServiceDb,
} from '../models/serviceModel.js';

export const getServices = asyncHandler(async (_req, res) => {
  const services = await findAllServices();
  res.json({
    status: 'success',
    data: {
      services,
    },
  });
});

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }
  res.json({
    status: 'success',
    data: {
      service,
    },
  });
});

export const createService = asyncHandler(async (req, res) => {
  const body = createServiceSchema.parse(req.body);

  const existing = await findServiceByName(body.name);
  if (existing) {
    throw new AppError('Microservice with this name already exists', 'CONFLICT', 400);
  }

  const service = await createServiceDb({
    ...body,
    ownerId: req.user.id,
  });

  req.auditContext = {
    action: 'SERVICE_REGISTER',
    resource: 'services',
    resourceId: String(service.id),
    details: { name: service.name, baseUrl: service.baseUrl, ownerId: service.ownerId },
  };

  res.status(201).json({
    status: 'success',
    data: {
      service,
    },
  });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }

  // DevOps restriction: can only update services they own; ADMIN can update any
  if (req.user.role === 'DEVOPS' && service.ownerId !== req.user.id) {
    throw new AppError('DevOps users can only modify microservices they own', 'FORBIDDEN', 403);
  }

  const body = updateServiceSchema.parse(req.body);

  if (body.name && body.name !== service.name) {
    const existing = await findServiceByName(body.name);
    if (existing) {
      throw new AppError('Microservice with this name already exists', 'CONFLICT', 400);
    }
  }

  const updated = await updateServiceDb(req.params.id, body);

  req.auditContext = {
    action: 'SERVICE_UPDATE',
    resource: 'services',
    resourceId: String(updated.id),
    details: { name: updated.name, status: updated.status, healthStatus: updated.healthStatus },
  };

  res.json({
    status: 'success',
    data: {
      service: updated,
    },
  });
});

export const deleteService = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only Administrators can deregister microservices', 'FORBIDDEN', 403);
  }

  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }

  await deleteServiceDb(req.params.id);

  req.auditContext = {
    action: 'SERVICE_DEREGISTER',
    resource: 'services',
    resourceId: String(service.id),
    details: { name: service.name },
  };

  res.json({
    status: 'success',
    message: 'Microservice deregistered successfully',
  });
});

export const generateServiceIdentity = asyncHandler(async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }

  // DevOps ownership check for identity issuance
  if (req.user.role === 'DEVOPS' && service.ownerId !== req.user.id) {
    throw new AppError('DevOps users can only issue identities for microservices they own', 'FORBIDDEN', 403);
  }

  const { scope, expiresInSeconds } = createIdentitySchema.parse(req.body || {});

  const clientSecret = `sec_live_${crypto.randomBytes(24).toString('hex')}`;
  const clientSecretHash = await hashPassword(clientSecret);
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  const identityRecord = await createServiceIdentity({
    serviceId: service.id,
    clientSecretHash,
    expiresAt,
  });

  const tokenPayload = {
    sub: String(service.id),
    serviceId: service.id,
    serviceName: service.name,
    identityId: identityRecord.id,
    scope,
    type: 'SERVICE_IDENTITY',
  };

  const serviceJwt = jwt.sign(tokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: `${expiresInSeconds}s`,
  });

  req.auditContext = {
    action: 'SERVICE_IDENTITY_GENERATE',
    resource: 'services',
    resourceId: String(service.id),
    details: { serviceId: service.id, serviceName: service.name, identityId: identityRecord.id, scope },
  };

  res.status(201).json({
    status: 'success',
    data: {
      identityId: identityRecord.id,
      serviceId: service.id,
      serviceName: service.name,
      clientSecret,
      serviceJwt,
      scope,
      issuedAt: identityRecord.issuedAt,
      expiresAt: identityRecord.expiresAt,
    },
  });
});

export const revokeServiceIdentity = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Only Administrators can revoke service identity credentials', 'FORBIDDEN', 403);
  }

  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }

  await revokeServiceIdentities(service.id);

  req.auditContext = {
    action: 'SERVICE_IDENTITY_REVOKE',
    resource: 'services',
    resourceId: String(service.id),
    details: { serviceId: service.id, serviceName: service.name },
  };

  res.json({
    status: 'success',
    message: `All active credentials revoked for service ${service.name}`,
  });
});

export const getServiceHealth = asyncHandler(async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }

  res.json({
    status: 'success',
    data: {
      serviceId: service.id,
      name: service.name,
      healthStatus: service.healthStatus,
      status: service.status,
      lastChecked: new Date(),
    },
  });
});

export const updateServiceHealth = asyncHandler(async (req, res) => {
  const service = await findServiceById(req.params.id);
  if (!service) {
    throw new AppError('Microservice not found', 'NOT_FOUND', 404);
  }

  // DevOps restriction: can only update health of services they own; ADMIN can update any
  if (req.user.role === 'DEVOPS' && service.ownerId !== req.user.id) {
    throw new AppError('DevOps users can only modify health of microservices they own', 'FORBIDDEN', 403);
  }

  const { healthStatus } = updateHealthSchema.parse(req.body);

  const updated = await updateServiceDb(req.params.id, { healthStatus });

  req.auditContext = {
    action: 'SERVICE_HEALTH_UPDATE',
    resource: 'services',
    resourceId: String(service.id),
    details: { serviceName: service.name, previousHealth: service.healthStatus, newHealth: healthStatus },
  };

  res.json({
    status: 'success',
    data: {
      service: updated,
    },
  });
});
