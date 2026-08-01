import { prisma } from '../config/prisma.js';

export const findAllServices = () =>
  prisma.microservice.findMany({
    orderBy: { registeredAt: 'desc' },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      identities: {
        where: { revoked: false },
        select: {
          id: true,
          issuedAt: true,
          expiresAt: true,
          revoked: true,
        },
      },
    },
  });

export const findServiceById = (id) =>
  prisma.microservice.findUnique({
    where: { id: Number(id) },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      identities: true,
    },
  });

export const findServiceByName = (name) =>
  prisma.microservice.findUnique({
    where: { name },
  });

export const createService = (data) =>
  prisma.microservice.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: Number(data.ownerId),
      baseUrl: data.baseUrl,
      status: data.status || 'ACTIVE',
      healthStatus: data.healthStatus || 'HEALTHY',
      tags: data.tags || [],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

export const updateService = (id, data) =>
  prisma.microservice.update({
    where: { id: Number(id) },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

export const deleteService = (id) =>
  prisma.microservice.delete({
    where: { id: Number(id) },
  });

export const createServiceIdentity = (data) =>
  prisma.serviceIdentity.create({
    data: {
      serviceId: Number(data.serviceId),
      clientSecretHash: data.clientSecretHash,
      expiresAt: data.expiresAt,
    },
  });

export const revokeServiceIdentities = (serviceId) =>
  prisma.serviceIdentity.updateMany({
    where: { serviceId: Number(serviceId), revoked: false },
    data: { revoked: true },
  });

export const findTopologyData = async () => {
  const [services, connections] = await Promise.all([
    prisma.microservice.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        baseUrl: true,
        status: true,
        healthStatus: true,
        tags: true,
        owner: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.serviceConnection.findMany({
      select: {
        id: true,
        sourceServiceId: true,
        targetServiceId: true,
        protocol: true,
        status: true,
        lastSeenAt: true,
      },
    }),
  ]);

  const nodes = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    baseUrl: s.baseUrl,
    status: s.status,
    healthStatus: s.healthStatus,
    tags: s.tags,
    owner: s.owner,
  }));

  const edges = connections.map((c) => ({
    id: c.id,
    source: c.sourceServiceId,
    target: c.targetServiceId,
    protocol: c.protocol,
    status: c.status,
    lastSeenAt: c.lastSeenAt,
  }));

  return {
    nodes,
    edges,
  };
};
