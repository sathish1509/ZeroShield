import { prisma } from '../config/prisma.js';
import { supabaseAdmin } from '../config/supabase.js';

export const findUserByEmail = async (email) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).maybeSingle();
    if (!error && data) {
      return {
        ...data,
        passwordHash: data.password_hash || data.passwordHash,
        isMfaEnabled: data.is_mfa_enabled ?? data.isMfaEnabled,
        mfaSecret: data.mfa_secret || data.mfaSecret,
      };
    }
  } catch (_e) {}
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('id, name, email, role, created_at, updated_at').eq('id', Number(id)).maybeSingle();
    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.created_at || data.createdAt,
        updatedAt: data.updated_at || data.updatedAt,
      };
    }
  } catch (_e) {}
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findAllUsers = async () => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('id, name, email, role, created_at, updated_at').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at || u.createdAt,
        updatedAt: u.updated_at || u.updatedAt,
      }));
    }
  } catch (_e) {}
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createUserDb = async (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserRoleDb = async (id, role) => {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const upsertUser = async (data) => {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
    },
    create: data,
  });
};