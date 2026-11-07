import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses } from '@/lib/google-places';
import { db } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { industry = '', location = '', onlyNoWebsite = false, cms = 'All' } = body;

    if (!industry.trim() || !location.trim()) {
      return NextResponse.json(
        { error: 'Industry and location are required.' },
        { status: 400 }
      );
    }

    const user = db.getUser();
    const apiKey = user.preferences.googlePlacesApiKey || process.env.GOOGLE_PLACES_API_KEY;

    const results = await searchBusinesses({
      industry: industry.trim(),
      location: location.trim(),
      cms: cms !== 'All' ? cms : undefined,
      onlyNoWebsite: Boolean(onlyNoWebsite) || cms === 'No Website',
      apiKey,
    });

    db.incrementSearchCount();
    db.addActivity(
      'Business Search',
      `Searched "${industry}" in "${location}"${cms !== 'All' ? ` (CMS: ${cms})` : ''} — found ${results.length} opportunities`,
      'search'
    );

    return NextResponse.json({
      success: true,
      query: { industry, location, cms, onlyNoWebsite },
      total: results.length,
      results,
    });
  } catch (err: any) {
    console.error('Search API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to search businesses.' },
      { status: 500 }
    );
  }
}

