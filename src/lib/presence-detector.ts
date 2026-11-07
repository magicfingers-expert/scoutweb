import { OnlinePresence, PresenceItem, WebsiteStatus } from './types';

// Detect whether a provided URL is a real domain or just a social media profile
export function classifyWebsiteUrl(url?: string): {
  status: WebsiteStatus;
  normalizedUrl?: string;
} {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { status: 'no_website' };
  }

  const clean = url.trim().toLowerCase();
  
  if (
    clean.includes('facebook.com') ||
    clean.includes('instagram.com') ||
    clean.includes('tiktok.com') ||
    clean.includes('linkedin.com') ||
    clean.includes('wa.me') ||
    clean.includes('youtube.com') ||
    clean.includes('twitter.com') ||
    clean.includes('x.com')
  ) {
    return { status: 'social_only', normalizedUrl: url };
  }

  // Ensure protocol
  let finalUrl = url.trim();
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }

  return { status: 'verified', normalizedUrl: finalUrl };
}

// Generate online presence record for a business
export function detectOnlinePresence(data: {
  phone?: string;
  website?: string;
  name: string;
  category: string;
  email?: string;
}): OnlinePresence {
  const { phone, website, name, email } = data;
  const webClassification = classifyWebsiteUrl(website);

  // 1. Website
  const websitePresence: PresenceItem = {
    status: webClassification.status === 'no_website' 
      ? 'not_found' 
      : webClassification.status === 'social_only' 
      ? 'unverified' 
      : 'verified',
    url: webClassification.normalizedUrl,
    label: webClassification.status === 'no_website' 
      ? 'No website detected' 
      : webClassification.status === 'social_only' 
      ? 'Social profile only' 
      : 'Verified website',
  };

  // 2. WhatsApp
  let whatsappPresence: PresenceItem = { status: 'not_found' };
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 7) {
      whatsappPresence = {
        status: 'unverified',
        url: `https://wa.me/${digits}`,
        label: 'Unverified — From Google phone',
      };
    }
  }

  // 3. Instagram
  let instagramPresence: PresenceItem = { status: 'not_found' };
  if (website && website.toLowerCase().includes('instagram.com')) {
    instagramPresence = {
      status: 'verified',
      url: website,
      label: 'Verified by Google listing',
    };
  }

  // 4. Facebook
  let facebookPresence: PresenceItem = { status: 'not_found' };
  if (website && website.toLowerCase().includes('facebook.com')) {
    facebookPresence = {
      status: 'verified',
      url: website,
      label: 'Verified by Google listing',
    };
  }

  // 5. TikTok
  let tiktokPresence: PresenceItem = { status: 'not_found' };
  if (website && website.toLowerCase().includes('tiktok.com')) {
    tiktokPresence = {
      status: 'verified',
      url: website,
      label: 'Verified by Google listing',
    };
  }

  // 6. LinkedIn
  let linkedinPresence: PresenceItem = { status: 'not_found' };
  if (website && website.toLowerCase().includes('linkedin.com')) {
    linkedinPresence = {
      status: 'verified',
      url: website,
      label: 'Verified by Google listing',
    };
  }

  // 7. YouTube
  let youtubePresence: PresenceItem = { status: 'not_found' };
  if (website && website.toLowerCase().includes('youtube.com')) {
    youtubePresence = {
      status: 'verified',
      url: website,
      label: 'Verified by Google listing',
    };
  }

  // 8. Public Email
  const emailPresence: PresenceItem = email
    ? {
        status: 'verified',
        url: `mailto:${email}`,
        label: email,
      }
    : {
        status: 'not_found',
        label: 'Not found',
      };

  return {
    website: websitePresence,
    whatsapp: whatsappPresence,
    instagram: instagramPresence,
    facebook: facebookPresence,
    tiktok: tiktokPresence,
    linkedin: linkedinPresence,
    youtube: youtubePresence,
    email: emailPresence,
  };
}

// Helper to filter out tracker, framework, or asset emails
export function isIgnoredEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const ignorePatterns = [
    'sentry', 'example.com', 'domain.com', 'email.com', 'yourdomain',
    'wixpress.com', 'schema.org', 'w3.org', 'github.com', 'cloudflare',
    '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', 'react@', 'test@',
    'support@wix.com', 'support@shopify.com', 'support@squarespace.com',
    'support@wordpress.com', 'wordpress@', 'webmaster@', 'noreply@', 'no-reply@',
    'user@', 'name@', 'email@', 'info@myshopify.com'
  ];
  if (ignorePatterns.some(pat => lower.includes(pat))) return true;

  const parts = lower.split('@');
  if (parts.length !== 2) return true;
  if (!parts[1].includes('.') || parts[1].endsWith('.')) return true;
  const tld = parts[1].split('.').pop() || '';
  if (tld.length < 2 || tld.length > 12) return true;
  return false;
}

// Active real website crawler to extract actual public contact emails from live HTML
export async function crawlRealEmailFromWebsite(websiteUrl?: string): Promise<string | undefined> {
  if (!websiteUrl || !websiteUrl.startsWith('http')) return undefined;
  
  // Do not crawl search engines, app stores, or social media
  const lower = websiteUrl.toLowerCase();
  if (
    lower.includes('google.') ||
    lower.includes('instagram.com') ||
    lower.includes('facebook.com') ||
    lower.includes('twitter.com') ||
    lower.includes('tiktok.com') ||
    lower.includes('linkedin.com') ||
    lower.includes('apple.com') ||
    lower.includes('play.google.com')
  ) {
    return undefined;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(websiteUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return undefined;
    const html = await res.text();

    // 1. Look for explicit mailto: links (highest fidelity real contact email)
    const mailtoMatches = html.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
    if (mailtoMatches && mailtoMatches[1]) {
      const email = mailtoMatches[1].toLowerCase().trim();
      if (!isIgnoredEmail(email)) {
        return email;
      }
    }

    // 2. Look for visible email addresses in the page HTML/footer
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const allMatches = html.match(emailRegex) || [];
    for (const match of allMatches) {
      const email = match.toLowerCase().trim();
      if (!isIgnoredEmail(email)) {
        return email;
      }
    }

    // 3. If no email on homepage, check for a dedicated contact link
    const contactHrefMatch = html.match(/href=["']([^"']*(?:contact|about-us)[^"']*)["']/i);
    if (contactHrefMatch && contactHrefMatch[1] && !contactHrefMatch[1].startsWith('#')) {
      try {
        let contactUrl = contactHrefMatch[1];
        if (!contactUrl.startsWith('http')) {
          contactUrl = new URL(contactUrl, websiteUrl).toString();
        }
        
        const cController = new AbortController();
        const cTimeout = setTimeout(() => cController.abort(), 2500);
        const cRes = await fetch(contactUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: cController.signal,
        });
        clearTimeout(cTimeout);

        if (cRes.ok) {
          const cHtml = await cRes.text();
          const cMailto = cHtml.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
          if (cMailto && cMailto[1]) {
            const email = cMailto[1].toLowerCase().trim();
            if (!isIgnoredEmail(email)) return email;
          }

          const cMatches = cHtml.match(emailRegex) || [];
          for (const match of cMatches) {
            const email = match.toLowerCase().trim();
            if (!isIgnoredEmail(email)) return email;
          }
        }
      } catch {
        // Ignore secondary fetch errors
      }
    }
  } catch {
    // network or timeout error, do not invent or guess
  }

  return undefined;
}

// Active Contact Enrichment for "Find Contacts"
export async function enrichBusinessContacts(params: {
  name: string;
  website?: string;
  phone?: string;
  city?: string;
}): Promise<{
  emails: string[];
  socialLinks: Record<string, string>;
  phones: string[];
  contactPageUrl?: string;
}> {
  const emails: Set<string> = new Set();
  const phones: Set<string> = new Set();
  const socialLinks: Record<string, string> = {};
  let contactPageUrl: string | undefined;

  if (params.phone) phones.add(params.phone);

  if (params.website && params.website.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      
      const response = await fetch(params.website, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const text = await response.text();
        
        // Extract real mailto links first
        const mailtoMatches = text.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/gi) || [];
        mailtoMatches.forEach(m => {
          const match = m.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
          if (match && match[1]) {
            const email = match[1].toLowerCase().trim();
            if (!isIgnoredEmail(email)) emails.add(email);
          }
        });

        // Extract emails via regex
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const matches = text.match(emailRegex) || [];
        matches.forEach(e => {
          const lower = e.toLowerCase().trim();
          if (!isIgnoredEmail(lower)) {
            emails.add(lower);
          }
        });

        // Extract social profiles
        if (text.includes('instagram.com/')) {
          const igMatch = text.match(/https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/i);
          if (igMatch) socialLinks.instagram = igMatch[0];
        }
        if (text.includes('facebook.com/')) {
          const fbMatch = text.match(/https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+/i);
          if (fbMatch) socialLinks.facebook = fbMatch[0];
        }
        if (text.includes('linkedin.com/company/')) {
          const liMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9._-]+/i);
          if (liMatch) socialLinks.linkedin = liMatch[0];
        }

        // Contact page link
        if (text.includes('href="') && text.toLowerCase().includes('contact')) {
          const contactMatch = text.match(/href="([^"]*contact[^"]*)"/i);
          if (contactMatch && contactMatch[1]) {
            contactPageUrl = contactMatch[1].startsWith('http') 
              ? contactMatch[1] 
              : new URL(contactMatch[1], params.website).toString();
          }
        }
      }
    } catch {
      // Graceful timeout/fetch error
    }
  }

  // Real research only - NEVER invent or guess fake emails if none found on site
  return {
    emails: Array.from(emails),
    phones: Array.from(phones),
    socialLinks,
    contactPageUrl,
  };
}

