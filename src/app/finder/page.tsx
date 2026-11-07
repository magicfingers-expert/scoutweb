'use client';

import React, { useState } from 'react';
import {
  Search,
  Download,
  RotateCw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import PitchModal from '@/components/PitchModal';
import ContactsModal from '@/components/ContactsModal';
import { BusinessResult } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function OpportunityFinderPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [searchCms, setSearchCms] = useState('All');
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCms, setSelectedCms] = useState('All');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState({ industry: '', location: '', cms: 'All' });

  // Modals state
  const [pitchBusiness, setPitchBusiness] = useState<BusinessResult | null>(null);
  const [contactsBusiness, setContactsBusiness] = useState<BusinessResult | null>(null);

  const shortcuts = [
    { ind: 'clothing boutiques', loc: 'Austin, TX', cms: 'Shopify' },
    { ind: 'beauty salons', loc: 'Miami, FL', cms: 'Wix' },
    { ind: 'artisan bakeries', loc: 'London, UK', cms: 'WordPress' },
    { ind: 'roofing contractors', loc: 'Toronto, Canada', cms: 'No Website' },
  ];

  const handleSearch = async (overrideInd?: string, overrideLoc?: string, overrideCms?: string) => {
    const searchInd = overrideInd !== undefined ? overrideInd : industry;
    const searchLoc = overrideLoc !== undefined ? overrideLoc : location;
    const finalCms = overrideCms !== undefined ? overrideCms : searchCms;

    if (!searchInd.trim() || !searchLoc.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSelectedCategory('All');
    setSelectedCms(finalCms);
    setActiveQuery({ industry: searchInd, location: searchLoc, cms: finalCms });

    try {
      const res = await fetch('/api/businesses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: searchInd,
          location: searchLoc,
          cms: finalCms,
          onlyNoWebsite: onlyNoWebsite || finalCms === 'No Website',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (biz: BusinessResult) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: biz.id,
          name: biz.name,
          category: biz.category,
          address: biz.address,
          phone: biz.phone,
          email: biz.email,
          website: biz.website,
          cms: biz.cms || biz.cmsTag,
          googleRating: biz.rating,
          reviewCount: biz.reviewCount,
          googleMapsUrl: biz.googleMapsUrl,
          opportunityScore: biz.opportunityScore,
          opportunityTier: biz.opportunityTier,
          status: 'New',
          source: 'Opportunity Finder',
          tags: [biz.category, biz.city || 'Local'],
          notes: biz.analysisPoints,
          recommendedServices: biz.recommendedServices,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('Save lead error:', err);
      return false;
    }
  };

  const handleExportCsv = () => {
    if (results.length === 0) return;

    const headers = [
      'Name',
      'Category',
      'CMS / Platform',
      'Address',
      'Phone',
      'Email',
      'Rating',
      'Review Count',
      'Website',
      'Website Status',
      'Opportunity Score',
      'Opportunity Tier',
      'Recommended Services',
      'Google Maps URL',
    ];

    const rows = results.map((b) => [
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.category.replace(/"/g, '""')}"`,
      `"${b.cms || b.cmsTag || (b.websiteStatus === 'no_website' ? 'No Website' : 'Custom')}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.phone || ''}"`,
      `"${b.email || ''}"`,
      b.rating,
      b.reviewCount,
      `"${b.website || ''}"`,
      b.websiteStatus,
      b.opportunityScore,
      `"${b.opportunityTier}"`,
      `"${b.recommendedServices.replace(/"/g, '""')}"`,
      `"${b.googleMapsUrl}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `prospects_${activeQuery.industry}_${activeQuery.location}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Title & Description matching Screenshot 1 & 2 */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Opportunity Finder
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
          Search real businesses anywhere in the world, spot the ones with no website, and turn them into leads. Data comes live from Google Places — nothing is stored until you save a lead.
        </p>
      </div>

      {/* Search Bar Panel matching Screenshot 1 & 2 */}
      <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-6 shadow-xl space-y-4">
        {/* Input Fields Row with 3 Distinct Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Industry / business type
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. clothing boutiques, salons, bakeries"
              className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              City / location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Austin, TX or London, UK"
              className="w-full bg-[#080e1b] border border-[#1e2f4e] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* New Box: Platform / CRM type (WIX.com, Shopify.com, etc.) */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center justify-between">
              <span>Platform / CRM type</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Niche Down</span>
            </label>
            <div className="relative">
              <select
                value={searchCms}
                onChange={(e) => {
                  setSearchCms(e.target.value);
                  setSelectedCms(e.target.value);
                }}
                className="w-full bg-[#080e1b] border border-[#1e2f4e] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none transition-colors cursor-pointer"
              >
                <option value="All">All Platforms (WIX, Shopify, WP...)</option>
                <option value="Wix">WIX.com (Wix Sites &amp; Stores)</option>
                <option value="Shopify">Shopify.com (Shopify Stores)</option>
                <option value="WordPress">WordPress / WooCommerce</option>
                <option value="Squarespace">Squarespace</option>
                <option value="Webflow">Webflow</option>
                <option value="No Website">No Website (Redesign Lead)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <button
              onClick={() => handleSearch()}
              disabled={loading || !industry.trim() || !location.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-slate-950" />
                  <span>Find businesses</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters & Shortcuts Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-[#162238]">
          {/* Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyNoWebsite}
              onChange={(e) => {
                setOnlyNoWebsite(e.target.checked);
                if (hasSearched) handleSearch();
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#18263f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400 relative"></div>
            <span className="text-xs text-slate-300 font-medium">
              Only show businesses with no verified website
            </span>
          </label>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            {shortcuts.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIndustry(sc.ind);
                  setLocation(sc.loc);
                  setSearchCms(sc.cms);
                  setSelectedCms(sc.cms);
                  handleSearch(sc.ind, sc.loc, sc.cms);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#0e172a] hover:bg-[#162441] text-slate-400 hover:text-cyan-300 border border-[#1b2b48] transition-colors"
              >
                {sc.ind} · {sc.loc} ({sc.cms})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header Strip */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-200">
                {loading ? (
                  <span className="text-cyan-400">Scanning live Google Maps local businesses...</span>
                ) : (
                  <>
                    Showing <span className="text-cyan-400 font-bold">{results.length}</span> verified businesses for{' '}
                    <span className="text-white font-semibold">{activeQuery.industry}</span> in{' '}
                    <span className="text-white font-semibold">{activeQuery.location}</span>
                    {activeQuery.cms && activeQuery.cms !== 'All' && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                        Niche: {activeQuery.cms}
                      </span>
                    )}
                  </>
                )}
              </p>

              {!loading && results.length > 0 && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Google Maps Verified
                </span>
              )}
            </div>

            {results.length > 0 && !loading && (
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e172a] hover:bg-[#162544] text-slate-300 text-xs font-semibold border border-[#1e2f4e] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {/* Filter Rows Container */}
          {!loading && results.length > 0 && (
            <div className="bg-[#0c1527] border border-[#192843] rounded-2xl p-4 space-y-3.5 shadow-md">
              {/* Row 1: Sub-Niche Categories Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[90px]">
                  Sub-Niche:
                </span>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === 'All'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                      : 'bg-[#080e1b] text-slate-400 hover:text-slate-200 border border-[#18263f]'
                  }`}
                >
                  All Sub-Niches ({results.length})
                </button>
                {Array.from(new Set(results.map((r) => r.category).filter(Boolean))).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                        : 'bg-[#080e1b] text-slate-400 hover:text-slate-200 border border-[#18263f]'
                    }`}
                  >
                    {cat} ({results.filter((r) => r.category === cat).length})
                  </button>
                ))}
              </div>

              {/* Row 2: CMS & Website Builder Niche Down */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#162238]">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[90px]">
                  Platform / CMS:
                </span>
                <button
                  onClick={() => setSelectedCms('All')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedCms === 'All'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#080e1b] text-slate-400 hover:text-slate-200 border border-[#18263f]'
                  }`}
                >
                  All Platforms ({results.length})
                </button>

                {/* Shopify Pill */}
                {results.some((r) => r.cms === 'Shopify' || r.cmsTag === 'Shopify') && (
                  <button
                    onClick={() => setSelectedCms(selectedCms === 'Shopify' ? 'All' : 'Shopify')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCms === 'Shopify'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/50'
                        : 'bg-[#080e1b] text-emerald-400/80 hover:text-emerald-300 border-[#18263f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Shopify ({results.filter((r) => r.cms === 'Shopify' || r.cmsTag === 'Shopify').length})</span>
                  </button>
                )}

                {/* Wix Pill */}
                {results.some((r) => r.cms === 'Wix' || r.cmsTag === 'Wix') && (
                  <button
                    onClick={() => setSelectedCms(selectedCms === 'Wix' ? 'All' : 'Wix')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCms === 'Wix'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950/50'
                        : 'bg-[#080e1b] text-amber-400/80 hover:text-amber-300 border-[#18263f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Wix ({results.filter((r) => r.cms === 'Wix' || r.cmsTag === 'Wix').length})</span>
                  </button>
                )}

                {/* WordPress Pill */}
                {results.some((r) => r.cms === 'WordPress' || r.cmsTag === 'WordPress') && (
                  <button
                    onClick={() => setSelectedCms(selectedCms === 'WordPress' ? 'All' : 'WordPress')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCms === 'WordPress'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-950/50'
                        : 'bg-[#080e1b] text-blue-400/80 hover:text-blue-300 border-[#18263f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>WordPress ({results.filter((r) => r.cms === 'WordPress' || r.cmsTag === 'WordPress').length})</span>
                  </button>
                )}

                {/* Squarespace Pill */}
                {results.some((r) => r.cms === 'Squarespace' || r.cmsTag === 'Squarespace') && (
                  <button
                    onClick={() => setSelectedCms(selectedCms === 'Squarespace' ? 'All' : 'Squarespace')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCms === 'Squarespace'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-950/50'
                        : 'bg-[#080e1b] text-purple-400/80 hover:text-purple-300 border-[#18263f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span>Squarespace ({results.filter((r) => r.cms === 'Squarespace' || r.cmsTag === 'Squarespace').length})</span>
                  </button>
                )}

                {/* Webflow Pill */}
                {results.some((r) => r.cms === 'Webflow' || r.cmsTag === 'Webflow') && (
                  <button
                    onClick={() => setSelectedCms(selectedCms === 'Webflow' ? 'All' : 'Webflow')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCms === 'Webflow'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-950/50'
                        : 'bg-[#080e1b] text-cyan-400/80 hover:text-cyan-300 border-[#18263f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Webflow ({results.filter((r) => r.cms === 'Webflow' || r.cmsTag === 'Webflow').length})</span>
                  </button>
                )}

                {/* No Website Pill */}
                {results.some((r) => r.websiteStatus === 'no_website' || !r.website || r.cms === 'No Website') && (
                  <button
                    onClick={() => setSelectedCms(selectedCms === 'No Website' ? 'All' : 'No Website')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCms === 'No Website'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-950/50'
                        : 'bg-[#080e1b] text-rose-400/80 hover:text-rose-300 border-[#18263f]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                    <span>No Website ({results.filter((r) => r.websiteStatus === 'no_website' || !r.website || r.cms === 'No Website').length})</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">Querying live Google Maps directory...</p>
            <p className="text-xs text-slate-500 mt-1">
              Extracting real business names, street addresses, phone numbers, ratings, and website presence.
            </p>
          </div>
        ) : results.length > 0 ? (
          (() => {
            const filtered = results.filter((r) => {
              const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
              const matchesCms =
                selectedCms === 'All' ||
                (selectedCms === 'No Website'
                  ? r.websiteStatus === 'no_website' || !r.website || r.cms === 'No Website'
                  : r.cms === selectedCms || r.cmsTag === selectedCms);
              return matchesCat && matchesCms;
            });

            if (filtered.length === 0) {
              return (
                <div className="p-10 text-center bg-[#0c1527] border border-[#192843] rounded-2xl">
                  <p className="text-sm font-semibold text-slate-300">
                    No businesses found matching platform &ldquo;{selectedCms}&rdquo; under &ldquo;{selectedCategory}&rdquo;.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedCms('All');
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              );
            }

            return filtered.map((biz) => (
              <OpportunityCard
                key={biz.id}
                business={biz}
                onSaveLead={handleSaveLead}
                onGeneratePitch={(b) => setPitchBusiness(b)}
                onFindContacts={(b) => setContactsBusiness(b)}
                onRunAudit={(url) => router.push(`/audit?url=${encodeURIComponent(url)}`)}
                onDesignWebsite={(b) =>
                  router.push(
                    `/designer?name=${encodeURIComponent(b.name)}&industry=${encodeURIComponent(
                      b.category
                    )}`
                  )
                }
              />
            ));
          })()
        ) : hasSearched ? (
          <div className="p-12 text-center bg-[#0c1527] border border-[#192843] rounded-2xl">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No matching businesses found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try a broader industry or neighboring city name.
            </p>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      <PitchModal
        business={pitchBusiness}
        isOpen={Boolean(pitchBusiness)}
        onClose={() => setPitchBusiness(null)}
      />

      <ContactsModal
        business={contactsBusiness}
        isOpen={Boolean(contactsBusiness)}
        onClose={() => setContactsBusiness(null)}
        onApplyContacts={(contacts) => {
          if (!contactsBusiness) return;
          setResults((prev) =>
            prev.map((item) =>
              item.id === contactsBusiness.id
                ? {
                    ...item,
                    email: contacts.email || item.email,
                    phone: contacts.phone || item.phone,
                    onlinePresence: {
                      ...item.onlinePresence,
                      email: contacts.email
                        ? {
                            status: 'verified',
                            url: `mailto:${contacts.email}`,
                            label: contacts.email,
                          }
                        : item.onlinePresence.email,
                    },
                  }
                : item
            )
          );
        }}
      />
    </div>
  );
}

