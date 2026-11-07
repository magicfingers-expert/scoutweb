import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

export async function getLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, crm, category, search, tier, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (req.user) {
      where.userId = req.user.id;
    }

    if (status && status !== 'All') {
      where.status = String(status);
    }

    if (crm && crm !== 'All') {
      where.crm = String(crm);
    }

    if (category) {
      where.category = { contains: String(category) };
    }

    if (tier && tier !== 'All') {
      where.opportunityTier = String(tier);
    }

    if (search) {
      const q = String(search);
      where.OR = [
        { businessName: { contains: q } },
        { city: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      data: leads,
    });
  } catch (error) {
    next(error);
  }
}

export async function createLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      businessName,
      category,
      crm = 'None',
      address,
      city,
      phone,
      email,
      website,
      websiteStatus = 'none',
      rating = 0,
      reviewCount = 0,
      googleMapsUrl,
      opportunityScore = 75,
      opportunityTier = 'Medium',
      recommendedServices,
      status = 'New',
      notes,
      tags,
    } = req.body;

    if (!businessName) {
      return res.status(400).json({
        success: false,
        error: 'businessName is required.',
      });
    }

    const lead = await prisma.lead.create({
      data: {
        userId: req.user?.id || null,
        businessName,
        category: category || 'General',
        crm,
        address,
        city,
        phone,
        email,
        website,
        websiteStatus,
        rating: Number(rating) || 0,
        reviewCount: Number(reviewCount) || 0,
        googleMapsUrl,
        opportunityScore: Number(opportunityScore) || 75,
        opportunityTier,
        recommendedServices: recommendedServices
          ? typeof recommendedServices === 'string'
            ? recommendedServices
            : JSON.stringify(recommendedServices)
          : null,
        status,
        notes: notes || null,
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null,
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'LEAD_SAVED',
          details: `Saved lead: ${businessName} (${category})`,
        },
      }).catch(() => null);
    }

    return res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

export async function batchCreateLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'leads array is required and must not be empty.',
      });
    }

    const created = await Promise.all(
      leads.map((b) =>
        prisma.lead.create({
          data: {
            userId: req.user?.id || null,
            businessName: b.name || b.businessName,
            category: b.category || b.industry || 'General',
            crm: b.crm || 'None',
            address: b.address,
            city: b.city,
            phone: b.phone,
            email: b.email,
            website: b.website,
            websiteStatus: b.websiteStatus || 'none',
            rating: Number(b.rating) || 0,
            reviewCount: Number(b.reviewCount) || 0,
            googleMapsUrl: b.googleMapsUrl,
            opportunityScore: Number(b.opportunityScore) || 75,
            opportunityTier: b.opportunityTier || 'Medium',
            recommendedServices: b.recommendedServices
              ? typeof b.recommendedServices === 'string'
                ? b.recommendedServices
                : JSON.stringify(b.recommendedServices)
              : null,
            status: 'New',
          },
        })
      )
    );

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'LEADS_BATCH_SAVED',
          details: `Batch saved ${created.length} leads into pipeline`,
        },
      }).catch(() => null);
    }

    return res.status(201).json({
      success: true,
      count: created.length,
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found.',
      });
    }

    return res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, notes, tags, phone, email, recommendedServices, opportunityTier } = req.body;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && { tags: typeof tags === 'string' ? tags : JSON.stringify(tags) }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(opportunityTier && { opportunityTier }),
        ...(recommendedServices && {
          recommendedServices:
            typeof recommendedServices === 'string'
              ? recommendedServices
              : JSON.stringify(recommendedServices),
        }),
      },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    await prisma.lead.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Lead deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function exportLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { format = 'json' } = req.query;

    const where: any = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const headers = [
        'ID',
        'Business Name',
        'Category',
        'CRM',
        'Phone',
        'Email',
        'Website',
        'Website Status',
        'Rating',
        'Reviews',
        'Opportunity Score',
        'Tier',
        'Status',
        'Address',
        'City',
      ];

      const csvRows = [headers.join(',')];

      for (const l of leads) {
        const row = [
          `"${l.id}"`,
          `"${(l.businessName || '').replace(/"/g, '""')}"`,
          `"${(l.category || '').replace(/"/g, '""')}"`,
          `"${(l.crm || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.website || '').replace(/"/g, '""')}"`,
          `"${l.websiteStatus}"`,
          l.rating,
          l.reviewCount,
          l.opportunityScore,
          `"${l.opportunityTier}"`,
          `"${l.status}"`,
          `"${(l.address || '').replace(/"/g, '""')}"`,
          `"${(l.city || '').replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scoutweb-leads.csv"');
      return res.send(csvRows.join('\n'));
    }

    return res.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
}

