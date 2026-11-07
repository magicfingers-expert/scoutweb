import { BusinessResult, PitchRecord, WebsiteProject, WebsitePage, WebsiteSection } from './types';
import { isOpenAiConfigured, generateOpenAiSalesPitch } from './openai';

interface PitchOptions {
  business: {
    name: string;
    category: string;
    address: string;
    rating: number;
    reviewCount: number;
    website?: string;
    websiteStatus?: string;
    recommendedServices?: string;
  };
  channel: 'email' | 'whatsapp' | 'linkedin';
  tone: 'professional' | 'friendly' | 'persuasive';
  length: 'short' | 'detailed';
  customInstructions?: string;
  apiKey?: string;
}

// 1. AI Pitch Generator
export async function generateAiPitch(options: PitchOptions): Promise<PitchRecord> {
  if (isOpenAiConfigured()) {
    try {
      const openAiPitch = await generateOpenAiSalesPitch(options);
      if (openAiPitch && openAiPitch.content) {
        return openAiPitch;
      }
    } catch (err) {
      console.warn('OpenAI sales pitch generation encountered an issue, falling back to heuristic engine:', err);
    }
  }

  const { business, channel, tone, length, customInstructions } = options;
  const bizName = business.name;
  const category = business.category;
  const hasWebsite = business.website && business.websiteStatus === 'verified';
  const ratingText = business.rating ? `${business.rating.toFixed(1)}★ (${business.reviewCount} reviews)` : 'great reputation';

  let subject = '';
  let content = '';

  if (channel === 'email') {
    if (tone === 'professional') {
      subject = !hasWebsite 
        ? `Website & Digital Growth Opportunity for ${bizName}`
        : `Upgrading ${bizName}'s Online Conversion & Speed`;
      
      content = length === 'short'
        ? `Hi ${bizName} Team,\n\nI came across ${bizName} on Google and noticed your stellar ${ratingText}. You've clearly built an exceptional local reputation.\n\nHowever, I noticed you don't currently have an official website listed on your profile. Right now, potential customers looking for ${category.toLowerCase()} services in your area are clicking on competitors who offer direct online booking.\n\nWe design high-converting, mobile-friendly websites specifically for top-tier ${category.toLowerCase()} businesses. Would you be open to seeing a free 3-minute preview of what a modern site for ${bizName} could look like?\n\nBest regards,\nAlex Hunter\nDigital Growth Specialist`
        : `Dear ${bizName} Management,\n\nI hope this email finds you well.\n\nWhile researching the top ${category.toLowerCase()} businesses in your area, I was thoroughly impressed by ${bizName}'s ${ratingText}. It's rare to see that level of client satisfaction.\n\nDuring my review, I noticed a critical gap: there is no verified official website connected to your Google Business Profile. In today's digital landscape, over 74% of local searches lead to a website visit before a customer decides to book.\n\nWithout an owned digital hub, you are currently conceding valuable local search volume to nearby competitors. We specialize in building:\n• High-speed, mobile-optimized showcase websites\n• Direct customer booking and reservation integrations\n• Google Local 3-Pack SEO to dominate local searches\n\nI've already prepared a preliminary concept wireframe for ${bizName}. Are you free for a brief 5-minute chat this Thursday to review it?\n\nWarm regards,\nAlex Hunter\nSenior Web Strategist`;
    } else if (tone === 'friendly') {
      subject = `Quick idea for ${bizName} ✨`;
      content = length === 'short'
        ? `Hey team at ${bizName}! 👋\n\nJust wanted to say congratulations on the amazing reviews (${ratingText})! You guys are clearly crushing it in the ${category.toLowerCase()} space.\n\nI was actually looking to browse your full services online and noticed you don't have an official website linked yet. It feels like you're leaving a lot of easy appointments on the table!\n\nI put together a quick mockup of a modern website tailored for ${bizName}. Can I send over the link for you to check out?\n\nCheers,\nAlex`
        : `Hey there ${bizName} team! 👋\n\nI was doing some research on the best ${category.toLowerCase()} spots around and couldn't help but notice your incredible ${ratingText}! Huge props to your crew.\n\nOne thing that caught my eye is that when customers search for you, there's no website to book with you or see your latest work. In 2026, so many people prefer tapping "Book Online" rather than calling in during busy hours.\n\nWe build sleek, super fast websites that turn Google searchers into loyal regulars on autopilot. No complicated tech on your end — we handle everything from design to hosting.\n\nWould you love to see a free design draft I started for ${bizName}? Happy to send it right over!\n\nBest,\nAlex`;
    } else { // persuasive
      subject = `${bizName} is losing customers to competitors without a website`;
      content = length === 'short'
        ? `Hello ${bizName},\n\nYou have an outstanding ${ratingText}, yet your biggest competitors are outranking you simply because they have an active website.\n\nEvery day, dozens of people search for ${category.toLowerCase()} in your city and book elsewhere because they can't view your menu, pricing, or appointment slots online.\n\nWe built an automated website solution that will position ${bizName} as the #1 choice in your market within 7 days. Can I send you a 60-second video demo?\n\nSincerely,\nAlex Hunter`
        : `Hello ${bizName},\n\nDid you know that over 65% of local customers who don't find a website immediately click on the next competitor down the list?\n\nDespite your incredible ${ratingText}, you are invisible to an entire demographic of high-paying clients who only book online.\n\nHere is what our turnkey digital platform will do for ${bizName}:\n1. Capture and convert Google Search traffic 24/7.\n2. Enable instant mobile appointments without tying up phone lines.\n3. Solidify your position as the undisputed authority in your local market.\n\nWe can have a complete, fully branded website live for ${bizName} in under a week with zero technical headache on your part. Let's schedule a 10-minute strategy call this week.\n\nBest,\nAlex Hunter`;
    }
  } else if (channel === 'whatsapp') {
    if (tone === 'friendly') {
      content = `Hey ${bizName}! 👋 Saw your great ${ratingText} on Google. Noticed you guys don't have a website listed for bookings yet. We build modern sites that let customers book appointments directly from their phone. Would you like to see a quick free design preview for ${bizName}?`;
    } else if (tone === 'persuasive') {
      content = `Hi ${bizName} Team. You have a stellar ${ratingText}, but without a website on Google, local customers searching for ${category.toLowerCase()} are booking with competitors. We can get you an automated booking website live in 48 hours. When's a good time for a quick 2-minute chat?`;
    } else {
      content = `Hello ${bizName}, I hope you are well. I was reviewing top ${category.toLowerCase()} businesses in your area and noticed your Google profile lacks an official website link. We create bespoke high-converting digital portals for established brands. Could I share a brief preview with your manager?`;
    }
  } else { // linkedin
    content = `Hi there,\n\nI came across ${bizName} while analyzing standout businesses in the ${category.toLowerCase()} sector. Your ${ratingText} speaks volumes about your service quality.\n\nI noticed an opportunity regarding your digital presence: an official modern web hub could significantly amplify your direct customer acquisition and brand equity.\n\nI'd love to share some insights and a complimentary layout concept we crafted for ${bizName}. Let's connect!\n\nBest,\nAlex Hunter`;
  }

  if (customInstructions) {
    content += `\n\n[Note: Tailored to focus on: ${customInstructions}]`;
  }

  return {
    id: `pitch_${Date.now()}`,
    channel,
    tone,
    length,
    subject: subject || undefined,
    content,
    createdAt: new Date().toISOString(),
  };
}

// 2. AI Website Designer & Generator
export async function generateWebsiteDraft(params: {
  businessName: string;
  industry: string;
  description: string;
  style: 'modern' | 'bold' | 'luxury' | 'creative' | 'minimal' | 'corporate';
  targetAudience?: string;
  primaryColor?: string;
}): Promise<WebsiteProject> {
  const { businessName, industry, description, style, targetAudience, primaryColor } = params;

  const styleColorPalettes = {
    modern: { primary: '#06b6d4', secondary: '#3b82f6', accent: '#00f2fe', background: '#0a0f1d', surface: '#111b2e', text: '#f8fafc' },
    bold: { primary: '#f59e0b', secondary: '#ef4444', accent: '#fbbf24', background: '#09090b', surface: '#18181b', text: '#fafafa' },
    luxury: { primary: '#d4af37', secondary: '#c5a059', accent: '#f59e0b', background: '#080808', surface: '#141414', text: '#f3f4f6' },
    creative: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#a855f7', background: '#0b0c16', surface: '#161726', text: '#fdf4ff' },
    minimal: { primary: '#38bdf8', secondary: '#64748b', accent: '#7dd3fc', background: '#020617', surface: '#0f172a', text: '#f1f5f9' },
    corporate: { primary: '#2563eb', secondary: '#0284c7', accent: '#38bdf8', background: '#0b1329', surface: '#162244', text: '#f8fafc' },
  };

  const colors = {
    ...styleColorPalettes[style] || styleColorPalettes.modern,
    primary: primaryColor || styleColorPalettes[style]?.primary || '#06b6d4',
  };

  const sections: WebsiteSection[] = [
    {
      id: `sec_${Date.now()}_hero`,
      type: 'hero',
      title: `Experience Premium ${industry} at ${businessName}`,
      subtitle: description || `Dedicated to delivering world-class ${industry.toLowerCase()} services with unmatched passion, precision, and personalized care.`,
      content: {
        badgeText: '★ Rated 5.0 Locally for Excellence',
        ctaPrimaryText: 'Book an Appointment',
        ctaPrimaryLink: '#contact',
        ctaSecondaryText: 'Explore Services',
        ctaSecondaryLink: '#services',
        bgImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&auto=format&fit=crop&q=80',
      },
    },
    {
      id: `sec_${Date.now()}_features`,
      type: 'features',
      title: 'Why Our Clients Choose Us',
      subtitle: 'Setting the highest standard in every single detail.',
      content: {
        items: [
          {
            icon: 'Sparkles',
            title: 'Master Craftsmen',
            description: 'Trained professionals dedicated to perfecting every cut, service, and consultation.',
          },
          {
            icon: 'Clock',
            title: 'Seamless Online Booking',
            description: 'No waiting on hold. Reserve your preferred slot in less than 60 seconds.',
          },
          {
            icon: 'ShieldCheck',
            title: '100% Satisfaction Guarantee',
            description: 'We pride ourselves on perfection and making sure every customer leaves thrilled.',
          },
        ],
      },
    },
    {
      id: `sec_${Date.now()}_services`,
      type: 'services',
      title: 'Our Signature Services',
      subtitle: `Tailored ${industry.toLowerCase()} solutions crafted for your exact style and preferences.`,
      content: {
        servicesList: [
          {
            name: 'Signature Executive Service',
            price: '$65',
            duration: '45 mins',
            description: 'Full comprehensive consultation, precision treatment, relaxing warm towel, and custom styling.',
          },
          {
            name: 'Classic Precision Package',
            price: '$45',
            duration: '30 mins',
            description: 'Clean contours, specialized detailing, and premium organic finish products.',
          },
          {
            name: 'Deluxe Rejuvenation Session',
            price: '$85',
            duration: '60 mins',
            description: 'The ultimate VIP experience with scalp conditioning, deep massage, and grooming masterclass.',
          },
        ],
      },
    },
    {
      id: `sec_${Date.now()}_about`,
      type: 'about',
      title: `About ${businessName}`,
      subtitle: 'Rooted in heritage, powered by modern passion.',
      content: {
        story: `Founded with a singular mission: to redefine ${industry.toLowerCase()} excellence. At ${businessName}, we combine timeless techniques with cutting-edge comfort to bring you an atmosphere that feels like home and results that elevate your everyday confidence.`,
        stat1: '10+ Years',
        stat1Label: 'Industry Experience',
        stat2: '5,000+',
        stat2Label: 'Happy Clients',
        stat3: '4.9★',
        stat3Label: 'Average Rating',
        imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1000&auto=format&fit=crop&q=80',
      },
    },
    {
      id: `sec_${Date.now()}_testimonials`,
      type: 'testimonials',
      title: 'Loved by Our Community',
      subtitle: 'Hear what our regular clients have to say about the experience.',
      content: {
        reviews: [
          {
            author: 'Marcus Vance',
            role: 'Verified Customer',
            text: `Hands down the most impressive ${industry.toLowerCase()} in town. From the moment you walk in, the professionalism and attention to detail are on another level!`,
            rating: 5,
          },
          {
            author: 'Sarah Jenkins',
            role: 'Local Resident',
            text: `I've been a regular for over two years now. Never had a single bad experience. Friendly staff, immaculate vibe, and flawless work every time.`,
            rating: 5,
          },
        ],
      },
    },
    {
      id: `sec_${Date.now()}_contact`,
      type: 'contact',
      title: 'Get In Touch & Book Today',
      subtitle: `Ready to experience ${businessName}? Drop us a message or schedule directly.`,
      content: {
        phone: '+1 (555) 234-5678',
        email: `hello@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        address: '123 Downtown Boulevard, Suite 400',
        hours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
        showForm: true,
      },
    },
    {
      id: `sec_${Date.now()}_footer`,
      type: 'footer',
      title: businessName,
      subtitle: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
      content: {
        tagline: `Your premier destination for ${industry.toLowerCase()}.`,
        links: ['Services', 'About Us', 'Reviews', 'Privacy Policy'],
      },
    },
  ];

  const homepage: WebsitePage = {
    id: `page_${Date.now()}_home`,
    slug: 'home',
    title: 'Home',
    sections,
  };

  const project: WebsiteProject = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: 'usr_default',
    name: `${businessName} Web Presence`,
    businessName,
    industry,
    description,
    targetAudience: targetAudience || 'Local customers and clients',
    style,
    colors,
    pages: [homepage],
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return project;
}

// 3. AI Visual Editing Assistant
export function modifyWebsiteWithAi(
  project: WebsiteProject,
  prompt: string
): { updatedProject: WebsiteProject; summary: string } {
  const p = JSON.parse(JSON.stringify(project)) as WebsiteProject;
  const promptLower = prompt.toLowerCase();
  let summary = 'Website updated based on your prompt.';

  // Example modifications based on prompt intent
  if (promptLower.includes('modern') || promptLower.includes('hero')) {
    const hero = p.pages[0]?.sections.find(s => s.type === 'hero');
    if (hero) {
      hero.title = `The Future of ${p.industry} is Here`;
      hero.subtitle = `Modern precision, effortless online appointments, and premium craftsmanship tailored for you.`;
      hero.content.badgeText = '⚡ Next-Gen Experience';
      summary = 'Updated hero headline, modern badge, and value proposition.';
    }
  }

  if (promptLower.includes('luxury') || promptLower.includes('gold')) {
    p.colors.primary = '#d4af37';
    p.colors.accent = '#f59e0b';
    p.colors.background = '#0a0a0c';
    p.colors.surface = '#141418';
    summary = 'Applied luxury dark gold aesthetic and elevated surface contrast.';
  } else if (promptLower.includes('cyan') || promptLower.includes('neon') || promptLower.includes('blue')) {
    p.colors.primary = '#00f2fe';
    p.colors.accent = '#06b6d4';
    p.colors.background = '#080d1a';
    p.colors.surface = '#0f172a';
    summary = 'Switched color palette to vibrant neon cyber-cyan and dark navy.';
  }

  if (promptLower.includes('testimonial') || promptLower.includes('review')) {
    const exists = p.pages[0]?.sections.some(s => s.type === 'testimonials');
    if (!exists) {
      p.pages[0]?.sections.splice(p.pages[0].sections.length - 2, 0, {
        id: `sec_${Date.now()}_testi`,
        type: 'testimonials',
        title: 'Real Reviews From Real Clients',
        subtitle: 'Our work speaks for itself.',
        content: {
          reviews: [
            { author: 'Jordan Miller', role: 'Local Client', text: 'Unbelievable attention to detail. Easily the best in the city.', rating: 5 },
            { author: 'Elena Rostova', role: 'Regular Patron', text: 'Stunning service and effortless booking flow. 10/10 recommend!', rating: 5 }
          ]
        }
      });
      summary = 'Added new customer testimonials section before contact form.';
    }
  }

  if (promptLower.includes('pricing') || promptLower.includes('price')) {
    const exists = p.pages[0]?.sections.some(s => s.type === 'pricing');
    if (!exists) {
      p.pages[0]?.sections.splice(p.pages[0].sections.length - 2, 0, {
        id: `sec_${Date.now()}_price`,
        type: 'pricing',
        title: 'Transparent, Straightforward Pricing',
        subtitle: 'No hidden fees. Pick the package that fits your schedule.',
        content: {
          tiers: [
            { name: 'Standard', price: '$40', features: ['Complete service', 'Consultation', 'Premium styling'] },
            { name: 'VIP Executive', price: '$75', features: ['Priority booking', 'Hot towel treatment', 'Complimentary beverage', 'VIP products'] }
          ]
        }
      });
      summary = 'Added new transparent pricing tiers section.';
    }
  }

  p.updatedAt = new Date().toISOString();
  return { updatedProject: p, summary };
}

