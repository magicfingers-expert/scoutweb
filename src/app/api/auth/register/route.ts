import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME, sanitizeUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = db.createUser({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: role || 'Agency Founder',
    });

    const sessionToken = createSessionToken(user.id);
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: sanitizeUser(user),
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Registration failed' }, { status: 500 });
  }
}

