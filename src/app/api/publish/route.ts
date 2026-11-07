import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, slug, action = 'publish' } = body;

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required.' }, { status: 400 });
    }

    const site = db.getWebsiteById(websiteId);
    if (!site) {
      return NextResponse.json({ error: 'Website project not found.' }, { status: 404 });
    }

    if (action === 'unpublish') {
      site.isPublished = false;
      db.saveWebsite(site);
      db.addActivity('Website Unpublished', `Unpublished site "${site.businessName}"`, 'publish');
      return NextResponse.json({ success: true, website: site, isPublished: false });
    }

    // Publish
    const cleanSlug = (slug || site.businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug collision
    const existing = db.getWebsiteBySlug(cleanSlug);
    if (existing && existing.id !== site.id) {
      return NextResponse.json(
        { error: `The custom URL slug "${cleanSlug}" is already in use. Please choose another.` },
        { status: 409 }
      );
    }

    site.isPublished = true;
    site.publishedSlug = cleanSlug;
    site.publishedAt = new Date().toISOString();

    db.saveWebsite(site);
    db.addActivity(
      'Website Published',
      `Published "${site.businessName}" live at /site/${cleanSlug}`,
      'publish'
    );

    return NextResponse.json({
      success: true,
      website: site,
      publishedUrl: `/site/${cleanSlug}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Publishing failed' }, { status: 500 });
  }
}

