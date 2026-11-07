import { BusinessResult, OnlinePresence, WebsiteStatus } from './types';

export function calculateOpportunityScore(business: {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  website?: string;
  websiteStatus: WebsiteStatus;
  onlinePresence: OnlinePresence;
}): {
  score: number;
  tier: 'HIGH OPPORTUNITY' | 'MEDIUM OPPORTUNITY' | 'LOW OPPORTUNITY';
  analysisPoints: string[];
  recommendedServices: string;
  suggestedSalesAngle: string;
} {
  let score = 20; // baseline
  const points: string[] = [];

  // 1. Website Status Signal (Max +45 points)
  if (business.websiteStatus === 'no_website' || !business.website) {
    score += 42;
    points.push('• No website listed on Google — full web presence opportunity');
  } else if (business.websiteStatus === 'social_only') {
    score += 32;
    points.push('• Only a social/profile link instead of an owned website');
  } else if (business.websiteStatus === 'unverified') {
    score += 22;
    points.push('• Unverified website link — potential broken domain or security warning');
  } else {
    // verified website exists
    score += 5;
    points.push('• Has verified website — prospect for redesign, SEO or speed optimization');
  }

  // 2. Review Demand Signal (Max +20 points)
  if (business.reviewCount >= 100) {
    score += 18;
    points.push(`• Strong demand signal (${business.reviewCount} reviews) — established revenue`);
  } else if (business.reviewCount >= 25) {
    score += 12;
    points.push(`• Solid local traction (${business.reviewCount} reviews) — growing customer base`);
  } else if (business.reviewCount > 0) {
    score += 8;
    points.push(`• Emerging business (${business.reviewCount} reviews) — ready for local SEO launch`);
  } else {
    points.push('• Zero Google reviews — opportunity for review generation & reputation setup');
  }

  // 3. Rating Quality Signal (Max +15 points)
  if (business.rating >= 4.5) {
    score += 14;
    points.push(`• Well rated (${business.rating.toFixed(1)}★) — stellar reputation worth showcasing online`);
  } else if (business.rating >= 3.8) {
    score += 9;
    points.push(`• Positive rating (${business.rating.toFixed(1)}★) — high trust foundation`);
  } else if (business.rating > 0) {
    score += 4;
    points.push(`• Rating ${business.rating.toFixed(1)}★ — opportunity for social proof turnaround`);
  }

  // 4. Social & Contact Presence (Max +15 points)
  const missingChannels: string[] = [];
  if (business.onlinePresence.whatsapp.status === 'not_found' || business.onlinePresence.whatsapp.status === 'unverified') {
    missingChannels.push('WhatsApp');
  }
  if (business.onlinePresence.instagram.status === 'not_found') {
    missingChannels.push('Instagram');
  }
  if (business.onlinePresence.facebook.status === 'not_found') {
    missingChannels.push('Facebook');
  }
  if (business.onlinePresence.email.status === 'not_found') {
    missingChannels.push('Public Email');
  }

  if (missingChannels.length >= 3) {
    score += 12;
    points.push(`• Missing omnichannel presence (${missingChannels.slice(0, 2).join(', ')}) — high marketing void`);
  } else if (missingChannels.length > 0) {
    score += 6;
  }

  // Normalize score between 15 and 98
  score = Math.min(98, Math.max(15, Math.round(score)));

  let tier: 'HIGH OPPORTUNITY' | 'MEDIUM OPPORTUNITY' | 'LOW OPPORTUNITY' = 'LOW OPPORTUNITY';
  if (score >= 75) {
    tier = 'HIGH OPPORTUNITY';
  } else if (score >= 50) {
    tier = 'MEDIUM OPPORTUNITY';
  }

  // Recommendations based on gaps
  let recommendedServices = 'Website Design & Development';
  let suggestedSalesAngle = 'Position a custom fast-loading website to capture organic search traffic and boost direct customer bookings.';

  if (business.websiteStatus === 'no_website' || !business.website) {
    recommendedServices = 'Website Design & Development';
    suggestedSalesAngle = 'Pitch that competitors with websites are capturing their search traffic. Offer a modern turnkey booking/showcase site.';
  } else if (business.websiteStatus === 'social_only') {
    recommendedServices = 'Custom Domain Website & Brand Hub';
    suggestedSalesAngle = 'Explain how relying purely on social algorithms hurts organic search rankings and ad conversions.';
  } else if (missingChannels.length >= 2) {
    recommendedServices = 'Digital Presence & Lead Funnel Package';
    suggestedSalesAngle = 'Highlight missed inquiries from mobile users who prefer direct chat and instant booking.';
  } else {
    recommendedServices = 'Website Redesign & Conversion Rate Optimization';
    suggestedSalesAngle = 'Audit their existing site speed and mobile layout, offering modernization and local SEO dominance.';
  }

  return {
    score,
    tier,
    analysisPoints: points.slice(0, 3), // Top 3 impactful points matching the UI
    recommendedServices,
    suggestedSalesAngle,
  };
}

