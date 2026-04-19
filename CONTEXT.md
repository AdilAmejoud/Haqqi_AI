# HaqqiAI - Project Context

## Overview

**HaqqiAI** (حقِي الذكاء الاصطناعي) is a Moroccan legal AI assistant platform that helps users understand their rights under Moroccan law. The application provides AI-powered legal consultations, document generation, and guidance on administrative procedures in Arabic (specifically Moroccan Darija).

### Core Purpose
-Democratize access to legal information for Moroccan citizens
-Provide AI-powered legal consultations in Moroccan Darija (colloquial Arabic)
-Generate legal documents (contracts, complaints, warnings)
-Guide users through administrative procedures
-Enable anonymous corruption reporting

---

## ARCHITECTURE OVERVIEW

### Framework & Technology Stack
| Component | Technology |
|-----------|-----------|
| **Framework** | React 19.0.0 |
| **Language** | TypeScript 5.8.2 |
| **Build Tool** | Vite 6.2.0 |
| **Styling** | Tailwind CSS 4.1.14 |
| **Routing** | Client-side SPA routing (custom implementation) |
| **Icons** | Lucide React, Material Symbols |
| **Animation** | Framer Motion 12.23.24 |
| **Backend** | Express.js + Better-SQLite3 |
| **AI Integration** | Google Generative AI |

### Project Structure
```
haqqiai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── TopNav.tsx      # Top navigation bar
│   │
│   ├── screens/            # Page components (one per route)
│   │   ├── LandingScreen.tsx    # Marketing landing page
│   │   ├── OnboardingScreen.tsx # 4-slide onboarding flow
│   │   ├── AuthScreen.tsx       # Email + OTP login
│   │   ├── HomeScreen.tsx       # Main dashboard
│   │   ├── ChatScreen.tsx       # AI chat interface
│   │   ├── DocumentScreen.tsx   # Legal document generation
│   │   ├── ReportScreen.tsx     # Corruption reporting
│   │   ├── ProceduresScreen.tsx # Admin procedures guide
│   │   ├── SocialScreen.tsx     # Social aid eligibility
│   │   ├── DashboardScreen.tsx  # User profile & cases
│   │   ├── LibraryScreen.tsx    # Legal prompts library
│   │   └── SettingsScreen.tsx   # App settings
│   │
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
│
├── dist/                   # Build output
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

### Routing System
**No external router library** - custom client-side routing using React state:
- `currentScreen` state manages navigation between screens
- Routes defined in `types.ts`: `landing`, `onboarding`, `auth`, `home`, `chat`, `document`, `report`, `procedures`, `social`, `dashboard`, `library`, `settings`
- Navigation controlled by `App.tsx` component with conditional rendering

### State Management
- **Primary State**: `useState` in `App.tsx` for:
  - `currentScreen` - current active screen/route
  - `isSidebarOpen` - sidebar toggle state
  - `pendingPrompt` - shared state for library→chat flow
- **Per-Screen State**: Individual `useState` hooks within each screen component
- **No external state management library** (no Redux, Zustand, etc.)

### API Integration
- **Gemini API**: `@google/genai` for AI chat responses
- **Local Storage**: Not explicitly used - data persists via screen state
- **Backend**: Express server with Better-SQLite3 for local database
- **Environment**: `GEMINI_API_KEY` injected via Vite config

---

## COMPONENT MAP

### Reusable Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `Sidebar` | `src/components/Sidebar.tsx` | Navigation sidebar with user profile, upgrade prompt, and navigation items |
| `TopNav` | `src/components/TopNav.tsx` | Top bar with search, settings menu, dark mode toggle, language selector |

### Page Components (Screens)
| Screen | Purpose | Key Features |
|--------|---------|--------------|
| `LandingScreen` | Marketing page | 4-slide hero, services grid, pricing plans, FAQ, testimonials |
| `OnboardingScreen` | User onboarding | 4-slide welcome with feature cards, testimonials, statistics |
| `AuthScreen` | Login/Registration | Email + 6-digit OTP flow, Google login placeholder |
| `HomeScreen` | Main dashboard | Welcome message, AI chat CTA, service cards, quick-access tabs |
| `ChatScreen` | AI chat interface | Message streaming, reasoning steps, quick chips, file uploads |
| `DocumentScreen` | Document generation | Form with auto-fill, live preview, PDF/Word export |
| `ReportScreen` | Corruption reporting | Type selection, location mapping, AI legal reference detection |
| `ProceduresScreen` | Admin procedures | Step-by-step guides for administrative processes |
| `SocialScreen` | Social aid guide | Eligibility checking for AMO, Tayssir, direct aid programs |
| `DashboardScreen` | User profile | Cases, documents, reports tabs; profile management |
| `LibraryScreen` | Legal prompts | Category-filtered prompts with tags, chat integration |
| `SettingsScreen` | App settings | Appearance, notifications, privacy, smart assistant settings |

### Component Patterns
- **Toggle Switch**: Reusable toggle component in `TopNav.tsx` and `SettingsScreen.tsx`
- **Modal Overlays**: Consistent modal pattern with backdrop and animations
- **Card Components**: Rounded cards with hover effects, consistent spacing
- **RTL Support**: All components use `dir="rtl"` and RTL-aware layouts

---

## STYLING SYSTEM

### CSS Approach
**Tailwind CSS 4.1.14** with Vite plugin - uses CSS-first configuration via `@theme` directives.

### Theme Configuration (`src/index.css`)
```css
@theme {
  --color-primary: #D4AF37;              /* Gold accent */
  --color-navy-50: #f0f2f7;
  --color-navy-100: #e1e6ef;
  --color-navy-200: #c4cfde;
  --color-navy-300: #99abc5;
  --color-navy-400: #6981a7;
  --color-navy-500: #48638d;
  --color-navy-600: #394f74;
  --color-navy-700: #2f415f;
  --color-navy-800: #2a374e;
  --color-navy-900: #1E2F4F;
  --color-background-light: #FAFAFA;
  --font-sans: "Noto Sans Arabic", "Plus Jakarta Sans", sans-serif;
}
```

### Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Navy (Primary)** | `#1B3A6B` | Headers, buttons, active states |
| **Gold (Secondary)** | `#C9A84C` | Icons, highlights, accents |
| **Navy Light** | `#1b396a` | Hover states, borders |

### Typography
```css
font-family: "Noto Sans Arabic", "Plus Jakarta Sans", sans-serif;
```
- **Noto Naskh Arabic**: Headings and special text
- **Noto Sans Arabic**: Body text
- **Plus Jakarta Sans**: General sans-serif fallback
- **Material Symbols**: Iconography via class names

### RTL Support
- **HTML**: `dir="rtl"` on root elements and throughout
- **Layout**: Grids and flexboxes ordered RTL (left/right reversed)
- **Icons**: Chevron icons use clockwise rotation for RTL
- **Text**: All Arabic content flows right-to-left

### Responsive Breakpoints
Based on Tailwind defaults:
- **Mobile**: `< 768px` - Single column, stacked layouts
- **Tablet**: `768px - 1024px` - 2-column grids
- **Desktop**: `> 1024px` - Multi-column, sidebars

### Custom CSS Utilities (`src/index.css`)
- `.geometric-bg`: Pattern background with navy/gold geometry
- `.premium-shadow`: Soft shadow with navy tint
- `.gold-gradient-text`: Gold-to-light-gold gradient text
- `.nav-blur`: 12px backdrop blur for floating navbars
- `.marquee` animation: Horizontal scrolling text

---

## CURRENT FEATURES

### Implemented & Functional
1. **Landing Page** - Complete marketing site with pricing, FAQ, testimonials
2. **Onboarding Flow** - 4-slide progressive onboarding with animations
3. **Authentication** - Email + OTP login flow (mock implementation)
4. **Dashboard** - Tabbed interface for cases, documents, reports
5. **AI Chat** - Streaming responses, reasoning steps animation, quick action chips
6. **Document Generator** - Auto-filled forms, live preview, PDF/Word export
7. **Corruption Reporting** - Type selection, AI legal reference, anonymous upload
8. **Admin Procedures** - Expandable cards with step-by-step guides
9. **Social Aid** - Eligibility checker for AMO, Tayssir, direct support
10. **Legal Library** - Category-filtered prompts with chat integration
11. **Settings** - Dark mode, text size, language, notifications, privacy toggles
12. **Search** - Global search with recent/suggestion history
13. **Navigation** - Sidebar + top nav with responsive collapse

### Placeholder/Mock Features
- **Google Login**: Icon present but not implemented
- **PDF Export**: Download modal present but no actual export logic
- **Real Database**: Better-SQLite3 configured but not used in screens
- **Gemini API**: Key injected but no actual API calls in code

### Animations & Transitions
- **Page Transitions**: `animate-in fade-in duration-200` for new screens
- **Modals**: `zoom-in-95 origin-top-left` scale animations
- **Cards**: `hover:-translate-y-0.5` lift on hover
- **Tabs**: `animate-in slide-in-from-bottom-4` for tab content
- **Chat Streaming**: Word-by-word text reveal animation
- **Sidebar**: 280ms transition with `ease-in-out`

---

## CODE QUALITY NOTES

### Patterns to Follow
1. **Component Structure**: Single file per screen with clear sections
2. **State Management**: Local `useState` for component-specific state
3. **Styling**: Tailwind utility classes, avoid custom CSS when possible
4. **Icons**: Import from `lucide-react`, use `size` prop consistently
5. **RTL Layout**: Use `dir="rtl"`, `gap-x-reverse`, Chevron clockwise rotation

### Anti-Patterns to Avoid
1. **Global State**: No Redux/Zustand - keep state local to components
2. **External Router**: Don't add react-router - use state-based routing
3. **Custom Icons**: Use Lucide React or Material Symbols, not SVG files
4. **CSS Modules**: No CSS files - everything in Tailwind or global `index.css`

### TypeScript Usage
- Full TypeScript implementation
- `Screen` type in `types.ts` defines all routes
- Component props typed with interfaces
- No `any` types used in provided code

### Accessibility
- Semantic HTML buttons with text labels
- ARIA roles on modals and navigation
- Focus states on interactive elements
- Keyboard navigation (Escape closes menus)
- High contrast text (navy on white)

### Performance Considerations
- **Code Splitting**: Not implemented - all screens loaded at once
- **Image Lazy Loading**: Not used - images load immediately
- **Virtualization**: Not needed - lists are small (< 50 items)
- **Animation Optimization**: Use `will-change` where appropriate

---

## API ENDPOINTS (Backend)

Based on `package.json`:
- **Server**: Express.js
- **Database**: Better-SQLite3 (local file database)

Expected endpoints (inferred from frontend usage):
- `/api/chat` - AI chat responses
- `/api/documents` - Document generation
- `/api/reports` - Corruption report submission
- `/api/procedures` - Procedure information
- `/api/users` - User profile management

---

## DEPLOYMENT

**Vercel AI Studio Integration**:
- HMR disabled in AI Studio (`DISABLE_HMR` env var)
- Port 3000 for dev server
- `vite build` for production
- Environment variables managed via `.env.example`

---

## FILE SUMMARY

| File | Lines | Description |
|------|-------|-------------|
| `App.tsx` | ~85 | Main routing and layout |
| `Sidebar.tsx` | ~130 | Navigation sidebar |
| `TopNav.tsx` | ~475 | Top navigation with search |
| `HomeScreen.tsx` | ~220 | Main dashboard |
| `ChatScreen.tsx` | ~377 | AI chat interface |
| `DocumentScreen.tsx` | ~277 | Document generator |
| `ReportScreen.tsx` | ~296 | Corruption reporting |
| `ProceduresScreen.tsx` | ~264 | Admin procedures |
| `SocialScreen.tsx` | ~304 | Social aid guide |
| `DashboardScreen.tsx` | ~305 | User profile |
| `LibraryScreen.tsx` | ~198 | Legal prompts |
| `SettingsScreen.tsx` | ~355 | App settings |
| `LandingScreen.tsx` | ~710 | Marketing page |
| `OnboardingScreen.tsx` | ~265 | Onboarding flow |
| `AuthScreen.tsx` | ~209 | Login/Registration |
| `index.css` | ~70 | Global styles + theme |
| `types.ts` | ~1 | Route type definitions |

---

## NEXT STEPS FOR NEW DEVELOPERS

1. **Set up environment**: Copy `.env.example` to `.env.local`, add Gemini API key
2. **Install dependencies**: `npm install`
3. **Start dev server**: `npm run dev`
4. **Build**: `npm run build`
5. **Run lint**: `npm run lint` (TypeScript check)

---

*Generated automatically from codebase analysis*
*Last updated: 2026-04-11*
