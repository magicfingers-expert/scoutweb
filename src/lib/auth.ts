import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from './storage';
import { UserProfile } from './types';

export const SESSION_COOKIE_NAME = 'scoutweb_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'scoutweb_super_secret_jwt_key_2026_secured';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

// 1. Password Hashing with Salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash?: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  const [salt, originalHash] = combinedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// 2. Cryptographic Session Token (userId + timestamp + HMAC signature)
export function createSessionToken(userId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${userId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifySessionToken(token?: string): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;

    const [userId, timestampStr, signature] = parts;
    const payload = `${userId}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      // Expire after 30 days
      if (now - timestamp < SESSION_MAX_AGE * 1000) {
        return userId;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// 3. User Extraction from Request (for API routes)
export function getAuthenticatedUser(req: NextRequest): UserProfile | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return db.getUserById(userId) || null;
}

// 4. User Extraction from Server Components
export function getServerUser(): UserProfile | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const userId = verifySessionToken(token);
    if (!userId) return null;
    return db.getUserById(userId) || null;
  } catch {
    return null;
  }
}

// Helper to sanitize user object (strip passwordHash)
export function sanitizeUser(user: UserProfile): Omit<UserProfile, 'passwordHash'> {
  const { passwordHash, ...safe } = user;
  return safe;
}

