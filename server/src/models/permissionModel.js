import { prisma } from '../config/prisma.js';

export const upsertPermission = (data) =>
  prisma.permission.upsert({
    where: {
      roleId_resource_action: {
        roleId: data.roleId,
        resource: data.resource,
        action: data.action,
      },
    },
    update: {},
    create: data,
  });

export const getPermissionsByRoleId = (roleId) =>
  prisma.permission.findMany({
    where: { roleId },
  });