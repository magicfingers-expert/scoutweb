import { NextRequest, NextResponse } from 'next/server';
import { enrichBusinessContacts } from '@/lib/presence-detector';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website, phone, city } = body;

    if (!name) {
      return NextResponse.json({ error: 'Business name is required.' }, { status: 400 });
    }

    const contacts = await enrichBusinessContacts({ name, website, phone, city });

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Contact search failed' }, { status: 500 });
  }
}

