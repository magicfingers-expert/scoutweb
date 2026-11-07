export type WebsiteStatus = 'no_website' | 'verified' | 'unverified' | 'social_only';

export type PresenceStatus = 'verified' | 'found' | 'not_found' | 'unverified' | 'unable_to_check';

export interface PresenceItem {
  status: PresenceStatus;
  url?: string;
  source?: string;
  label?: string;
}

export interface OnlinePresence {
  website: PresenceItem;
  whatsapp: PresenceItem;
  instagram: PresenceItem;
  facebook: PresenceItem;
  tiktok: PresenceItem;
  linkedin: PresenceItem;
  youtube: PresenceItem;
  email: PresenceItem;
}

export interface BusinessResult {
  id: string;
  name: string;
  category: string;
  address: string;
  city?: string;
  phone?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  googleMapsUrl: string;
  website?: string;
  websiteStatus: WebsiteStatus;
  cms?: string;
  cmsTag?: 'Shopify' | 'Wix' | 'WordPress' | 'Squarespace' | 'Webflow' | 'Custom' | 'No Website';
  openingHours?: string[];
  lat?: number;
  lng?: number;
  onlinePresence: OnlinePresence;
  opportunityScore: number;
  opportunityTier: 'HIGH OPPORTUNITY' | 'MEDIUM OPPORTUNITY' | 'LOW OPPORTUNITY';
  analysisPoints: string[];
  recommendedServices: string;
  suggestedSalesAngle: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Follow-up' | 'Converted' | 'Not interested';

export interface PitchRecord {
  id: string;
  channel: 'email' | 'whatsapp' | 'linkedin';
  tone: 'professional' | 'friendly' | 'persuasive';
  length: 'short' | 'detailed';
  subject?: string;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  businessId?: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  cms?: string;
  googleRating: number;
  reviewCount: number;
  googleMapsUrl?: string;
  opportunityScore: number;
  opportunityTier: string;
  status: LeadStatus;
  source: string;
  tags: string[];
  notes: string[];
  pitches: PitchRecord[];
  recommendedServices?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetailedIssue {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  problem: string;
  whyItMatters: string;
  recommendation: string;
  businessImpact: string;
}

export interface ActionPlanTask {
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface ActionPlanWeek {
  week: number;
  title: string;
  tasks: ActionPlanTask[];
}

export type OutreachAngleKey =
  | 'executive_summary'
  | 'performance_vitals'
  | 'conversion_ux'
  | 'technical_seo'
  | 'glitch_alert'
  | 'conversion_teardown'
  | 'compliment_fix'
  | 'quick_observation';

export interface OutreachAngleVariant {
  subject?: string;
  body: string;
}

export interface OutreachChannelData {
  subject?: string;
  body: string;
  angles?: {
    executive_summary?: OutreachAngleVariant;
    performance_vitals?: OutreachAngleVariant;
    conversion_ux?: OutreachAngleVariant;
    technical_seo?: OutreachAngleVariant;
    glitch_alert?: OutreachAngleVariant;
    conversion_teardown?: OutreachAngleVariant;
    compliment_fix?: OutreachAngleVariant;
    quick_observation?: OutreachAngleVariant;
    [key: string]: OutreachAngleVariant | undefined;
  };
}

export interface AuditReport {
  id: string;
  userId?: string;
  url: string;
  businessName: string;
  businessType: string;
  cms?: string;
  timestamp: string;
  overallScore: number;
  summaryParagraph1: string;
  criticalFindingsSummary: string;
  scores: {
    overall: number;
    ux: number;
    cro: number;
    seo: number;
    trust: number;
    mobile: number;
    content: number;
    productPages: number;
  };
  businessOpportunity: {
    score: number;
    level: 'High' | 'Medium' | 'Low';
    description: string;
    recommendedServices: string[];
  };
  detailedIssues: DetailedIssue[];
  actionPlan: ActionPlanWeek[];
  outreachMessages?: {
    email?: OutreachChannelData;
    linkedIn?: OutreachChannelData;
    whatsApp?: {
      body: string;
      angles?: {
        executive_summary?: { body: string };
        performance_vitals?: { body: string };
        conversion_ux?: { body: string };
        technical_seo?: { body: string };
        glitch_alert?: { body: string };
        conversion_teardown?: { body: string };
        compliment_fix?: { body: string };
        quick_observation?: { body: string };
        [key: string]: { body: string } | undefined;
      };
    };
    instagramDm?: {
      body: string;
      angles?: {
        executive_summary?: { body: string };
        performance_vitals?: { body: string };
        conversion_ux?: { body: string };
        technical_seo?: { body: string };
        glitch_alert?: { body: string };
        conversion_teardown?: { body: string };
        compliment_fix?: { body: string };
        quick_observation?: { body: string };
        [key: string]: { body: string } | undefined;
      };
    };
  };
  metrics: {
    loadTimeMs?: number;
    title?: string;
    metaDescription?: string;
    headingsCount?: { h1: number; h2: number; h3: number };
    imagesCount?: number;
    imagesWithoutAlt?: number;
    scriptCount?: number;
    hasHttps?: boolean;
    hasViewport?: boolean;
    hasCartOrPricing?: boolean;
    hasCta?: boolean;
    pageSizeKb?: number;
  };
  // backward compatibility fields
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  uxScore: number;
  conversionScore: number;
  issues: any[];
  recommendations: string[];
}

export interface CompetitorComparison {
  id: string;
  userId?: string;
  title: string;
  primaryUrl: string;
  competitorUrls: string[];
  reports: AuditReport[];
  winnerUrl: string;
  aiAnalysis: {
    executiveSummary: string;
    strengths: Record<string, string[]>;
    weaknesses: Record<string, string[]>;
    tacticalRecommendations: string[];
    actionPlan: string[];
  };
  createdAt: string;
}

export interface WebsiteSection {
  id: string;
  type: 'hero' | 'features' | 'about' | 'services' | 'testimonials' | 'pricing' | 'cta' | 'contact' | 'footer' | 'faq' | 'gallery';
  title?: string;
  subtitle?: string;
  content: Record<string, any>;
}

export interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  sections: WebsiteSection[];
}

export interface WebsiteProject {
  id: string;
  userId: string;
  name: string;
  businessName: string;
  industry: string;
  description: string;
  targetAudience?: string;
  style: 'modern' | 'bold' | 'luxury' | 'creative' | 'minimal' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  pages: WebsitePage[];
  isPublished: boolean;
  publishedSlug?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  type: 'search' | 'lead' | 'audit' | 'website' | 'pitch' | 'publish' | 'system';
  timestamp: string;
}

export interface UserPreferences {
  googlePlacesApiKey?: string;
  aiProvider?: 'gemini' | 'openai' | 'anthropic' | 'smart_heuristic';
  aiApiKey?: string;
  aiModel?: string;
  emailNotifications?: boolean;
  defaultCity?: string;
  defaultIndustry?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  preferences: UserPreferences;
}
