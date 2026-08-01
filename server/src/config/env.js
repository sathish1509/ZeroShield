import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

const envPath = candidatePaths.find((candidate) => fs.existsSync(candidate));

dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SUPABASE_URL: z.string().default('http://127.0.0.1:54321'),
  SUPABASE_ANON_KEY: z.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon-key-placeholder'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service-role-key-placeholder'),
});

export const env = envSchema.parse(process.env);