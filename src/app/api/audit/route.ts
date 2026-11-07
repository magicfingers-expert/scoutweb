import { NextRequest, NextResponse } from 'next/server';
import { runWebsiteAudit } from '@/lib/audit-engine';
import { db } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const audit = db.getAuditById(id, userId);
      if (!audit) {
        return NextResponse.json({ error: 'Audit report not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, audit });
    }

    const audits = db.getAudits(userId);
    return NextResponse.json({ success: true, total: audits.length, audits });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch audits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const body = await req.json();
    const { url, businessType, businessName } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'A valid store or website URL is required.' }, { status: 400 });
    }

    const report = await runWebsiteAudit(url.trim(), businessType, businessName);
    db.saveAudit(report, userId);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Audit execution failed' }, { status: 500 });
  }
}
