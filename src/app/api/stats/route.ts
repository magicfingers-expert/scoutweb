import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const stats = db.getStats(userId);
    const activity = db.getActivity(userId, 25);

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        plan: 'Unlimited Free Pro',
        creditsRemaining: 'Unlimited',
        status: 'Active',
      },
      activity,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
