# Implementation Plan: Recipe Planner - Mobile-First Meal Planning & Grocery List App

**Branch**: `001-recipe-planner-app` | **Date**: February 11, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-recipe-planner-app/spec.md`

## Summary

A responsive mobile-first web application for discovering recipes, planning weekly meals, and generating smart grocery lists. Users can browse and search recipes with filters, create meal plans across a weekly calendar, automatically generate categorized grocery lists with smart ingredient merging, save favorite recipes to a personal cookbook, and manage their account with email/password authentication. The app emphasizes mobile usability with touch-friendly interfaces, bottom navigation, and progressive enhancement for tablet/desktop viewports.

**Technical Approach**: Full-stack TypeScript application using Next.js 14+ (App Router) for both frontend and backend, Supabase for authentication and PostgreSQL database with real-time subscriptions, TailwindCSS for responsive styling, and React Server Components for optimal performance. Testing with Jest, React Testing Library, and Playwright for E2E tests.

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js 20 LTS  
**Primary Framework**: Next.js 14.1+ (App Router with Server Components and Server Actions)  
**UI Library**: React 18+, TailwindCSS 3.4+, Headless UI for accessible components  
**Backend**: Next.js API Routes and Server Actions (no separate backend)  
**Storage**: Supabase (PostgreSQL 15+ with Row Level Security)  
**Authentication**: Supabase Auth (email/password with session management)  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E), Vitest optional  
**Target Platform**: Modern browsers (Chrome 90+, Safari 14+, Firefox 88+), mobile-first responsive design  
**Project Type**: Web application (unified Next.js project serving both frontend and backend)  
**Performance Goals**: 
- Lighthouse Performance score ≥90
- First Contentful Paint (FCP) <1.5s on 4G
- Time to Interactive (TTI) <3s on 3G
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
**Constraints**: 
- Mobile-first: all UI must work on 320px+ screens
- Touch targets minimum 44×44px
- API response time <200ms (p95) for recipe queries
- Client-side state management kept minimal (use Server Components where possible)
- Real-time updates for grocery list changes (<500ms latency)
**Scale/Scope**: 
- Initial target: 1,000-10,000 users
- Recipe database: 500-5,000 recipes initially (expandable)
- ~15-20 main pages/routes
- ~30-40 React components
- Database: 8-10 main tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Mobile-First Responsive Design

**Status**: COMPLIANT

- Next.js supports responsive design with TailwindCSS mobile-first breakpoints
- Feature spec prioritizes mobile UX (bottom nav, touch interfaces, horizontal scrolls)
- All components will be designed for 320px+ with progressive enhancement
- Touch targets meet 44×44px minimum per accessibility standards
- Performance budget targets 3G networks (<3s load time aligns with constitution)

### ✅ II. Data Integrity & Consistency

**Status**: COMPLIANT

- Supabase PostgreSQL provides ACID transactions for atomic operations
- Row Level Security (RLS) ensures data access control at database level
- Foreign key constraints enforce referential integrity (recipes → meal plans → grocery lists)
- Server Actions provide type-safe mutations with automatic rollback on errors
- Client + server validation using Zod schemas for all user inputs

### ✅ III. Modular Feature Architecture

**Status**: COMPLIANT

- Next.js App Router enables feature-based routing structure:
  - `app/(discover)/` - Recipe discovery and search
  - `app/(planner)/` - Meal planning calendar
  - `app/(grocery)/` - Grocery list management
  - `app/(cookbook)/` - Personal saved recipes
  - `app/(profile)/` - User account and settings
- Shared utilities in `lib/` (unit conversion, date handling, validation)
- Each feature has isolated Server Components and API routes
- Database schema uses normalized tables with clear boundaries
- No circular dependencies enforced by ESLint rules

### ✅ IV. Quality Assurance & Testing

**Status**: COMPLIANT

- Jest + React Testing Library for unit and integration tests
- Playwright for end-to-end testing of critical user journeys
- Test coverage target: ≥80% for business logic (lib/ and server actions)
- GitHub Actions CI pipeline runs tests on every PR
- Visual regression testing feasible with Playwright screenshots
- User scenarios from spec.md map directly to E2E test suites

### ✅ V. Performance & Accessibility

**Status**: COMPLIANT

- Next.js optimization features: automatic code splitting, image optimization (next/image)
- Server Components reduce JavaScript bundle size (<3s load on 3G achievable)
- TailwindCSS purges unused styles for minimal CSS payload
- Semantic HTML with proper heading hierarchy
- ARIA labels for all interactive elements and dynamic content
- Keyboard navigation via focus management and roving tabindex
- Color contrast validation in design system (WCAG AA 4.5:1)
- Lighthouse accessibility score target ≥95

### ⚠️ Technical Stack Standards Alignment

**Status**: MOSTLY COMPLIANT (minor deviation)

Constitution recommends "Modern JavaScript framework (React, Vue, or Svelte) with TypeScript" ✅  
Constitution recommends "RESTful API or GraphQL (Node.js, Python, or similar)" - We're using **Next.js Server Actions** instead of traditional REST

**Justification**: Next.js Server Actions provide a superior developer experience with:
- Type-safe client-server communication (no manual API route definitions)
- Automatic request/response serialization
- Built-in form handling with progressive enhancement
- Reduced boilerplate compared to REST endpoints
- Still supports traditional API routes when needed (e.g., webhooks)

This aligns with constitution's spirit of modern best practices while leveraging Next.js 14's cutting-edge patterns.

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-planner-app/
├── spec.md                  # Feature specification (COMPLETED)
├── checklists/
│   └── requirements.md      # Spec validation checklist (COMPLETED)
├── plan.md                  # This file (IN PROGRESS)
├── research.md              # Phase 0: Tech stack decisions (NEXT)
├── data-model.md            # Phase 1: Database schema and entities
├── contracts/               # Phase 1: API contracts
│   ├── recipes.yaml         # Recipe API endpoints
│   ├── meal-plans.yaml      # Meal planning endpoints
│   ├── grocery-lists.yaml   # Grocery list endpoints
│   └── users.yaml           # User/auth endpoints
└── quickstart.md            # Phase 1: Developer onboarding guide
```

### Source Code (repository root)

```text
recipe-planner/                  # Next.js 14 App Router project
├── app/                         # Next.js app directory (routes)
│   ├── (auth)/                 # Auth route group (layout without bottom nav)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/                 # Main app route group (with bottom nav)
│   │   ├── layout.tsx          # Shared layout with navigation
│   │   ├── page.tsx            # Home / Discovery page
│   │   ├── recipes/
│   │   │   └── [id]/           # Recipe detail page
│   │   ├── cookbook/           # Personal saved recipes
│   │   ├── planner/            # Meal planner calendar
│   │   ├── grocery/            # Grocery list
│   │   └── profile/            # User profile/settings
│   ├── api/                    # API routes (webhooks, external integrations)
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles + Tailwind imports
│
├── components/                  # React components
│   ├── ui/                     # Reusable UI primitives (buttons, cards, modals)
│   ├── recipes/                # Recipe-specific components
│   ├── planner/                # Meal planner components
│   ├── grocery/                # Grocery list components
│   ├── navigation/             # Navigation components (bottom nav, header)
│   └── layout/                 # Layout components
│
├── lib/                         # Shared utilities and business logic
│   ├── supabase/               # Supabase client configuration
│   │   ├── client.ts           # Client-side Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── middleware.ts       # Auth middleware
│   ├── actions/                # Server Actions (mutations)
│   │   ├── recipes.ts          # Recipe-related actions
│   │   ├── meal-plans.ts       # Meal plan actions
│   │   ├── grocery-lists.ts    # Grocery list actions
│   │   └── auth.ts             # Authentication actions
│   ├── queries/                # Database queries (reads)
│   │   ├── recipes.ts
│   │   ├── meal-plans.ts
│   │   ├── grocery-lists.ts
│   │   └── users.ts
│   ├── validations/            # Zod schemas for validation
│   ├── utils/                  # Utility functions
│   │   ├── unit-conversion.ts  # Ingredient unit conversions
│   │   ├── date-helpers.ts     # Date formatting and calculations
│   │   ├── nutrition.ts        # Nutritional calculations
│   │   └── merge-ingredients.ts # Smart ingredient merging logic
│   └── types/                  # Shared TypeScript types
│
├── hooks/                       # Custom React hooks
│   ├── use-recipes.ts
│   ├── use-meal-plan.ts
│   ├── use-grocery-list.ts
│   └── use-user.ts
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── supabase/                    # Supabase configuration
│   ├── migrations/              # Database migrations
│   ├── seed.sql                 # Seed data for development
│   └── config.toml              # Supabase project config
│
├── tests/                       # Test files
│   ├── unit/                   # Unit tests (Jest + RTL)
│   │   ├── lib/                # Test business logic
│   │   └── components/         # Test components
│   ├── integration/            # Integration tests
│   │   └── actions/            # Test server actions with DB
│   └── e2e/                    # End-to-end tests (Playwright)
│       ├── auth.spec.ts
│       ├── recipe-discovery.spec.ts
│       ├── meal-planning.spec.ts
│       └── grocery-list.spec.ts
│
├── .env.local.example          # Environment variables template
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── jest.config.js              # Jest configuration
├── playwright.config.ts        # Playwright configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

**Structure Decision**: Selected **Option 2: Web application** structure adapted for Next.js App Router. This structure:

- Uses Next.js as a unified full-stack framework (no separate backend folder)
- Leverages Server Components and Server Actions for backend logic
- Organizes routes by feature using App Router route groups
- Separates concerns: components (view), lib/actions (mutations), lib/queries (reads)
- Follows Next.js 14 best practices and official documentation patterns
- Maintains modular feature boundaries per Constitution principle III

## Complexity Tracking

**No violations to justify** - all Constitution checks passed or have minimal, well-justified deviations.

Minor deviation using Server Actions instead of REST APIs actually **reduces** complexity compared to traditional approaches by eliminating manual API route definitions and improving type safety.
