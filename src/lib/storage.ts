import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Lead, 
  AuditReport, 
  CompetitorComparison, 
  WebsiteProject, 
  ActivityLog 
} from './types';

interface DatabaseSchema {
  users: UserProfile[];
  leads: Lead[];
  audits: AuditReport[];
  comparisons: CompetitorComparison[];
  websites: WebsiteProject[];
  activity: ActivityLog[];
  searchCount: number;
  aiOpsCount: number;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Default initial demo user
const DEFAULT_USER: UserProfile = {
  id: 'usr_default',
  name: 'Alex Hunter',
  email: 'prospector@scoutweb.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Agency Founder',
  createdAt: new Date().toISOString(),
  preferences: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
    aiProvider: (process.env.AI_PROVIDER as any) || 'openai',
    aiApiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
    aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
    emailNotifications: true,
    defaultCity: 'Austin, TX',
    defaultIndustry: 'Barbers',
  },
};

const INITIAL_DB: DatabaseSchema = {
  users: [DEFAULT_USER],
  leads: [],
  audits: [],
  comparisons: [],
  websites: [],
  activity: [
    {
      id: 'act_init',
      userId: DEFAULT_USER.id,
      action: 'System Initialized',
      details: 'ScoutWeb ready with 100% free unlimited prospecting tools.',
      type: 'system',
      timestamp: new Date().toISOString(),
    },
  ],
  searchCount: 0,
  aiOpsCount: 0,
};

function ensureDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...INITIAL_DB, ...parsed };
  } catch (err) {
    console.error('Error reading database file:', err);
    return INITIAL_DB;
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

export const db = {
  // ==========================================
  // USERS & INDIVIDUAL ACCOUNT MANAGEMENT
  // ==========================================
  getUsers(): UserProfile[] {
    const data = ensureDb();
    return data.users || [];
  },

  getUser(): UserProfile {
    const data = ensureDb();
    return data.users[0] || DEFAULT_USER;
  },

  getUserById(id: string): UserProfile | undefined {
    const data = ensureDb();
    return data.users.find(u => u.id === id);
  },

  getUserByEmail(email: string): UserProfile | undefined {
    const data = ensureDb();
    const clean = email.trim().toLowerCase();
    return data.users.find(u => u.email.trim().toLowerCase() === clean);
  },

  createUser(params: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }): UserProfile {
    const data = ensureDb();
    const cleanEmail = params.email.trim().toLowerCase();

    const existing = data.users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: params.name.trim(),
      email: cleanEmail,
      passwordHash: params.passwordHash,
      role: params.role || 'Agency Prospector',
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      preferences: {
        googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
        aiProvider: (process.env.AI_PROVIDER as any) || 'openai',
        aiApiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '',
        aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
        emailNotifications: true,
        defaultCity: 'Austin, TX',
        defaultIndustry: 'Local Businesses',
      },
    };

    data.users.push(newUser);

    // Add welcoming activity to their private workspace
    data.activity.unshift({
      id: `act_${Date.now()}`,
      userId: newUser.id,
      action: 'Account Created',
      details: `Welcome to ScoutWeb, ${newUser.name}! Your private prospecting suite is ready.`,
      type: 'system',
      timestamp: new Date().toISOString(),
    });

    saveDb(data);
    return newUser;
  },

  updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const data = ensureDb();
    const index = data.users.findIndex(u => u.id === userId);
    if (index === -1) {
      // Fallback to first user for backward compatibility
      if (data.users.length > 0) {
        data.users[0] = {
          ...data.users[0],
          ...updates,
          preferences: { ...data.users[0].preferences, ...(updates.preferences || {}) },
        };
        saveDb(data);
        return data.users[0];
      }
      return null;
    }

    data.users[index] = {
      ...data.users[index],
      ...updates,
      preferences: {
        ...data.users[index].preferences,
        ...(updates.preferences || {}),
      },
    };
    saveDb(data);
    return data.users[index];
  },

  // ==========================================
  // LEADS (STRICT USER ISOLATION)
  // ==========================================
  getLeads(userId?: string): Lead[] {
    const data = ensureDb();
    if (!userId) return data.leads;
    return data.leads.filter(l => l.userId === userId);
  },

  getLeadById(id: string, userId?: string): Lead | undefined {
    const data = ensureDb();
    return data.leads.find(l => l.id === id && (!userId || l.userId === userId));
  },

  saveLead(leadInput: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): { lead: Lead; created: boolean } {
    const data = ensureDb();
    const userId = leadInput.userId || 'usr_default';

    // Prevent duplicates for the same user
    const existing = data.leads.find(
      l => l.userId === userId && (
        (l.businessId && l.businessId === leadInput.businessId) ||
        (l.name.toLowerCase() === leadInput.name.toLowerCase() && l.address.toLowerCase() === leadInput.address.toLowerCase())
      )
    );

    if (existing) {
      return { lead: existing, created: false };
    }

    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadInput,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    data.leads.unshift(newLead);

    data.activity.unshift({
      id: `act_${Date.now()}`,
      userId,
      action: 'Saved Lead',
      details: `Saved "${newLead.name}" (${newLead.category}) to private CRM with score ${newLead.opportunityScore}/100`,
      type: 'lead',
      timestamp: now,
    });

    saveDb(data);
    return { lead: newLead, created: true };
  },

  updateLead(id: string, updates: Partial<Lead>, userId?: string): Lead | null {
    const data = ensureDb();
    const index = data.leads.findIndex(l => l.id === id && (!userId || l.userId === userId));
    if (index === -1) return null;

    data.leads[index] = {
      ...data.leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDb(data);
    return data.leads[index];
  },

  deleteLead(id: string, userId?: string): boolean {
    const data = ensureDb();
    const prevLength = data.leads.length;
    data.leads = data.leads.filter(l => !(l.id === id && (!userId || l.userId === userId)));
    if (data.leads.length !== prevLength) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // ==========================================
  // AUDITS (STRICT USER ISOLATION)
  // ==========================================
  getAudits(userId?: string): AuditReport[] {
    const data = ensureDb();
    if (!userId) return data.audits;
    return data.audits.filter(a => a.userId === userId || (!a.userId && userId === 'usr_default'));
  },

  getAuditById(id: string, userId?: string): AuditReport | undefined {
    const data = ensureDb();
    return data.audits.find(a => a.id === id && (!userId || a.userId === userId || !a.userId));
  },

  saveAudit(report: AuditReport, userId?: string): AuditReport {
    const data = ensureDb();
    const targetUserId = userId || report.userId || 'usr_default';
    const auditWithUser = { ...report, userId: targetUserId };

    data.audits.unshift(auditWithUser);
    if (data.audits.length > 100) data.audits = data.audits.slice(0, 100);

    data.activity.unshift({
      id: `act_${Date.now()}`,
      userId: targetUserId,
      action: 'Website Audited',
      details: `Audited ${report.url} — Overall score: ${report.overallScore}/100`,
      type: 'audit',
      timestamp: new Date().toISOString(),
    });

    saveDb(data);
    return auditWithUser;
  },

  // ==========================================
  // COMPETITOR COMPARISONS (USER ISOLATED)
  // ==========================================
  getComparisons(userId?: string): CompetitorComparison[] {
    const data = ensureDb();
    if (!userId) return data.comparisons;
    return data.comparisons.filter(c => c.userId === userId || (!c.userId && userId === 'usr_default'));
  },

  saveComparison(comp: CompetitorComparison, userId?: string): CompetitorComparison {
    const data = ensureDb();
    const targetUserId = userId || comp.userId || 'usr_default';
    const compWithUser = { ...comp, userId: targetUserId };

    data.comparisons.unshift(compWithUser);
    saveDb(data);
    return compWithUser;
  },

  // ==========================================
  // WEBSITES (STRICT USER ISOLATION)
  // ==========================================
  getWebsites(userId?: string): WebsiteProject[] {
    const data = ensureDb();
    if (!userId) return data.websites;
    return data.websites.filter(w => w.userId === userId);
  },

  getWebsiteById(id: string, userId?: string): WebsiteProject | undefined {
    const data = ensureDb();
    return data.websites.find(w => w.id === id && (!userId || w.userId === userId));
  },

  getWebsiteBySlug(slug: string): WebsiteProject | undefined {
    const data = ensureDb();
    return data.websites.find(w => w.isPublished && w.publishedSlug === slug);
  },

  saveWebsite(site: WebsiteProject, userId?: string): WebsiteProject {
    const data = ensureDb();
    const targetUserId = userId || site.userId || 'usr_default';
    const siteWithUser = { ...site, userId: targetUserId };

    const idx = data.websites.findIndex(w => w.id === site.id);
    if (idx >= 0) {
      data.websites[idx] = { ...siteWithUser, updatedAt: new Date().toISOString() };
    } else {
      data.websites.unshift({ 
        ...siteWithUser, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      });
    }
    saveDb(data);
    return siteWithUser;
  },

  deleteWebsite(id: string, userId?: string): boolean {
    const data = ensureDb();
    const initial = data.websites.length;
    data.websites = data.websites.filter(w => !(w.id === id && (!userId || w.userId === userId)));
    if (data.websites.length !== initial) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // ==========================================
  // ACTIVITY & STATS (USER ISOLATED)
  // ==========================================
  getActivity(userId?: string, limit = 20): ActivityLog[] {
    const data = ensureDb();
    if (!userId) return data.activity.slice(0, limit);
    return data.activity.filter(a => a.userId === userId).slice(0, limit);
  },

  addActivity(action: string, details: string, type: ActivityLog['type'], userId?: string): void {
    const data = ensureDb();
    const targetUserId = userId || 'usr_default';
    data.activity.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: targetUserId,
      action,
      details,
      type,
      timestamp: new Date().toISOString(),
    });
    if (data.activity.length > 200) data.activity = data.activity.slice(0, 200);
    saveDb(data);
  },

  incrementSearchCount(): void {
    const data = ensureDb();
    data.searchCount = (data.searchCount || 0) + 1;
    saveDb(data);
  },

  incrementAiOpsCount(): void {
    const data = ensureDb();
    data.aiOpsCount = (data.aiOpsCount || 0) + 1;
    saveDb(data);
  },

  getStats(userId?: string) {
    const data = ensureDb();
    const userLeads = userId ? data.leads.filter(l => l.userId === userId) : data.leads;
    const userAudits = userId ? data.audits.filter(a => a.userId === userId) : data.audits;
    const userWebsites = userId ? data.websites.filter(w => w.userId === userId) : data.websites;

    return {
      searches: data.searchCount || 0,
      savedLeads: userLeads.length,
      auditsRun: userAudits.length,
      websitesGenerated: userWebsites.length,
      publishedWebsites: userWebsites.filter(w => w.isPublished).length,
      aiOperations: data.aiOpsCount || 0,
    };
  },
};
