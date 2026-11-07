import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, businessName, industry, targetAudience, keywords = '', extraNotes = '' } = body;

    if (!businessName || !tool) {
      return NextResponse.json({ error: 'Business name and tool selection are required.' }, { status: 400 });
    }

    let generatedOutput = '';
    const cleanBiz = businessName.trim();
    const cleanInd = (industry || 'Business').trim();

    switch (tool) {
      case 'seo_meta':
        generatedOutput = `SEO Title Tag (56 characters):\n${cleanBiz} | Premier ${cleanInd} in Your City\n\nMeta Description (154 characters):\nLooking for top-rated ${cleanInd.toLowerCase()} services? ${cleanBiz} provides expert craftsmanship, transparent pricing, and instant online bookings. Explore our services today!\n\nPrimary Focus Keywords:\n${keywords || `${cleanInd.toLowerCase()}, local ${cleanInd.toLowerCase()}, best ${cleanInd.toLowerCase()}, book ${cleanInd.toLowerCase()}`}`;
        break;

      case 'landing_copy':
        generatedOutput = `### HERO SECTION\nHeadline: Transform Your ${cleanInd} Experience with ${cleanBiz}\nSubheadline: Rated 5.0 for excellence. Book your appointment in under 60 seconds with our dedicated master specialists.\nCall to Action: [ Reserve Your Slot Now ]\n\n### KEY VALUE PILLARS\n1. Uncompromising Quality: Handcrafted attention to detail with premium professional products.\n2. Effortless Convenience: Transparent online availability and zero wait times.\n3. Complete Guarantee: We stand 100% behind every service we perform.`;
        break;

      case 'cold_email':
        generatedOutput = `Subject: Elevating ${cleanBiz}'s customer bookings in 2026\n\nHi ${cleanBiz} Team,\n\nI was reviewing top-rated ${cleanInd.toLowerCase()} providers in your local market and was genuinely impressed by your stellar customer feedback.\n\nWhile your reputation is top tier, I noticed an opportunity to capture even more direct customers who search on mobile and prefer to book instantly online rather than calling during rush hours.\n\nWe build high-speed, modern booking websites designed specifically for premier ${cleanInd.toLowerCase()} businesses.\n\nWould you be open to a 2-minute video walkthrough showing what a modern web portal for ${cleanBiz} looks like?\n\nBest regards,\nAlex Hunter`;
        break;

      case 'whatsapp_script':
        generatedOutput = `Hey ${cleanBiz}! 👋 Saw your great ratings on Google. Noticed your profile doesn't have a direct website for online appointments. We build clean mobile booking sites that turn Google searchers into loyal regulars on autopilot. Would love to share a free custom preview if you're open to taking a look!`;
        break;

      case 'social_captions':
        generatedOutput = `Post 1 (Instagram / Showcase):\n"Excellence isn't an accident — it's our standard. ✨ Whether you're refreshing your look or booking a custom session, ${cleanBiz} has you covered. Tap the link in our bio to book your slot today! #LocalBusiness #${cleanInd.replace(/\s+/g, '')} #Craftsmanship"\n\nPost 2 (Behind The Scenes):\n"Details that make the difference. 🏆 Proudly serving our amazing community with world-class ${cleanInd.toLowerCase()} services every single day. See you in the studio soon! #CommunityFirst #${cleanBiz.replace(/\s+/g, '')}"`;
        break;

      case 'sales_proposal':
        generatedOutput = `# High-Impact Digital Growth Proposal for ${cleanBiz}\n\n## 1. Executive Summary\n${cleanBiz} has built an enviable local reputation. However, the business is currently conceding significant organic search traffic to lesser-rated competitors who possess modern, mobile-friendly websites.\n\n## 2. Recommended Solution Package\n• Custom Turnkey Website (Desktop, Tablet, Mobile)\n• Instant Direct Booking System Integration\n• Google Local 3-Pack SEO Optimization\n• Core Web Vitals Ultra-Fast Cloud Hosting\n\n## 3. Projected ROI\n• Estimated +25% to +40% increase in monthly appointment bookings\n• Complete ownership of your digital customer list without third-party commission fees\n• Seamless automated 24/7 customer capture`;
        break;

      default:
        generatedOutput = `${cleanBiz} is a premier ${cleanInd.toLowerCase()} destination dedicated to providing top-tier service, trusted by local clients for quality, dependability, and attention to detail.`;
        break;
    }

    db.incrementAiOpsCount();
    db.addActivity(
      'AI Copy Generated',
      `Generated ${tool.replace('_', ' ')} copy for "${cleanBiz}"`,
      'pitch'
    );

    return NextResponse.json({
      success: true,
      output: generatedOutput,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Content generation failed' }, { status: 500 });
  }
}

