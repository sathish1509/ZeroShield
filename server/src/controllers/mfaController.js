import crypto from 'node:crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { prisma } from '../config/prisma.js';
import { z } from 'zod';

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 16) {
  let secret = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += base32Alphabet[randomBytes[i] % base32Alphabet.length];
  }
  return secret;
}

function base32Decode(base32) {
  let bits = '';
  let hex = '';
  const cleaned = base32.toUpperCase().replace(/=/g, '');

  for (let i = 0; i < cleaned.length; i++) {
    const val = base32Alphabet.indexOf(cleaned.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
  }

  return Buffer.from(hex, 'hex');
}

export function generateTotpCode(secret, timeStep = Math.floor(Date.now() / 1000 / 30)) {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  let tmp = timeStep;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tmp & 0xff;
    tmp = tmp >> 8;
  }

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (code % 1000000).toString().padStart(6, '0');
  return otp;
}

export function verifyTotpCode(secret, userCode) {
  if (!secret || !userCode) return false;
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  // Allow time drift window of +/- 1 step (30 seconds)
  for (let window = -1; window <= 1; window++) {
    const expected = generateTotpCode(secret, currentStep + window);
    if (expected === userCode.trim()) {
      return true;
    }
  }
  return false;
}

const verifyMfaSchema = z.object({
  code: z.string().length(6, 'MFA code must be exactly 6 digits'),
});

export const setupMfa = asyncHandler(async (req, res) => {
  const secret = generateBase32Secret(16);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { mfaSecret: secret },
  });

  const otpauthUri = `otpauth://totp/ZeroShield:${encodeURIComponent(req.user.email)}?secret=${secret}&issuer=ZeroShield`;

  res.json({
    status: 'success',
    data: {
      secret,
      otpauthUri,
      message: 'MFA setup initiated. Enter the 6-digit TOTP code from your authenticator app to activate.',
    },
  });
});

export const verifyMfa = asyncHandler(async (req, res) => {
  const { code } = verifyMfaSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, mfaSecret: true, isMfaEnabled: true },
  });

  if (!user || !user.mfaSecret) {
    return res.status(400).json({
      status: 'fail',
      message: 'MFA setup has not been initiated. Please call /api/auth/mfa/setup first.',
    });
  }

  const isValid = verifyTotpCode(user.mfaSecret, code);
  if (!isValid) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid 6-digit MFA authentication code.',
    });
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { isMfaEnabled: true },
  });

  res.json({
    status: 'success',
    data: {
      isMfaEnabled: true,
      message: 'TOTP Multi-Factor Authentication successfully verified and activated for your account!',
    },
  });
});
