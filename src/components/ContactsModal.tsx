'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { BusinessResult } from '@/lib/types';

interface ContactsModalProps {
  business: BusinessResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyContacts?: (contacts: { email?: string; phone?: string }) => void;
}

export default function ContactsModal({
  business,
  isOpen,
  onClose,
  onApplyContacts,
}: ContactsModalProps) {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [phones, setPhones] = useState<string[]>([]);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [contactPage, setContactPage] = useState<string | undefined>();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && business) {
      setLoading(true);
      fetch('/api/businesses/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: business.name,
          website: business.website,
          phone: business.phone,
          city: business.city,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.contacts) {
            const foundEmails = data.contacts.emails || [];
            const foundPhones = data.contacts.phones || (business.phone ? [business.phone] : []);
            setEmails(foundEmails);
            setPhones(foundPhones);
            setSocials(data.contacts.socialLinks || {});
            setContactPage(data.contacts.contactPageUrl);

            if (onApplyContacts && (foundEmails[0] || foundPhones[0])) {
              onApplyContacts({
                email: foundEmails[0],
                phone: foundPhones[0],
              });
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, business]);

  if (!isOpen || !business) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1324] border border-[#1e2f4e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#18263f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Discovered Contacts & Links
              </h2>
              <p className="text-xs text-slate-400">{business.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15233c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-300 font-medium">Scanning live sources and domain records...</p>
              <p className="text-[11px] text-slate-500 mt-1">Analyzing public web pages, mailboxes, and social links.</p>
            </div>
          ) : (
            <>
              {/* Emails */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Public Email Addresses ({emails.length})
                </label>
                {emails.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-[#0e172a] p-3 rounded-xl border border-[#1b2b48]">
                    No verified public email found in header metadata. Try WhatsApp or direct phone.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {emails.map((email, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e172a] border border-[#1b2b48]"
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{email}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(email, `email_${idx}`)}
                          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          {copiedKey === `email_${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedKey === `email_${idx}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Numbers */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Phone Numbers ({phones.length})
                </label>
                {phones.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-[#0e172a] p-3 rounded-xl border border-[#1b2b48]">
                    No direct phone number listed on record.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {phones.map((phone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e172a] border border-[#1b2b48]"
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-200">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${phone.replace(/\D/g, '')}`}
                            className="text-xs text-cyan-400 hover:underline"
                          >
                            Call
                          </a>
                          <button
                            onClick={() => handleCopy(phone, `phone_${idx}`)}
                            className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 ml-2"
                          >
                            {copiedKey === `phone_${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Page */}
              {contactPage && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Contact Form Page
                  </label>
                  <a
                    href={contactPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e172a] border border-[#1b2b48] text-xs text-cyan-400 hover:underline"
                  >
                    <span className="truncate">{contactPage}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#18263f] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

