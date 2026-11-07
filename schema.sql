-- ============================================================
-- EcomRadar AI — Production Database Schema (PostgreSQL / Supabase)
-- ============================================================

-- 1. Users and Profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'Agency Founder',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leads CRM Table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id TEXT,
    name TEXT NOT NULL,
    category TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    google_rating NUMERIC(2, 1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    google_maps_url TEXT,
    opportunity_score INTEGER DEFAULT 50,
    opportunity_tier TEXT DEFAULT 'HIGH OPPORTUNITY',
    status TEXT DEFAULT 'New',
    source TEXT DEFAULT 'Opportunity Finder',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    pitches JSONB DEFAULT '[]'::jsonb,
    recommended_services TEXT,
    follow_up_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_opp_score ON leads(opportunity_score DESC);

-- 3. Website Audits Table
CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    business_name TEXT,
    overall_score INTEGER NOT NULL,
    seo_score INTEGER NOT NULL,
    performance_score INTEGER NOT NULL,
    accessibility_score INTEGER NOT NULL,
    ux_score INTEGER NOT NULL,
    conversion_score INTEGER NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    issues JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Competitor Comparisons Table
CREATE TABLE IF NOT EXISTS competitor_comparisons (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    primary_url TEXT NOT NULL,
    competitor_urls TEXT[] NOT NULL,
    winner_url TEXT,
    reports JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Website Projects Table
CREATE TABLE IF NOT EXISTS website_projects (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT,
    target_audience TEXT,
    style TEXT DEFAULT 'modern',
    colors JSONB NOT NULL,
    pages JSONB NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_slug TEXT UNIQUE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_slug ON website_projects(published_slug);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-Level Security Policies (RLS for Multi-Tenant Data Isolation)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Leads RLS: Users can only see and manipulate their own leads
CREATE POLICY user_leads_isolation ON leads
    FOR ALL
    USING (auth.uid() = user_id);

-- Website Projects RLS
CREATE POLICY user_websites_isolation ON website_projects
    FOR ALL
    USING (auth.uid() = user_id);

