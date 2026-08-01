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

export const getPermissionsByRoleName = async (roleName) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: { permissions: true },
  });
  return role ? role.permissions : [];
};

export const hasPermission = async (roleName, resource, action) => {
  if (!roleName) return false;

  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: {
      permissions: true,
    },
  });

  if (!role) return false;

  return role.permissions.some(
    (p) =>
      (p.resource === resource && (p.action === action || p.action === 'manage')) ||
      (p.resource === '*' && p.action === '*')
  );
};