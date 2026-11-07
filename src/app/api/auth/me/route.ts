import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';
import { db } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({
      authenticated: true,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

