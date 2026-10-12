import crypto from 'node:crypto';
import { config } from '../config.js';
import { ApiError } from './validation.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function createToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.authSecret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) {
    throw new ApiError(401, 'Login required.');
  }

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', config.authSecret)
    .update(encodedPayload)
    .digest('base64url');

  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature || '');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    throw new ApiError(401, 'Session is invalid.');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'Session expired.');
  }

  return payload;
}

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
