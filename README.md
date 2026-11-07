# ScoutWeb — Autonomous Prospecting, Lead Intelligence & Website Generation Platform

A full-stack, enterprise-grade AI lead prospecting and website audit platform with **zero guessing**, authentic Google Maps discovery, live domain email crawling, automated website diagnostics, and an Express + Prisma backend with interactive Swagger documentation.

---

## 🚀 Key Features & Subsystems

### 1. Opportunity Finder (Google Maps + Niche CRM Filter)
- **High Volume Discovery**: Multi-sector search algorithm pulling 50+ real, active local businesses per search.
- **Niche CRM Breakdown**: Filter searches down to specific website platforms including **Wix**, **Shopify**, **WordPress**, **Squarespace**, or businesses with **No Website**.
- **100% Authentic Domain Email Crawling**: Live multi-threaded DOM crawler inspecting homepages and contact pages. **Zero synthetic or guessed `@gmail.com` addresses**—only publicly listed business emails are extracted.
- **Dynamic Presence Detection**: Checks domain availability, mobile responsiveness, SSL security, phone numbers, and WhatsApp links.

### 2. Website Audit Engine & Professional Outreach Generator
- **Deep Technical Audit**: Live DOM inspection measuring response latency (~ms), script counts, heading structure, viewport tags, and CTA clarity.
- **Professional Outreach Copy**: Generates customized cold outreach messages (Email, LinkedIn, WhatsApp, Instagram DM) built directly from the business's actual audit findings across multiple angles (*Executive Summary*, *Glitch Alert*, *Performance Vitals*, *Conversion UX*, *Technical SEO*).

### 3. Enterprise Express Backend & Prisma ORM (`/server`)
- **Framework**: Express.js with TypeScript (`tsx`).
- **Database**: Relational SQLite (`dev.db`) managed via **Prisma ORM 6.4.1**.
- **Interactive Documentation**: Swagger / OpenAPI 3.0 UI live at `http://localhost:5000/api/docs`.
- **JWT Authentication**: Secure user registration, salted bcrypt password hashing, and session management.
- **Unified Full-Stack**: Both the Next.js frontend (`port 3000`) and standalone Express API (`port 5000`) share the Prisma database.

### 4. Lead Pipeline CRM & AI Website Designer
- **Pipeline Stages**: `New`, `Contacted`, `In Conversation`, `Closed Won`, `Closed Lost`.
- **Exporting**: One-click CSV and JSON exports.
- **AI Website Studio**: Instant multi-page client website generation with live preview and publishing at `/site/[slug]`.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14.2 (App Router, Tailwind CSS, Lucide Icons) |
| **Backend Framework** | Express 5.x, TypeScript, `tsx` |
| **ORM & Database** | Prisma ORM 6.4.1, SQLite (`prisma/schema.prisma`) |
| **API Documentation** | Swagger / OpenAPI 3.0 (`swagger-ui-express`, `swagger-jsdoc`) |
| **Web Crawling & DOM** | Cheerio 1.0, native Fetch API |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |

---

## 🚦 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Database Setup & Seeding
```bash
npm run prisma:push
npm run prisma:seed
```
*Default admin account created: `demo@scoutweb.io` (Password: `Password123!`)*

### 3. Running Development Servers
To start the Next.js frontend:
```bash
npm run dev
# Running on http://localhost:3000
```

To start the Express backend API:
```bash
npm run server
# Running on http://localhost:5000
# Swagger UI: http://localhost:5000/api/docs
```

### 4. Running Backend Test Suite
```bash
npm run test:api
```

---

## 🔒 Security & Privacy
- Sensitive files (`.env`, `.env.local`, SQLite databases `*.db`) are strictly excluded via `.gitignore`.
- Production-ready template provided in `.env.example`.
