'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Copy,
  Star,
  ExternalLink,
  Bookmark,
  Sparkles,
  Search,
  Globe,
  Check,
  Palette,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { BusinessResult } from '@/lib/types';

interface OpportunityCardProps {
  business: BusinessResult;
  onSaveLead: (business: BusinessResult) => void;
  onGeneratePitch: (business: BusinessResult) => void;
  onFindContacts: (business: BusinessResult) => void;
  onRunAudit?: (url: string, name: string) => void;
  onDesignWebsite?: (business: BusinessResult) => void;
  isSaved?: boolean;
}

export default function OpportunityCard({
  business,
  onSaveLead,
  onGeneratePitch,
  onFindContacts,
  onRunAudit,
  onDesignWebsite,
  isSaved = false,
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveLead(business);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const p = business.onlinePresence;

  const getCmsBadge = (cms?: string) => {
    switch (cms) {
      case 'Shopify':
        return {
          label: 'Shopify Store',
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/30',
          dotColor: 'bg-emerald-400',
        };
      case 'Wix':
        return {
          label: 'Wix Site',
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/30',
          dotColor: 'bg-amber-400',
        };
      case 'WordPress':
        return {
          label: 'WordPress',
          classes: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-950/30',
          dotColor: 'bg-blue-400',
        };
      case 'Squarespace':
        return {
          label: 'Squarespace',
          classes: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
          dotColor: 'bg-purple-400',
        };
      case 'Webflow':
        return {
          label: 'Webflow',
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
          dotColor: 'bg-cyan-400',
        };
      case 'Custom':
        return {
          label: 'Custom Web Stack',
          classes: 'bg-slate-800 text-slate-300 border-slate-700',
          dotColor: 'bg-slate-400',
        };
      case 'No Website':
      default:
        return {
          label: 'No Website · Prime Lead',
          classes: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
          dotColor: 'bg-rose-400',
        };
    }
  };

  const cmsInfo = getCmsBadge(business.cms || (business.websiteStatus === 'no_website' ? 'No Website' : undefined));

  return (
    <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 transition-all duration-200 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-950/20">
      {/* 1. Header: Name & Category */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {business.name}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#16253e] text-slate-300 font-medium border border-[#223555]">
              {business.category}
            </span>

            {/* Platform / CMS Niche Badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${cmsInfo.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cmsInfo.dotColor}`}></span>
              <span>{cmsInfo.label}</span>
            </span>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{business.address}</span>
          </div>

          {/* Phone, Email, Rating & Google Maps */}
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 flex-wrap">
            {business.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{business.phone}</span>
              </div>
            )}

            {business.email && (
              <div className="flex items-center gap-1.5 bg-[#091120] px-2 py-0.5 rounded-md border border-[#1b2b48]">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a
                  href={`mailto:${business.email}`}
                  className="text-cyan-300 hover:text-cyan-200 font-mono text-[11px] hover:underline truncate max-w-[200px]"
                  title={business.email}
                >
                  {business.email}
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(business.email!);
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  title="Copy email address"
                  className="text-slate-400 hover:text-cyan-300 transition-colors ml-0.5"
                >
                  {copiedEmail ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-200">{business.rating.toFixed(1)}</span>
              <span className="text-slate-400">({business.reviewCount})</span>
            </div>
            <a
              href={business.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Opportunity Score Box */}
        <div className="bg-[#091120] border border-cyan-500/30 rounded-xl px-4 py-3 flex flex-col items-center justify-center shrink-0 min-w-[120px] shadow-inner shadow-cyan-950/40">
          <span className="text-2xl font-black text-cyan-400 tracking-tight">
            {business.opportunityScore}
          </span>
          <span className="text-[10px] font-bold text-cyan-300 tracking-wider mt-0.5">
            {business.opportunityTier}
          </span>
        </div>
      </div>

      {/* 2. Website Status Pill Banner */}
      <div className="mt-4 pt-3 border-t border-[#162238] flex items-center gap-2 flex-wrap text-xs">
        {business.websiteStatus === 'no_website' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>No website detected</span>
          </span>
        ) : business.websiteStatus === 'social_only' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>No owned website (Social profile only)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>Verified website</span>
          </span>
        )}

        <span className="text-slate-400">
          Recommended: <span className="text-slate-200 font-medium">{business.recommendedServices}</span>
        </span>
      </div>

      {/* 3. Online Presence Chips Row */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* WhatsApp */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            p.whatsapp.status === 'unverified'
              ? 'bg-[#0f283d] text-cyan-300 border-cyan-500/30'
              : p.whatsapp.status === 'verified'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-[#10192e] text-slate-500 border-[#1a2842]'
          }`}
        >
          <span className="font-semibold">WhatsApp:</span>
          <span>{p.whatsapp.status === 'unverified' ? 'Unverified — From Google phone' : p.whatsapp.status === 'verified' ? 'Found' : 'Not found'}</span>
        </div>

        {/* Instagram */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            p.instagram.status === 'verified' || p.instagram.status === 'found'
              ? 'bg-[#0f283d] text-cyan-300 border-cyan-500/30'
              : 'bg-[#10192e] text-slate-500 border-[#1a2842]'
          }`}
        >
          <span className="font-semibold">Instagram:</span>
          <span>{p.instagram.status === 'verified' ? 'Verified by Google listing' : p.instagram.status === 'found' ? 'Found profile' : 'Not found'}</span>
        </div>

        {/* Facebook */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            p.facebook.status === 'verified' || p.facebook.status === 'found'
              ? 'bg-[#0f283d] text-cyan-300 border-cyan-500/30'
              : 'bg-[#10192e] text-slate-500 border-[#1a2842]'
          }`}
        >
          <span className="font-semibold">Facebook:</span>
          <span>{p.facebook.status !== 'not_found' ? 'Found' : 'Not found'}</span>
        </div>

        {/* TikTok */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            p.tiktok.status === 'verified' || p.tiktok.status === 'found'
              ? 'bg-[#0f283d] text-cyan-300 border-cyan-500/30'
              : 'bg-[#10192e] text-slate-500 border-[#1a2842]'
          }`}
        >
          <span className="font-semibold">TikTok:</span>
          <span>{p.tiktok.status !== 'not_found' ? 'Found' : 'Not found'}</span>
        </div>

        {/* LinkedIn */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            p.linkedin.status === 'verified' || p.linkedin.status === 'found'
              ? 'bg-[#0f283d] text-cyan-300 border-cyan-500/30'
              : 'bg-[#10192e] text-slate-500 border-[#1a2842]'
          }`}
        >
          <span className="font-semibold">LinkedIn:</span>
          <span>{p.linkedin.status !== 'not_found' ? 'Found' : 'Not found'}</span>
        </div>

        {/* YouTube */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            p.youtube.status === 'verified' || p.youtube.status === 'found'
              ? 'bg-[#0f283d] text-cyan-300 border-cyan-500/30'
              : 'bg-[#10192e] text-slate-500 border-[#1a2842]'
          }`}
        >
          <span className="font-semibold">YouTube:</span>
          <span>{p.youtube.status !== 'not_found' ? 'Found' : 'Not found'}</span>
        </div>

        {/* Email Presence Chip */}
        <div
          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            business.email
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35 shadow-sm shadow-cyan-950/20'
              : 'bg-[#10192e] text-slate-400 border-[#1a2842]'
          }`}
        >
          <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="font-semibold text-slate-300">Email:</span>
          {business.email ? (
            <a
              href={`mailto:${business.email}`}
              className="text-cyan-300 hover:text-cyan-100 font-mono underline ml-0.5 truncate max-w-[190px]"
              title={business.email}
            >
              {business.email}
            </a>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Not publicly listed</span>
              {business.website && (
                <button
                  onClick={() => onFindContacts(business)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[10px] ml-1"
                  title="Deep scan website for hidden contact forms and emails"
                >
                  Deep scan
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. AI Analysis Points */}
      <div className="mt-3.5 space-y-1">
        {business.analysisPoints.map((point, idx) => (
          <p key={idx} className="text-xs text-slate-300 leading-relaxed font-sans">
            {point}
          </p>
        ))}
      </div>

      {/* 5. Bottom Actions Bar */}
      <div className="mt-5 pt-3.5 border-t border-[#162238] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Save as Lead */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              saved
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved to CRM</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save as lead'}</span>
              </>
            )}
          </button>

          {/* Generate Pitch */}
          <button
            onClick={() => onGeneratePitch(business)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate pitch</span>
          </button>

          {/* AI Website Designer shortcut */}
          <button
            onClick={() => onDesignWebsite && onDesignWebsite(business)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#132039] hover:bg-[#1a2d52] text-slate-200 border border-[#23385e] text-xs font-medium transition-all"
            title="Design a custom website for this business"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Design Website</span>
          </button>

          {/* Run Website Audit if website exists */}
          {business.website && onRunAudit && (
            <button
              onClick={() => onRunAudit(business.website!, business.name)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#132039] hover:bg-[#1a2d52] text-slate-200 border border-[#23385e] text-xs font-medium transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run Website Audit</span>
            </button>
          )}
        </div>

        {/* Find Contacts button */}
        <button
          onClick={() => onFindContacts(business)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Find Email & Contacts</span>
        </button>
      </div>
    </div>
  );
}

