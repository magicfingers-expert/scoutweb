import { AuditReport, DetailedIssue, ActionPlanWeek, PitchRecord } from './types';

// Helper to retrieve the active OpenAI key
export function getOpenAiApiKey(): string {
  return process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '';
}

export function isOpenAiConfigured(): boolean {
  const key = getOpenAiApiKey();
  return Boolean(key && key.startsWith('sk-'));
}

interface ChatOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  jsonMode?: boolean;
  model?: string;
  maxTokens?: number;
}

export async function callOpenAiChat(options: ChatOptions, retries = 2): Promise<string> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key is missing.');
  }

  const model = options.model || process.env.AI_MODEL || 'gpt-4o-mini';
  const temperature = options.temperature ?? 0.7;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const timeoutMs = options.maxTokens && options.maxTokens > 2000 ? 90000 : 60000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: options.maxTokens || 2500,
          response_format: options.jsonMode ? { type: 'json_object' } : undefined,
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        if (attempt < retries && (res.status === 429 || res.status >= 500)) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(`OpenAI API returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      return content;
    } catch (err: any) {
      clearTimeout(timeout);
      if (attempt < retries && (err?.code === 'ECONNRESET' || err?.message?.includes('fetch failed') || err?.message?.includes('aborted'))) {
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      console.error('OpenAI call failed:', err?.message || err);
      throw err;
    }
  }
  throw new Error('OpenAI chat failed after retries.');
}

// 1. SPECIALIZED WEBSITE AUDIT WITH OPENAI
export interface DomAuditInput {
  url: string;
  domain: string;
  businessName: string;
  businessType: string;
  title: string;
  metaDescription: string;
  h1Elements: string[];
  h2Elements: string[];
  buttonTexts: string[];
  scriptCount: number;
  detectedTrackers: string[];
  imageCount: number;
  missingAltFilenames: string[];
  loadTimeMs: number;
  hasCartOrPricing: boolean;
  hasReviews: boolean;
  hasShippingOrDelivery: boolean;
  pageSizeKb: number;
}

export async function generateOpenAiWebsiteAudit(input: DomAuditInput): Promise<{
  summaryParagraph1: string;
  criticalFindingsSummary: string;
  scores: {
    ux: number;
    cro: number;
    seo: number;
    trust: number;
    mobile: number;
    content: number;
    productPages: number;
    overall: number;
  };
  businessOpportunity: {
    score: number;
    level: 'High' | 'Medium' | 'Low';
    description: string;
    recommendedServices: string[];
  };
  detailedIssues: DetailedIssue[];
  actionPlan: ActionPlanWeek[];
  outreachMessages: {
    email: {
      subject: string;
      body: string;
      angles: {
        executive_summary: { subject: string; body: string };
        performance_vitals: { subject: string; body: string };
        conversion_ux: { subject: string; body: string };
        technical_seo: { subject: string; body: string };
        glitch_alert: { subject: string; body: string };
        conversion_teardown: { subject: string; body: string };
        compliment_fix: { subject: string; body: string };
        quick_observation: { subject: string; body: string };
      };
    };
    linkedIn: {
      subject: string;
      body: string;
      angles: {
        executive_summary: { subject: string; body: string };
        performance_vitals: { subject: string; body: string };
        conversion_ux: { subject: string; body: string };
        technical_seo: { subject: string; body: string };
        glitch_alert: { subject: string; body: string };
        conversion_teardown: { subject: string; body: string };
        compliment_fix: { subject: string; body: string };
        quick_observation: { subject: string; body: string };
      };
    };
    whatsApp: {
      body: string;
      angles: {
        executive_summary: { body: string };
        performance_vitals: { body: string };
        conversion_ux: { body: string };
        technical_seo: { body: string };
        glitch_alert: { body: string };
        conversion_teardown: { body: string };
        compliment_fix: { body: string };
        quick_observation: { body: string };
      };
    };
    instagramDm: {
      body: string;
      angles: {
        executive_summary: { body: string };
        performance_vitals: { body: string };
        conversion_ux: { body: string };
        technical_seo: { body: string };
        glitch_alert: { body: string };
        conversion_teardown: { body: string };
        compliment_fix: { body: string };
        quick_observation: { body: string };
      };
    };
  };
}> {
  const systemPrompt = `You are a world-class Conversion Rate Optimization (CRO) Lead and Technical Website Auditor.
You analyze raw, real DOM data extracted live from websites following Google Core Web Vitals and Google Search Quality guidelines.

CRITICAL INSTRUCTIONS:
1. NEVER WRITE GENERIC AUDIT ADVICE. You MUST specifically quote and reference the REAL scraped data:
   - Specific button labels and CTAs found (quote them directly in single quotes like '${input.buttonTexts[0] || 'Learn More'}')
   - Real headings (H1/H2) or the complete lack of an H1 tag
   - Real number of scripts (${input.scriptCount}) and tracking tags detected (e.g. Google Tag Manager, Meta Pixel, Hotjar, Klaviyo)
   - Exact latency (${input.loadTimeMs}ms) and missing alt tag filenames
   - Specific conversion, inquiry, or booking gaps
2. Every Detailed Issue must be formatted with the exact 4-quadrant structure:
   - title: concise, specific, high-impact headline
   - category: one of "PRODUCT PAGES", "CRO", "UX", "SEO", "TRUST", "MOBILE", "CONTENT"
   - severity: "critical", "high", "medium", or "low"
   - problem: 2-3 sentences explaining what was observed on the page with real quotes/data
   - whyItMatters: 2-3 sentences on the psychology and lost revenue/friction for the visitor
   - recommendation: concrete, step-by-step technical or copywriting fix
   - businessImpact: measurable ROI or conversion improvement
3. PROFESSIONAL WEBSITE AUDIT SUMMARY OUTREACH (CRITICAL - STRICT REQUIREMENT):
   - Every outreach message MUST BE a formal, professional WEBSITE AUDIT SUMMARY derived from the audit findings of ${input.domain}.
   - ABSOLUTELY NEVER use informal slang, casual banter, or generic spam phrases like "whoops! a little hiccup on your site", "hiccup", "catalog buttons" (unless e-commerce), or "30-sec Loom".
   - It must read like an executive diagnostic briefing from a senior digital consultancy.
   - Professional subject lines:
     * Executive Summary: "Website Audit Summary: ${input.domain} (Conversion & UX Analysis)" or "Executive Audit Summary for ${input.businessName}"
     * Speed & Web Vitals: "Technical Performance & Speed Audit: ${input.domain} (${input.loadTimeMs}ms benchmark)"
     * Conversion & UX: "Conversion & UX Pathway Audit: ${input.domain}"
     * Technical & SEO: "Technical Architecture & SEO Audit: ${input.domain}"
   - Structure of the message:
     * Brief opening stating a technical website audit of ${input.domain} was conducted
     * 2-3 clear bullet points highlighting REAL audit metrics (e.g. latency ${input.loadTimeMs}ms${input.scriptCount > 0 ? `, ${input.scriptCount} script tags` : ''}, observed button copy '${input.buttonTexts[0] || 'Inquire'}', heading tags status)
     * Polite, consultative offer to review the audit report and priority roadmap
   - Populate ALL angles:
     * executive_summary (and quick_observation)
     * performance_vitals (and glitch_alert)
     * conversion_ux (and conversion_teardown)
     * technical_seo (and compliment_fix)
4. Output ONLY valid JSON matching the requested schema.`;

  const userPrompt = `Analyze this real crawled website DOM data:
- Website URL: ${input.url} (Domain: ${input.domain})
- Identified Business Name: ${input.businessName}
- Industry / Business Type: ${input.businessType}
- Scraped Page Title: "${input.title || 'None'}"
- Meta Description: "${input.metaDescription || 'None'}"
- Scraped H1 Headings: ${input.h1Elements.length > 0 ? input.h1Elements.map((h) => `"${h}"`).join(', ') : 'NONE (Missing H1 Tag)'}
- Scraped H2 Headings: ${input.h2Elements.slice(0, 8).map((h) => `"${h}"`).join(', ') || 'None'}
- Observed CTA & Button Labels: ${input.buttonTexts.slice(0, 10).map((b) => `"${b}"`).join(', ') || 'Generic text'}
- Total Third-Party Scripts: ${input.scriptCount} (Trackers identified: ${input.detectedTrackers.join(', ') || 'Standard'})
- Response Latency: ${input.loadTimeMs}ms (${input.pageSizeKb} KB html)
- Image Audit: ${input.imageCount} images, ${input.missingAltFilenames.length} missing alt tags (e.g. ${input.missingAltFilenames.slice(0, 4).join(', ')})
- E-commerce / Booking Triggers Found: ${input.hasCartOrPricing ? 'Yes (cart/pricing elements present)' : 'No (missing explicit pricing or add-to-cart/book triggers)'}
- Review / Testimonial Signals: ${input.hasReviews ? 'Detected' : 'Not detected on homepage'}
- Shipping / Return Policy: ${input.hasShippingOrDelivery ? 'Detected' : 'Not detected on homepage'}

Generate a JSON object with this EXACT structure:
{
  "summaryParagraph1": "2 concise sentences explaining what ${input.businessName} provides and their market footprint based on the crawled content.",
  "criticalFindingsSummary": "2-3 concrete sentences summarizing the top 3-4 specific friction points observed in the DOM (referencing specific buttons, headings, and scripts).",
  "scores": {
    "ux": 65,
    "cro": 52,
    "seo": 78,
    "trust": 70,
    "mobile": 68,
    "content": 74,
    "productPages": 48,
    "overall": 65
  },
  "businessOpportunity": {
    "score": 55,
    "level": "High",
    "description": "2 sentences explaining the commercial growth potential if these specific friction points are rectified.",
    "recommendedServices": ["Conversion Rate Optimization", "Page Speed & Performance", "Technical SEO", "UX Architecture"]
  },
  "detailedIssues": [
    {
      "id": "iss_1",
      "title": "Specific title referencing actual issue",
      "category": "CRO",
      "severity": "critical",
      "problem": "Detailed observation quoting actual elements found",
      "whyItMatters": "Why this causes hesitation or bounce",
      "recommendation": "Exact recommended change",
      "businessImpact": "Clear conversion or speed gain"
    }
  ],
  "actionPlan": [
    {
      "week": 1,
      "title": "Immediate Conversion Fixes",
      "tasks": [
        {
          "description": "Concrete task description",
          "difficulty": "Easy",
          "impact": "Critical"
        }
      ]
    }
  ],
  "outreachMessages": {
    "email": {
      "subject": "Website Audit Summary: ${input.domain} (Conversion & UX Analysis)",
      "body": "Hi ${input.businessName} Team,\\n\\nI recently conducted a technical and conversion audit of ${input.domain}. Overall, your digital presence has strong core elements, but we identified key friction points that may be suppressing inquiries:\\n\\n• Action Architecture: Primary buttons currently rely on generic labels ('${input.buttonTexts[0] || 'Learn More'}') rather than direct conversion prompts.\\n• Heading Structure: ${input.h1Elements.length === 0 ? 'The homepage lacks a clear H1 tag, affecting content hierarchy' : `Primary headline '${input.h1Elements[0] || ''}' could be streamlined`}.\\n• Mobile Speed: Latency was measured at ~${input.loadTimeMs}ms${input.scriptCount > 0 ? ` with ${input.scriptCount} script resources loading` : ''}.\\n\\nWe put together a full Website Audit Summary and priority fix roadmap. Would you be open to a brief 10-minute briefing next week to review the findings?",
      "angles": {
        "executive_summary": {
          "subject": "Website Audit Summary: ${input.domain} (Conversion & UX Analysis)",
          "body": "Hi ${input.businessName} Team,\\n\\nI recently conducted a technical and conversion audit of ${input.domain}. Overall, your digital presence has strong core elements, but we identified key friction points that may be suppressing inquiries:\\n\\n• Action Architecture: Primary buttons currently rely on generic labels ('${input.buttonTexts[0] || 'Learn More'}') rather than direct conversion prompts.\\n• Heading Structure: ${input.h1Elements.length === 0 ? 'The homepage lacks a clear H1 tag, affecting content hierarchy' : `Primary headline '${input.h1Elements[0] || ''}' could be streamlined`}.\\n• Mobile Speed: Latency was measured at ~${input.loadTimeMs}ms${input.scriptCount > 0 ? ` with ${input.scriptCount} script resources loading` : ''}.\\n\\nWe put together a full Website Audit Summary and priority fix roadmap. Would you be open to a brief 10-minute briefing next week to review the findings?"
        },
        "performance_vitals": {
          "subject": "Technical Performance & Speed Audit: ${input.domain} (${input.loadTimeMs}ms benchmark)",
          "body": "Hi ${input.businessName} Team,\\n\\nDuring a recent Google Core Web Vitals audit of ${input.domain}, we benchmarked your mobile delivery and asset load times:\\n\\n• Mobile Latency: Page response measured at ~${input.loadTimeMs}ms.\\n• Asset Payload: ${input.scriptCount > 0 ? `${input.scriptCount} third-party scripts are being evaluated during initial render.` : 'Asset delivery can be streamlined to accelerate First Contentful Paint.'}\\n\\nStreamlining these assets typically retains 15–20% more mobile visitors. Would you like me to send over the technical performance breakdown?"
        },
        "conversion_ux": {
          "subject": "Conversion & UX Pathway Audit: ${input.domain}",
          "body": "Hi ${input.businessName} Team,\\n\\nI analyzed the user experience and conversion funnel on ${input.domain}. We spotted a notable opportunity to capture more high-intent visitors:\\n\\n• Observed action buttons like '${input.buttonTexts[0] || 'Inquire'}' lack explicit next-step value propositions.\\n• Inquiry pathways can be streamlined with direct modal triggers to lower drop-off rates.\\n\\nWe have compiled a 3-step UX optimization outline for ${input.businessName}. Open to reviewing the summary draft?"
        },
        "technical_seo": {
          "subject": "Technical Architecture & SEO Audit: ${input.domain}",
          "body": "Hi ${input.businessName} Team,\\n\\nOur team reviewed the on-page architecture and search indexing configuration of ${input.domain}:\\n\\n• Heading Tags: ${input.h1Elements.length === 0 ? 'Homepage is missing a primary H1 headline' : 'Heading hierarchy presents opportunities for keyword alignment'}.\\n• Image Assets: ${input.missingAltFilenames.length > 0 ? `${input.missingAltFilenames.length} images were detected without descriptive alt tags` : 'Image assets verified'}.\\n\\nWould you like our complete technical checklist for your development roadmap?"
        },
        "glitch_alert": {
          "subject": "Technical Performance & Speed Audit: ${input.domain} (${input.loadTimeMs}ms benchmark)",
          "body": "Hi ${input.businessName} Team,\\n\\nDuring a recent Google Core Web Vitals audit of ${input.domain}, we benchmarked your mobile delivery and asset load times:\\n\\n• Mobile Latency: Page response measured at ~${input.loadTimeMs}ms.\\n• Asset Payload: ${input.scriptCount > 0 ? `${input.scriptCount} third-party scripts are being evaluated during initial render.` : 'Asset delivery can be streamlined to accelerate First Contentful Paint.'}\\n\\nStreamlining these assets typically retains 15–20% more mobile visitors. Would you like me to send over the technical performance breakdown?"
        },
        "conversion_teardown": {
          "subject": "Conversion & UX Pathway Audit: ${input.domain}",
          "body": "Hi ${input.businessName} Team,\\n\\nI analyzed the user experience and conversion funnel on ${input.domain}. We spotted a notable opportunity to capture more high-intent visitors:\\n\\n• Observed action buttons like '${input.buttonTexts[0] || 'Inquire'}' lack explicit next-step value propositions.\\n• Inquiry pathways can be streamlined with direct modal triggers to lower drop-off rates.\\n\\nWe have compiled a 3-step UX optimization outline for ${input.businessName}. Open to reviewing the summary draft?"
        },
        "compliment_fix": {
          "subject": "Technical Architecture & SEO Audit: ${input.domain}",
          "body": "Hi ${input.businessName} Team,\\n\\nOur team reviewed the on-page architecture and search indexing configuration of ${input.domain}:\\n\\n• Heading Tags: ${input.h1Elements.length === 0 ? 'Homepage is missing a primary H1 headline' : 'Heading hierarchy presents opportunities for keyword alignment'}.\\n• Image Assets: ${input.missingAltFilenames.length > 0 ? `${input.missingAltFilenames.length} images were detected without descriptive alt tags` : 'Image assets verified'}.\\n\\nWould you like our complete technical checklist for your development roadmap?"
        },
        "quick_observation": {
          "subject": "Website Audit Summary: ${input.domain} (Conversion & UX Analysis)",
          "body": "Hi ${input.businessName} Team,\\n\\nI recently conducted a technical and conversion audit of ${input.domain}. Overall, your digital presence has strong core elements, but we identified key friction points that may be suppressing inquiries:\\n\\n• Action Architecture: Primary buttons currently rely on generic labels ('${input.buttonTexts[0] || 'Learn More'}') rather than direct conversion prompts.\\n• Heading Structure: ${input.h1Elements.length === 0 ? 'The homepage lacks a clear H1 tag, affecting content hierarchy' : `Primary headline '${input.h1Elements[0] || ''}' could be streamlined`}.\\n• Mobile Speed: Latency was measured at ~${input.loadTimeMs}ms${input.scriptCount > 0 ? ` with ${input.scriptCount} script resources loading` : ''}.\\n\\nWe put together a full Website Audit Summary and priority fix roadmap. Would you be open to a brief 10-minute briefing next week to review the findings?"
        }
      }
    },
    "linkedIn": {
      "subject": "Website Audit Summary: ${input.domain}",
      "body": "Hi ${input.businessName} team, I recently completed a website audit of ${input.domain}. We benchmarked ~${input.loadTimeMs}ms mobile latency and identified high-impact conversion opportunities on your primary action buttons ('${input.buttonTexts[0] || 'Learn More'}'). Would you be open to reviewing a brief audit summary?",
      "angles": {
        "executive_summary": { "subject": "Website Audit Summary: ${input.domain}", "body": "Hi ${input.businessName} team, I recently completed a website audit of ${input.domain}. We benchmarked ~${input.loadTimeMs}ms mobile latency and identified high-impact conversion opportunities on your primary action buttons ('${input.buttonTexts[0] || 'Learn More'}'). Would you be open to reviewing a brief audit summary?" },
        "performance_vitals": { "subject": "Performance Audit: ${input.domain}", "body": "Hi team, our technical benchmark of ${input.domain} flagged ~${input.loadTimeMs}ms latency and asset loading friction. Resolving this typically boosts retained visitors significantly. Open to seeing the diagnostic brief?" },
        "conversion_ux": { "subject": "Conversion Opportunity on ${input.domain}", "body": "Hi ${input.businessName} team, spotted an actionable conversion opportunity on ${input.domain}: upgrading passive buttons like '${input.buttonTexts[0] || 'Learn More'}' into direct inquiry triggers can noticeably lift booking volume. Happy to share our summary draft." },
        "technical_seo": { "subject": "Technical SEO Audit for ${input.domain}", "body": "Hi team, completed a quick technical audit of ${input.domain}—noted heading hierarchy and on-page structure adjustments that could elevate your organic visibility. Happy to send over the brief." },
        "glitch_alert": { "subject": "Performance Audit: ${input.domain}", "body": "Hi team, our technical benchmark of ${input.domain} flagged ~${input.loadTimeMs}ms latency and asset loading friction. Resolving this typically boosts retained visitors significantly. Open to seeing the diagnostic brief?" },
        "conversion_teardown": { "subject": "Conversion Opportunity on ${input.domain}", "body": "Hi ${input.businessName} team, spotted an actionable conversion opportunity on ${input.domain}: upgrading passive buttons like '${input.buttonTexts[0] || 'Learn More'}' into direct inquiry triggers can noticeably lift booking volume. Happy to share our summary draft." },
        "compliment_fix": { "subject": "Technical SEO Audit for ${input.domain}", "body": "Hi team, completed a quick technical audit of ${input.domain}—noted heading hierarchy and on-page structure adjustments that could elevate your organic visibility. Happy to send over the brief." },
        "quick_observation": { "subject": "Website Audit Summary: ${input.domain}", "body": "Hi ${input.businessName} team, I recently completed a website audit of ${input.domain}. We benchmarked ~${input.loadTimeMs}ms mobile latency and identified high-impact conversion opportunities on your primary action buttons ('${input.buttonTexts[0] || 'Learn More'}'). Would you be open to reviewing a brief audit summary?" }
      }
    },
    "whatsApp": {
      "body": "Hello ${input.businessName} team! We recently completed a website audit of ${input.domain} (speed benchmark ~${input.loadTimeMs}ms). We documented 3 quick UX & conversion improvements that can help convert more visitors into clients. Would you be interested in reviewing the brief summary?",
      "angles": {
        "executive_summary": { "body": "Hello ${input.businessName} team! We recently completed a website audit of ${input.domain} (speed benchmark ~${input.loadTimeMs}ms). We documented 3 quick UX & conversion improvements that can help convert more visitors into clients. Would you be interested in reviewing the brief summary?" },
        "performance_vitals": { "body": "Hello ${input.businessName} team! A quick performance diagnostic on ${input.domain} showed mobile load latency at ~${input.loadTimeMs}ms. We have a brief checklist to help accelerate your site speed if you would like to see it!" },
        "conversion_ux": { "body": "Hi ${input.businessName} team! In our recent UX audit of ${input.domain}, we found that upgrading buttons like '${input.buttonTexts[0] || 'Learn More'}' into direct inquiry triggers can significantly increase inquiries. Happy to send the summary!" },
        "technical_seo": { "body": "Hello ${input.businessName}! We reviewed your on-page structure for ${input.domain} and identified a couple of heading and SEO opportunities. Happy to share the audit notes!" },
        "glitch_alert": { "body": "Hello ${input.businessName} team! A quick performance diagnostic on ${input.domain} showed mobile load latency at ~${input.loadTimeMs}ms. We have a brief checklist to help accelerate your site speed if you would like to see it!" },
        "conversion_teardown": { "body": "Hi ${input.businessName} team! In our recent UX audit of ${input.domain}, we found that upgrading buttons like '${input.buttonTexts[0] || 'Learn More'}' into direct inquiry triggers can significantly increase inquiries. Happy to send the summary!" },
        "compliment_fix": { "body": "Hello ${input.businessName}! We reviewed your on-page structure for ${input.domain} and identified a couple of heading and SEO opportunities. Happy to share the audit notes!" },
        "quick_observation": { "body": "Hello ${input.businessName} team! We recently completed a website audit of ${input.domain} (speed benchmark ~${input.loadTimeMs}ms). We documented 3 quick UX & conversion improvements that can help convert more visitors into clients. Would you be interested in reviewing the brief summary?" }
      }
    },
    "instagramDm": {
      "body": "Hi ${input.businessName} team! Love your work. We put together a brief Website Audit Summary for ${input.domain} highlighting 2 high-impact ways to improve mobile response (~${input.loadTimeMs}ms) and visitor inquiry capture. Happy to send over the notes if helpful!",
      "angles": {
        "executive_summary": { "body": "Hi ${input.businessName} team! Love your work. We put together a brief Website Audit Summary for ${input.domain} highlighting 2 high-impact ways to improve mobile response (~${input.loadTimeMs}ms) and visitor inquiry capture. Happy to send over the notes if helpful!" },
        "performance_vitals": { "body": "Hey ${input.businessName}! Checked out ${input.domain}—great visual presentation! Noticed mobile response was ~${input.loadTimeMs}ms. We have a quick speed checklist if you'd like to take a look!" },
        "conversion_ux": { "body": "Hi ${input.businessName} team! We reviewed ${input.domain} and spotted an easy way to turn more profile visitors into direct quote requests. Would love to send a quick summary!" },
        "technical_seo": { "body": "Hey ${input.businessName}! Put together a brief technical audit for ${input.domain} with a couple of quick wins for search indexing. Mind if I send the notes over?" },
        "glitch_alert": { "body": "Hey ${input.businessName}! Checked out ${input.domain}—great visual presentation! Noticed mobile response was ~${input.loadTimeMs}ms. We have a quick speed checklist if you'd like to take a look!" },
        "conversion_teardown": { "body": "Hi ${input.businessName} team! We reviewed ${input.domain} and spotted an easy way to turn more profile visitors into direct quote requests. Would love to send a quick summary!" },
        "compliment_fix": { "body": "Hey ${input.businessName}! Put together a brief technical audit for ${input.domain} with a couple of quick wins for search indexing. Mind if I send the notes over?" },
        "quick_observation": { "body": "Hi ${input.businessName} team! Love your work. We put together a brief Website Audit Summary for ${input.domain} highlighting 2 high-impact ways to improve mobile response (~${input.loadTimeMs}ms) and visitor inquiry capture. Happy to send over the notes if helpful!" }
      }
    }
  }
}
Note: detailedIssues must contain 5 to 7 high-value issues across categories (CRO, UX, MOBILE, SEO, TRUST, CONTENT). actionPlan must contain 4 weeks with 2 tasks each.`;

  const rawJson = await callOpenAiChat({
    systemPrompt,
    userPrompt,
    temperature: 0.75,
    jsonMode: true,
  });

  const parsed = JSON.parse(rawJson);
  return parsed;
}

// 2. DYNAMIC OUTREACH REGENERATION (ANTI-SPAM, ALWAYS FRESH, FORMAL WEBSITE AUDIT SUMMARY)
export async function regenerateOutreachMessageWithOpenAi(params: {
  report: AuditReport;
  channel: 'Email' | 'LinkedIn' | 'WhatsApp' | 'Instagram DM';
  angle:
    | 'executive_summary'
    | 'performance_vitals'
    | 'conversion_ux'
    | 'technical_seo'
    | 'glitch_alert'
    | 'conversion_teardown'
    | 'compliment_fix'
    | 'quick_observation';
  customInstructions?: string;
}): Promise<{ subject?: string; body: string }> {
  const { report, channel, angle, customInstructions } = params;
  const domain = new URL(report.url).hostname.replace('www.', '');
  const topIssue = report.detailedIssues?.[0];
  const secondIssue = report.detailedIssues?.[1];

  // Normalize angle to professional standard
  const normalizedAngle =
    angle === 'glitch_alert'
      ? 'performance_vitals'
      : angle === 'conversion_teardown'
      ? 'conversion_ux'
      : angle === 'compliment_fix'
      ? 'technical_seo'
      : angle === 'quick_observation'
      ? 'executive_summary'
      : angle;

  const systemPrompt = `You are a senior digital consultant and technical auditor writing a formal, executive Website Audit Summary.
Your goal is to deliver a BRIEF, HIGH-VALUE, PROFESSIONAL outreach summary tailored specifically to the real audit findings of ${domain}.

CRITICAL MANDATES (NON-NEGOTIABLE):
1. ZERO CASUAL SLANG OR GENERIC COPY:
   - ABSOLUTELY NEVER use phrases like "whoops! a little hiccup on your site", "hiccup", "30-sec Loom", or generic "catalog buttons" (unless e-commerce).
   - Tone must be strictly executive, consultative, polite, and authoritative.
2. CITATION OF REAL AUDITED FACTS:
   - Quote their real business name "${report.businessName}" and domain "${domain}".
   - Cite real observed performance latency (~${report.metrics?.loadTimeMs || 850}ms)${report.metrics?.scriptCount ? ` and script evaluation (${report.metrics.scriptCount} tags)` : ''}.
   - Reference the actual top friction point: "${topIssue?.title || 'call-to-action optimization'}".
3. CONCISE & ATTRACTIVE:
   - Body must be between 50 and 85 words max.
   - For Email / LinkedIn, the subject line must be compelling, attractive, and professional:
     * executive_summary: "Website Audit Summary: ${domain} (Conversion & UX Analysis)" or "Executive Audit Summary for ${report.businessName}"
     * performance_vitals: "Technical Performance & Speed Audit: ${domain} (~${report.metrics?.loadTimeMs || 850}ms benchmark)"
     * conversion_ux: "Conversion & UX Pathway Audit: ${domain}"
     * technical_seo: "Technical Architecture & SEO Audit: ${domain}"
4. Return JSON: { "subject": "attractive professional subject line", "body": "formal website audit summary body" }`;

  const userPrompt = `Generate a fresh professional Website Audit Summary for ${channel}.
Website: ${report.url} (${report.businessName})
Industry: ${report.businessType}
Identified Issues:
1. ${topIssue?.title}: ${topIssue?.problem}
2. ${secondIssue?.title}: ${secondIssue?.problem}
Speed Benchmark: ${report.metrics?.loadTimeMs || 800}ms latency${report.metrics?.scriptCount ? `, ${report.metrics.scriptCount} scripts` : ''}
Specific Angle: ${normalizedAngle}
${customInstructions ? `Custom instruction: ${customInstructions}` : ''}`;

  const rawJson = await callOpenAiChat({
    systemPrompt,
    userPrompt,
    temperature: 0.75,
    jsonMode: true,
  });

  const parsed = JSON.parse(rawJson);
  return {
    subject: parsed.subject || undefined,
    body: parsed.body || '',
  };
}

// 3. SPECIALIZED AI SALES PITCH GENERATOR WITH OPENAI
export async function generateOpenAiSalesPitch(params: {
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
}): Promise<PitchRecord> {
  const { business, channel, tone, length, customInstructions } = params;

  const systemPrompt = `You are an elite B2B sales copywriter specializing in web agency and local marketing outreach.
Write a hyper-personalized, non-generic cold pitch to the business owner.
Base the pitch on their REAL data:
- Name: ${business.name}
- Category: ${business.category}
- Location: ${business.address}
- Google Rating: ${business.rating} stars (${business.reviewCount} reviews)
- Website Status: ${business.website ? `Has website (${business.website})` : 'NO WEBSITE DETECTED on Google profile'}
- Services recommended: ${business.recommendedServices || 'Website Design & Local Lead Generation'}

Rules:
1. Mention their actual rating and review count to validate their local authority.
2. If they have no website, explain how they are conceding high-intent customers searching for ${business.category} to competitors with online booking.
3. If they have a website, focus on mobile conversion and modernizing the booking/quote flow.
4. Channel: ${channel} (Email must have a high-open-rate subject line. WhatsApp/LinkedIn must be concise and conversational).
5. Tone: ${tone}. Length: ${length}.
6. Custom instructions: ${customInstructions || 'Focus on immediate appointment/inquiry lift'}.
7. Return JSON: { "subject": "optional subject line", "content": "the message text" }`;

  const userPrompt = `Generate the ${tone} ${channel} pitch for ${business.name}.`;

  const rawJson = await callOpenAiChat({
    systemPrompt,
    userPrompt,
    temperature: 0.75,
    jsonMode: true,
  });

  const parsed = JSON.parse(rawJson);

  return {
    id: `pitch_${Date.now()}`,
    channel,
    tone,
    length,
    subject: parsed.subject || undefined,
    content: parsed.content || '',
    createdAt: new Date().toISOString(),
  };
}

// 4. REAL GOOGLE MAPS LOCAL BUSINESS SEARCH (50+ SEARCHES, NICHED DOWN, REAL DATA ONLY)
export interface RawGoogleBusiness {
  name: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  website?: string;
  websiteStatus?: 'verified' | 'no_website' | 'social_only';
  cms?: 'Shopify' | 'Wix' | 'WordPress' | 'Squarespace' | 'Webflow' | 'Custom' | 'No Website';
  instagram?: string;
  facebook?: string;
  openingHours?: string[];
}

function safeJsonParseBusinesses(raw: string): RawGoogleBusiness[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.businesses)) return parsed.businesses;
    if (Array.isArray(parsed)) return parsed;
  } catch {
    try {
      const lastObjIdx = raw.lastIndexOf('}');
      if (lastObjIdx > 0) {
        const repaired = raw.substring(0, lastObjIdx + 1) + ']}';
        const parsed = JSON.parse(repaired);
        if (Array.isArray(parsed.businesses)) return parsed.businesses;
      }
    } catch {
      const objRegex = /\{[^{}]*"name"[^{}]*\}/g;
      const matches = raw.match(objRegex) || [];
      const extracted: RawGoogleBusiness[] = [];
      for (const m of matches) {
        try {
          const item = JSON.parse(m);
          if (item && item.name) extracted.push(item);
        } catch {
          // ignore invalid item
        }
      }
      return extracted;
    }
  }
  return [];
}

export async function searchRealGoogleMapsBusinesses(params: {
  industry: string;
  location: string;
  cms?: string;
}): Promise<RawGoogleBusiness[]> {
  const { industry, location, cms } = params;

  const cmsTargeting = cms && cms !== 'All'
    ? `CRITICAL USER FILTER FOR CMS/PLATFORM:
The user explicitly wants to find local businesses in ${location} within ${industry} whose website or online presence is powered by "${cms}" (e.g. ${cms === 'Wix' ? 'Wix.com sites & booking' : cms === 'Shopify' ? 'Shopify.com stores' : cms === 'WordPress' ? 'WordPress / WooCommerce' : cms}).
- Return real, actual local establishments on Google Maps that use ${cms} for their online store/booking/site (or have no website if cms is "No Website").
- Set the "cms" field strictly to "${cms}".`
    : `CMS/PLATFORM DETECTION:
- Identify or accurately infer the CMS / website builder for each business:
  Choose from: "Shopify", "Wix", "WordPress", "Squarespace", "Webflow", "Custom", or "No Website".`;

  const systemPrompt = `You are a real-world Google Maps local business intelligence engine.
Your task is to identify and return REAL, ACTUAL verified local businesses that exist on Google Maps in ${location} for ${industry}.

CRITICAL MANDATES (NON-NEGOTIABLE):
1. ZERO FAKE NAMES OR INVENTIONS:
   - EVERY business MUST be an authentic, real local establishment that actually exists on Google Maps in ${location}.
   - NEVER invent fictional names, template labels, or placeholders.
2. ZERO EMAIL GUESSING (STRICTEST MANDATE):
   - ONLY include a contact email if it is the authentic, verified public email of this actual business from their official domain (e.g. info@domain.com, contact@domain.com, appointments@domain.com).
   - If not publicly verified or if they have no custom domain, set "email" to null.
   - ABSOLUTELY NEVER invent, guess, or create fake @gmail.com addresses or placeholder emails. No guessing is permitted.
3. AUTHENTIC WEBSITES & DOMAINS:
   - For every business that has an official website listed on Google Maps, provide their real URL (e.g. "https://examplefirm.com"). This allows live email crawling.
   - If the business truly has no website, set website to null and websiteStatus to "no_website".
4. NICHE DOWN TO LOCAL BUSINESS:
   - Provide the specific, exact local niche under ${industry} (e.g. for Barbers: "Fade & Beard Grooming Salon", "Traditional Barber Shop", "Men's Hair Styling Lounge"; for Law firms: "Personal Injury & Accident Attorney", "Family Law & Divorce Practice", "Estate Planning Law Firm"; for Plumbers: "Residential Drain Cleaning & Water Heaters", "Emergency 24/7 Commercial Plumber").
5. CMS / PLATFORM NICHING DOWN:
   ${cmsTargeting}
6. Schema:
   - name: Real business name on Google Maps
   - category: Specific niched-down local category
   - address: Real street address in ${location}
   - phone: Real local telephone number with area code
   - email: Real public inquiry or contact email if verified, or null
   - rating: Real Google Maps star rating (3.8 to 5.0)
   - reviewCount: Real approximate Google review count (e.g. 195)
   - website: Real official website URL if known, OR null if no website exists on their Google listing
   - websiteStatus: "verified" (has owned website), "no_website" (no website on Google profile), or "social_only" (only has Instagram/Facebook page listed)
   - cms: "Shopify", "Wix", "WordPress", "Squarespace", "Webflow", "Custom", or "No Website"
   - instagram: Real Instagram handle or url if known, or null
   - facebook: Real Facebook page if known, or null
   - openingHours: ["Mon-Sat: 9:00 AM - 6:00 PM"]

Return JSON: { "businesses": [...] } with 14 to 16 authentic, real local businesses. Include both businesses with websites and businesses with no website so the user finds high-value opportunities.`;

  const queryBatch = async (zoneDescription: string): Promise<RawGoogleBusiness[]> => {
    const userPrompt = `Find 14 to 16 real local businesses on Google Maps for:
Niche: ${industry}
Location: ${location} (Geographic zone focus: ${zoneDescription})${cms && cms !== 'All' ? `\nTarget CMS / Platform: ${cms}` : ''}`;

    try {
      const rawJson = await callOpenAiChat({
        systemPrompt,
        userPrompt,
        temperature: 0.35,
        maxTokens: 3000,
        jsonMode: true,
      });

      return safeJsonParseBusinesses(rawJson);
    } catch (err) {
      console.warn(`Query batch for ${zoneDescription} encountered an issue:`, err);
      return [];
    }
  };

  // Run five targeted searches across distinct commercial sectors of the city
  // 14-16 per batch x 5 = 70-80 businesses, micro-staggered to avoid TLS socket collision
  const [batch1, batch2, batch3, batch4, batch5] = await Promise.all([
    queryBatch('Downtown, Central Commercial Core, Primary Avenues & Historic District'),
    new Promise<RawGoogleBusiness[]>((r) => setTimeout(() => queryBatch('North & Northwest Commercial Corridors, Tech & Business Centers').then(r), 150)),
    new Promise<RawGoogleBusiness[]>((r) => setTimeout(() => queryBatch('East & Northeast Business Parks & Commercial Corridors').then(r), 300)),
    new Promise<RawGoogleBusiness[]>((r) => setTimeout(() => queryBatch('South & Southwest Districts, Metro Plazas & Suburban Hubs').then(r), 450)),
    new Promise<RawGoogleBusiness[]>((r) => setTimeout(() => queryBatch('West Metro Area, Airport / Logistics Corridor & Regional Centers').then(r), 600)),
  ]);

  const combined = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];

  // Deduplicate results
  const seen = new Set<string>();
  const uniqueBusinesses: RawGoogleBusiness[] = [];

  for (const b of combined) {
    if (!b || !b.name) continue;
    const key = `${b.name.toLowerCase().trim()}_${(b.address || '').toLowerCase().trim().slice(0, 18)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueBusinesses.push(b);
    }
  }

  return uniqueBusinesses;
}
