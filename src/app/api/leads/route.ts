import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    // Query Prisma SQLite database first
    try {
      const prismaWhere: any = {};
      if (status && status !== 'All') {
        prismaWhere.status = status;
      }
      if (search) {
        prismaWhere.OR = [
          { businessName: { contains: search } },
          { category: { contains: search } },
          { address: { contains: search } },
          { city: { contains: search } },
        ];
      }

      const pLeads = await prisma.lead.findMany({
        where: prismaWhere,
        orderBy: { createdAt: 'desc' },
      });

      if (pLeads.length > 0) {
        const formatted = pLeads.map((pl) => ({
          id: pl.id,
          userId: pl.userId || userId,
          businessId: pl.id,
          name: pl.businessName,
          category: pl.category,
          crm: pl.crm,
          address: pl.address || '',
          city: pl.city || '',
          phone: pl.phone || '',
          email: pl.email || '',
          website: pl.website || '',
          websiteStatus: pl.websiteStatus,
          googleRating: pl.rating,
          reviewCount: pl.reviewCount,
          googleMapsUrl: pl.googleMapsUrl || '',
          opportunityScore: pl.opportunityScore,
          opportunityTier: pl.opportunityTier,
          status: pl.status,
          source: 'Opportunity Finder',
          tags: pl.tags ? JSON.parse(pl.tags) : [],
          notes: pl.notes ? (pl.notes.startsWith('[') ? JSON.parse(pl.notes) : [{ id: '1', content: pl.notes, createdAt: pl.createdAt.toISOString() }]) : [],
          pitches: [],
          recommendedServices: pl.recommendedServices ? JSON.parse(pl.recommendedServices) : [],
          createdAt: pl.createdAt.toISOString(),
          updatedAt: pl.updatedAt.toISOString(),
        }));

        return NextResponse.json({ success: true, total: formatted.length, leads: formatted });
      }
    } catch (prismaErr) {
      console.warn('Prisma leads query fallback to JSON db:', prismaErr);
    }

    // STRICT USER ISOLATION Fallback
    let leads = db.getLeads(userId);

    if (status && status !== 'All') {
      leads = leads.filter(l => l.status === status);
    }

    if (search) {
      leads = leads.filter(
        l =>
          l.name.toLowerCase().includes(search) ||
          l.category.toLowerCase().includes(search) ||
          l.address.toLowerCase().includes(search) ||
          l.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ success: true, total: leads.length, leads });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const body = await req.json();
    const {
      businessId,
      name,
      category = 'Business',
      address = '',
      phone,
      email,
      website,
      cms,
      googleRating = 4.5,
      reviewCount = 0,
      googleMapsUrl,
      opportunityScore = 75,
      opportunityTier = 'HIGH OPPORTUNITY',
      status = 'New',
      source = 'Opportunity Finder',
      tags = [],
      notes = [],
      pitches = [],
      recommendedServices,
      followUpDate,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Lead name is required.' }, { status: 400 });
    }

    // Persist to Prisma SQLite database
    try {
      await prisma.lead.create({
        data: {
          userId: userId !== 'usr_default' ? userId : null,
          businessName: name.trim(),
          category,
          crm: cms || 'None',
          address,
          phone,
          email,
          website,
          websiteStatus: website ? 'active' : 'none',
          rating: Number(googleRating) || 0,
          reviewCount: Number(reviewCount) || 0,
          googleMapsUrl,
          opportunityScore: Number(opportunityScore) || 75,
          opportunityTier: String(opportunityTier),
          recommendedServices: recommendedServices
            ? Array.isArray(recommendedServices)
              ? JSON.stringify(recommendedServices)
              : String(recommendedServices)
            : null,
          status,
          notes: Array.isArray(notes) ? JSON.stringify(notes) : null,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
        },
      });
    } catch (pErr) {
      console.warn('Prisma lead creation fallback:', pErr);
    }

    const { lead, created } = db.saveLead({
      userId,
      businessId,
      name: name.trim(),
      category,
      address,
      phone,
      email,
      website,
      cms,
      googleRating,
      reviewCount,
      googleMapsUrl,
      opportunityScore,
      opportunityTier,
      status,
      source,
      tags,
      notes,
      pitches,
      recommendedServices,
      followUpDate,
    });

    return NextResponse.json({
      success: true,
      created,
      message: created ? 'Lead saved to private CRM' : 'Existing lead updated',
      lead,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save lead' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const body = await req.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 });
    }

    // Try Prisma update
    try {
      await prisma.lead.update({
        where: { id },
        data: {
          ...(updates?.status && { status: updates.status }),
          ...(updates?.phone && { phone: updates.phone }),
          ...(updates?.email && { email: updates.email }),
          ...(updates?.notes && { notes: JSON.stringify(updates.notes) }),
        },
      });
    } catch {
      // Fallback
    }

    const updated = db.updateLead(id, updates, userId);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const userId = authUser?.id || 'usr_default';

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 });
    }

    try {
      await prisma.lead.delete({ where: { id } });
    } catch {
      // Fallback
    }

    const deleted = db.deleteLead(id, userId);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete lead' }, { status: 500 });
  }
}
