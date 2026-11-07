import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/storage';
import SiteContactForm from '@/components/SiteContactForm';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function PublishedSitePage({ params }: PageProps) {
  const { slug } = params;
  const project = db.getWebsiteBySlug(slug);

  if (!project) {
    return notFound();
  }

  const { colors, businessName, pages } = project;
  const home = pages[0];

  return (
    <div
      className="min-h-screen text-slate-100 font-sans"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      {/* Navigation Header */}
      <nav
        className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: `${colors.surface}dd` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-950 text-sm"
            style={{ backgroundColor: colors.primary }}
          >
            {businessName.charAt(0)}
          </div>
          <span className="font-bold text-base tracking-tight">{businessName}</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#about" className="hover:text-white transition-colors">About Us</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        <a
          href="#contact"
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: colors.primary }}
        >
          Book Now
        </a>
      </nav>

      {/* Main Content Sections */}
      <main className="space-y-24 py-12 px-6 max-w-6xl mx-auto">
        {home?.sections.map((sec) => {
          if (sec.type === 'hero') {
            return (
              <section key={sec.id} className="text-center py-16 space-y-6">
                {sec.content.badgeText && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: `${colors.primary}20`,
                      borderColor: `${colors.primary}40`,
                      color: colors.primary,
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sec.content.badgeText}</span>
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
                  {sec.title}
                </h1>
                <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  {sec.subtitle}
                </p>
                <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
                  <a
                    href="#contact"
                    className="px-6 py-3 rounded-xl font-bold text-sm text-slate-950 shadow-lg shadow-cyan-500/20"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {sec.content.ctaPrimaryText || 'Book Appointment'}
                  </a>
                  <a
                    href="#services"
                    className="px-6 py-3 rounded-xl font-semibold text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {sec.content.ctaSecondaryText || 'View Services'}
                  </a>
                </div>
              </section>
            );
          }

          if (sec.type === 'features') {
            return (
              <section key={sec.id} className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{sec.title}</h2>
                  <p className="text-xs text-slate-400">{sec.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sec.content.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl border border-white/10 space-y-3"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sec.type === 'services') {
            return (
              <section key={sec.id} id="services" className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{sec.title}</h2>
                  <p className="text-xs text-slate-400">{sec.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sec.content.servicesList?.map((srv: any, i: number) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl border border-white/10 flex flex-col justify-between"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base">{srv.name}</h3>
                          <span className="text-xs text-slate-400">{srv.duration}</span>
                        </div>
                        <p
                          className="text-2xl font-black my-3"
                          style={{ color: colors.primary }}
                        >
                          {srv.price}
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>
                      </div>

                      <a
                        href="#contact"
                        className="mt-6 text-center py-2.5 rounded-xl text-xs font-bold border border-white/20 hover:border-white/40 transition-colors"
                      >
                        Select Service
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sec.type === 'testimonials') {
            return (
              <section key={sec.id} id="testimonials" className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{sec.title}</h2>
                  <p className="text-xs text-slate-400">{sec.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sec.content.reviews?.map((rev: any, i: number) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl border border-white/10 space-y-3"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, s) => (
                          <Star key={s} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{rev.text}"
                      </p>
                      <p className="font-bold text-xs" style={{ color: colors.primary }}>
                        {rev.author} — <span className="text-slate-400 font-normal">{rev.role}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sec.type === 'contact') {
            return (
              <section key={sec.id} id="contact" className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{sec.title}</h2>
                  <p className="text-xs text-slate-400">{sec.subtitle}</p>
                </div>

                <div
                  className="p-8 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div className="space-y-4">
                    <h3 className="text-base font-bold">Contact & Location</h3>
                    <p className="text-xs text-slate-400">
                      Reach out directly or leave a message below. We look forward to welcoming you!
                    </p>

                    <div className="space-y-3 text-xs text-slate-300 pt-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <span>{sec.content.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span>{sec.content.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{sec.content.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>{sec.content.hours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Working interactive contact form */}
                  <SiteContactForm primaryColor={colors.primary} />
                </div>
              </section>
            );
          }

          return null;
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {businessName}. Powered by ScoutWeb AI Engine.</p>
      </footer>
    </div>
  );
}

