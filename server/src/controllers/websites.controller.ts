import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base || 'site'}-${randomSuffix}`;
}

export async function createWebsiteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { businessName, title, industry, description, theme, pages, published = false } = req.body;

    if (!businessName) {
      return res.status(400).json({
        success: false,
        error: 'businessName is required.',
      });
    }

    const slug = generateSlug(title || businessName);

    const defaultTheme = theme || {
      primaryColor: '#0ea5e9',
      accentColor: '#10b981',
      fontFamily: 'Inter',
      darkMode: false,
    };

    const defaultPages = pages || [
      {
        id: 'home',
        name: 'Home',
        sections: [
          {
            type: 'hero',
            heading: `Welcome to ${businessName}`,
            subheading: description || `Premium ${industry || 'local services'} tailored to your needs.`,
            ctaText: 'Book Appointment',
            ctaLink: '#contact',
          },
          {
            type: 'features',
            items: [
              { title: 'Verified Quality', text: 'Top-tier client satisfaction and guaranteed results.' },
              { title: 'Fast Turnaround', text: 'Immediate response and dedicated customer care.' },
              { title: 'Modern Experience', text: 'Seamless online booking and transparent pricing.' },
            ],
          },
          {
            type: 'contact',
            phone: '+1 (555) 019-2834',
            email: `contact@${slug}.com`,
            address: 'Downtown Metro Area',
          },
        ],
      },
    ];

    const website = await prisma.websiteProject.create({
      data: {
        userId: req.user?.id || null,
        slug,
        title: title || `${businessName} Official Site`,
        businessName,
        industry: industry || 'Professional Services',
        description: description || null,
        theme: JSON.stringify(defaultTheme),
        pages: JSON.stringify(defaultPages),
        published: Boolean(published),
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'WEBSITE_GENERATED',
          details: `Generated site for ${businessName} (slug: ${slug})`,
        },
      }).catch(() => null);
    }

    return res.status(201).json({
      success: true,
      data: {
        ...website,
        theme: defaultTheme,
        pages: defaultPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getWebsitesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const where: any = {};
    if (req.user) {
      where.userId = req.user.id;
    }

    const sites = await prisma.websiteProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const parsed = sites.map((s) => ({
      ...s,
      theme: JSON.parse(s.theme || '{}'),
      pages: JSON.parse(s.pages || '[]'),
    }));

    return res.json({
      success: true,
      count: parsed.length,
      data: parsed,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWebsiteBySlugHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    const site = await prisma.websiteProject.findUnique({
      where: { slug },
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        error: 'Website project not found.',
      });
    }

    return res.json({
      success: true,
      data: {
        ...site,
        theme: JSON.parse(site.theme || '{}'),
        pages: JSON.parse(site.pages || '[]'),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateWebsiteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, theme, pages, published, customDomain } = req.body;

    const updated = await prisma.websiteProject.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(theme && { theme: typeof theme === 'string' ? theme : JSON.stringify(theme) }),
        ...(pages && { pages: typeof pages === 'string' ? pages : JSON.stringify(pages) }),
        ...(published !== undefined && { published: Boolean(published) }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return res.json({
      success: true,
      data: {
        ...updated,
        theme: JSON.parse(updated.theme || '{}'),
        pages: JSON.parse(updated.pages || '[]'),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteWebsiteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    await prisma.websiteProject.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Website project deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

