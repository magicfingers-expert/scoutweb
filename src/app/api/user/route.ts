import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const user = authUser || db.getUser();
    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser ? authUser.id : db.getUser().id;

    const body = await req.json();
    const updated = db.updateUser(userId, body);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: sanitizeUser(updated) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update user' }, { status: 500 });
  }
}
