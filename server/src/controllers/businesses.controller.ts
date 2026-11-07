import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { searchBusinesses } from '../../../src/lib/google-places';
import { crawlRealEmailFromWebsite } from '../../../src/lib/presence-detector';
import { prisma } from '../config/prisma';

export async function searchBusinessesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { industry, location, cms, onlyNoWebsite, apiKey } = req.body;

    if (!industry || !location) {
      return res.status(400).json({
        success: false,
        error: 'Both industry (niche) and location (city) are required.',
      });
    }

    // Call authentic business search engine
    const results = await searchBusinesses({
      industry: String(industry).trim(),
      location: String(location).trim(),
      cms: cms ? String(cms).trim() : undefined,
      onlyNoWebsite: Boolean(onlyNoWebsite),
      apiKey: apiKey ? String(apiKey).trim() : undefined,
    });

    // If user is authenticated, update their search count and log activity
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { searchesUsed: { increment: 1 } },
      }).catch(() => null);

      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'SEARCH_PERFORMED',
          details: `Searched for ${industry} in ${location} (CMS: ${cms || 'All'}) - Found ${results.length} businesses`,
        },
      }).catch(() => null);
    }

    const withEmail = results.filter((b) => Boolean(b.email)).length;
    const noWebsite = results.filter(
      (b) => !b.website || b.websiteStatus === 'no_website' || b.websiteStatus === 'broken'
    ).length;

    return res.json({
      success: true,
      count: results.length,
      summary: {
        total: results.length,
        withEmail,
        noWebsite,
        highOpportunity: results.filter((b) => b.opportunityTier === 'High').length,
      },
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

export async function crawlEmailHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { website } = req.body;

    if (!website) {
      return res.status(400).json({
        success: false,
        error: 'Website URL is required.',
      });
    }

    const email = await crawlRealEmailFromWebsite(website);

    return res.json({
      success: true,
      website,
      email: email || null,
      message: email ? 'Authentic email extracted from website domain.' : 'No public email listed on domain.',
    });
  } catch (error) {
    next(error);
  }
}
