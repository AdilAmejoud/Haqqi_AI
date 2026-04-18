# HaqqiAI — Architecture Documentation

> Last updated: April 2026  
> Status: 🟡 In Progress — Frontend complete, Backend & AI in development

---

## 1. Project Overview

**HaqqiAI** is a fullstack AI-powered Moroccan legal assistant platform.  
It provides legal consultations, document generation, and administrative procedure guidance — all in Moroccan Darija.

### Repository Structure

Haqqi_AI/ ← GitHub repo root
├── frontend/ ✅ Complete — React + Vite + Supabase
├── backend/ 🔲 Placeholder — Django + DRF (in development)
├── ai/ 🔲 Placeholder — RAG pipeline (in development)
├── docs/ 🔲 Placeholder — API docs (coming soon)
├── .gitignore
└── README.md

**Legend:**

- ✅ Complete and pushed
- 🟡 In progress
- 🔲 Placeholder — will be updated when pushed to repo

---

## 2. Current Stack

### Frontend ✅

| Technology   | Version | Purpose                   |
| ------------ | ------- | ------------------------- |
| React        | 19      | UI framework              |
| TypeScript   | 5.x     | Type safety               |
| Vite         | 6.2.0   | Build tool and dev server |
| Tailwind CSS | 4.x     | Styling — RTL-first       |
| React Router | v6      | Client-side routing       |
| Supabase JS  | 2.x     | Auth + database client    |
| Lucide React | latest  | Icon system               |

### Backend 🔲 _(in development)_

| Technology            | Version      | Purpose        |
| --------------------- | ------------ | -------------- |
| Django                | 4.x          | Web framework  |
| Django REST Framework | 3.x          | REST API layer |
| PostgreSQL            | via Supabase | Database       |
| Python                | 3.10+        | Runtime        |

### AI / RAG Pipeline 🔲 _(in development)_

| Technology | Version | Purpose                         |
| ---------- | ------- | ------------------------------- |
| LangChain  | latest  | RAG orchestration               |
| Gemini     | latest  | Language model                  |
| Pinecone   | latest  | Vector store for law embeddings |

### Infrastructure ✅

| Service          | Purpose                         |
| ---------------- | ------------------------------- |
| Supabase         | PostgreSQL + Auth + Storage     |
| Google OAuth 2.0 | Authentication provider         |
| Vercel           | Frontend deployment _(planned)_ |

---

## 3. Frontend Architecture ✅

### Folder Structure

frontend/
├── src/
│ ├── components/
│ │ ├── dashboard/
│ │ │ ├── CitizenDashboard.tsx ← L1 user view
│ │ │ ├── StudentDashboard.tsx ← L2 user view
│ │ │ └── ExpertDashboard.tsx ← L3 user view
│ │ ├── settings/
│ │ ├── AppShell.tsx ← Global layout wrapper
│ │ ├── Sidebar.tsx ← Navigation sidebar
│ │ ├── TopNav.tsx ← Top navigation bar
│ │ └── LogoutButton.tsx
│ ├── screens/
│ │ ├── LandingScreen.tsx ← Public landing page
│ │ ├── AuthScreen.tsx ← Google OAuth login
│ │ ├── OnboardingScreen.tsx ← First-time user setup
│ │ ├── HomeScreen.tsx ← Dynamic dashboard (L1/L2/L3)
│ │ ├── ChatScreen.tsx ← AI chat interface
│ │ ├── LibraryScreen.tsx ← Moroccan law library
│ │ ├── DocumentScreen.tsx ← Document generation
│ │ ├── ProceduresScreen.tsx ← Administrative procedures
│ │ ├── CommunityScreen.tsx ← Community forum
│ │ └── SettingsScreen.tsx ← User settings
│ ├── utils/
│ │ └── supabase/
│ │ ├── client.ts ← Supabase singleton
│ │ ├── profile.ts ← Profile CRUD operations
│ │ └── getSystemPrompt.ts ← AI system prompt builder
│ ├── types.ts ← Global TypeScript types
│ ├── App.tsx ← Router + auth logic
│ └── main.tsx ← Entry point
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example

### Auth Flow

User opens app
│
▼
Has session? ──No──► Landing Page ──► Auth Screen ──► Google OAuth
│ │
Yes ▼
│ Supabase callback
▼ │
Profile exists? Trigger creates profile
│ │
Yes ──► onboarding_completed? ▼
│ Onboarding Screen
Yes (name + level)
│ │
▼ ▼
Dashboard ◄────────────────────────── Save to Supabase

### 3-Level Dashboard System

| Level | User Type             | Dashboard        | Key Features                                       |
| ----- | --------------------- | ---------------- | -------------------------------------------------- |
| L1    | مواطن عادي (Citizen)  | CitizenDashboard | Darija Q&A, common scenarios, quick questions      |
| L2    | طالب قانون (Student)  | StudentDashboard | Law library, legislative references, PDF resources |
| L3    | محامي / خبير (Expert) | ExpertDashboard  | Case management, AI tools, document drafting       |

### Design System

Colors:
Primary (Navy): #1B3A6B
Accent (Gold): #C9A84C
Background: #F7F8FA
Surface: #FFFFFF
Text Primary: #1F2937
Text Muted: #6B7280
Border: #E5E7EB
Typography:
Font: IBM Plex Sans Arabic / Cairo
Direction: RTL (dir="rtl") everywhere
Icons:
Library: Lucide React
Style: stroke only, strokeWidth=1.5
Rule: NO colorful icons

---

## 4. Database Schema ✅

All tables live in Supabase (PostgreSQL). All use Row Level Security (RLS).
profiles
id uuid PK → auth.users
full_name text
legal_level text ('citizen' | 'student' | 'expert')
onboarding_completed boolean DEFAULT false
avatar_url text
created_at timestamptz
conversations 🔲 planned
id uuid PK
user_id uuid → profiles.id
title text
topic text
is_archived boolean
created_at timestamptz
messages 🔲 planned
id uuid PK
conversation_id uuid → conversations.id
role text ('user' | 'assistant')
content text
sources jsonb ← legal article citations
created_at timestamptz
documents 🔲 planned
id uuid PK
user_id uuid → profiles.id
title text
type text ('contract' | 'memo' | 'complaint' | 'template')
content text
file_path text
created_at timestamptz
cases 🔲 planned (L3 only)
id uuid PK
lawyer_id uuid → profiles.id
title text
client_name text
status text ('new' | 'active' | 'completed' | 'archived')
category text
next_hearing date
reference_number text
notes text
created_at timestamptz
case_documents 🔲 planned (L3 only)
case_id uuid → cases.id
document_id uuid → documents.id
added_at timestamptz

---

## 5. Backend Architecture 🔲 _(Placeholder — to be updated when pushed)_

> This section will be completed by the Backend Lead when the Django project is pushed to `backend/`.

### Expected Structure

backend/
├── manage.py
├── requirements.txt
├── .env.example
├── config/
│ ├── settings.py
│ ├── urls.py
│ └── wsgi.py
├── api/
│ ├── views.py ← REST API endpoints
│ ├── serializers.py
│ ├── urls.py
│ └── models.py
└── README.md

### Expected API Endpoints

POST /api/chat/ ← Send message, get AI response
GET /api/conversations/ ← List user conversations
POST /api/documents/ ← Generate legal document
GET /api/library/search/ ← Search Moroccan law database
POST /api/cases/ ← Create new case (L3)

---

## 6. AI / RAG Pipeline �� _(Placeholder — to be updated when pushed)_

> This section will be completed by the AI Lead when the pipeline is pushed to `ai/`.

### Expected Architecture

User question (Darija)
│
▼
Query Processing
(language detection, preprocessing)
│
▼
Embedding Generation
(Gemini embeddings)
│
▼
Pinecone Vector Search
(search Moroccan law corpus)
│
▼
Context Assembly
(top-k relevant law articles)
│
▼
LangChain + Gemini
(generate answer with legal grounding)
│
▼
Response with Citations
(article number + law name)

### Expected Folder Structure

ai/
├── requirements.txt
├── .env.example
├── pipeline/
│ ├── embeddings.py ← Document embedding
│ ├── retriever.py ← Pinecone search
│ ├── chain.py ← LangChain RAG chain
│ └── prompt.py ← System prompt templates
├── data/
│ └── laws/ ← Moroccan law documents (PDF/text)
└── README.md

---

## 7. CI/CD Pipeline 🔲 _(Planned)_

```yaml
# .github/workflows/deploy.yml
name: Deploy HaqqiAI
on:
  push:
    branches: [main]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd frontend && npm install
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build
      # Deploy to Vercel

  backend: # 🔲 to be added by backend team
    runs-on: ubuntu-latest
    steps:
      - placeholder
```

---

## 8. Environment Variables

### frontend/.env.local

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:3002

### backend/.env 🔲 _(placeholder)_

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DJANGO_SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

### ai/.env 🔲 _(placeholder)_

GEMINI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=haqqi-legal
PINECONE_ENVIRONMENT=

---

## 9. Team Responsibilities

| Name             | Role          | Owns                                       |
| ---------------- | ------------- | ------------------------------------------ |
| Adil Amejoud     | Frontend Lead | `frontend/`, Supabase schema, Auth flow    |
| Mourice Louba    | Backend Lead  | `backend/`, Django REST API, DB migrations |
| Marouane Amguine | AI Lead       | `ai/`, RAG pipeline, Gemini, Pinecone      |

---

## 10. How to Update This Document

When a new part of the project is pushed to the repo:

1. Replace the 🔲 placeholder section with the actual implementation details
2. Update the repository structure table at the top (change 🔲 to ✅)
3. Commit with message: `docs: update ARCHITECTURE.md — add [backend/ai] details`
4. Push to main

---

## 11. Maintenance Checklist

- ✅ Run `npm run lint` before every PR (frontend)
- ✅ Never commit `.env.local` or `.env` files
- ✅ All new Supabase tables must have RLS enabled
- ✅ All icons must use Lucide React with strokeWidth=1.5
- 🔲 Weekly `pip audit` for backend dependencies
- 🔲 Run Django tests before every backend PR
- 🔲 Quarterly Lighthouse performance audit
