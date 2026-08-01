import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { createUserSchema, updateUserRoleSchema } from '../utils/validation.js';
import { hashPassword } from '../utils/password.js';
import {
  createUserDb,
  findAllUsers,
  findUserByEmail,
  findUserById,
  updateUserRoleDb,
} from '../models/userModel.js';
import { getPermissionsByRoleName } from '../models/permissionModel.js';

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await findAllUsers();
  res.json({
    status: 'success',
    data: {
      users,
    },
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const body = createUserSchema.parse(req.body);

  const existing = await findUserByEmail(body.email);
  if (existing) {
    throw new AppError('User with this email already exists', 'CONFLICT', 400);
  }

  const passwordHash = await hashPassword(body.password);
  const user = await createUserDb({
    name: body.name,
    email: body.email,
    passwordHash,
    role: body.role,
  });

  req.auditContext = {
    action: 'USER_CREATE',
    resource: 'users',
    resourceId: String(user.id),
    details: { name: user.name, email: user.email, role: user.role },
  };

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = updateUserRoleSchema.parse(req.body);
  const targetUser = await findUserById(req.params.id);

  if (!targetUser) {
    throw new AppError('User not found', 'NOT_FOUND', 404);
  }

  const previousRole = targetUser.role;
  const updatedUser = await updateUserRoleDb(req.params.id, role);

  req.auditContext = {
    action: 'USER_ROLE_CHANGE',
    resource: 'users',
    resourceId: String(updatedUser.id),
    details: {
      userId: updatedUser.id,
      email: updatedUser.email,
      previousRole,
      newRole: role,
    },
  };

  res.json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const getCurrentUserPermissions = asyncHandler(async (req, res) => {
  const permissions = await getPermissionsByRoleName(req.user.role);

  res.json({
    status: 'success',
    data: {
      role: req.user.role,
      permissions: permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
      })),
    },
  });
});
