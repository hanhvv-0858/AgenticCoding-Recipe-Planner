# Phase 0: Research & Technology Decisions

**Feature**: Recipe Planner - Mobile-First Meal Planning & Grocery List App  
**Branch**: `001-recipe-planner-app`  
**Date**: February 11, 2026

## Purpose

This document captures research findings and architectural decisions for the Recipe Planner application. All unknowns from the Technical Context have been resolved, and best practices for the chosen technology stack have been identified.

## Technology Stack Decisions

### Decision 1: Next.js 14+ App Router (Frontend & Backend)

**Decision**: Use Next.js 14.1+ with App Router architecture as the unified full-stack framework

**Rationale**:
- **Unified TypeScript codebase**: Single repository for frontend and backend eliminates API contract mismatches
- **Server Components**: Dramatically reduce client-side JavaScript bundle size (critical for mobile performance)
- **Server Actions**: Type-safe mutations without manual API route definitions, reducing boilerplate by ~40%
- **Built-in optimizations**: Automatic code splitting, image optimization (next/image), font optimization
- **Static & Dynamic rendering**: Mix SSR, SSG, and ISR for optimal performance per route
- **Mobile-first optimized**: Aggressive code splitting and prefetching ensure fast mobile loads
- **React 18 features**: Built-in support for Suspense, streaming, and progressive hydration

**Alternatives Considered**:
1. **Separate React SPA + Express/Fastify API**:
   - Rejected: Requires maintaining two codebases, manual API client synchronization, CORS configuration
   - More complex deployment and infrastructure management
   - Larger initial bundle size for client-side SPA
2. **Remix**:
   - Rejected: Smaller ecosystem, less mature than Next.js for production use
   - Fewer managed hosting options compared to Vercel/Netlify Next.js support
3. **Create React App + Node.js API**:
   - Rejected: CRA is deprecated, no built-in SSR/SSG, manual build configuration required

**Best Practices**:
- Use Server Components by default, only mark 'use client' when interactivity is required
- Leverage parallel routes and intercepting routes for modal navigation patterns
- Use streaming with Suspense for faster perceived performance on slow networks
- Implement middleware for authentication checks before page rendering
- Use Route Handlers (app/api) only for webhooks or external integrations
- Enable React Strict Mode for detecting side effects during development

**References**:
- Next.js 14 Documentation: https://nextjs.org/docs
- Server Components RFC: https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md
- Vercel Next.js Performance Patterns: https://vercel.com/blog/nextjs-app-router-performance

---

### Decision 2: Supabase for Authentication & Database

**Decision**: Use Supabase (PostgreSQL 15+ with built-in Auth) for all backend data and authentication

**Rationale**:
- **Authentication built-in**: Email/password auth with session management, no custom auth implementation needed
- **PostgreSQL power**: ACID transactions, foreign keys, JSON columns, full-text search
- **Row Level Security (RLS)**: Database-enforced access control policies (user can only see their meal plans)
- **Real-time subscriptions**: WebSocket-based live updates for grocery list collaboration
- **Type generation**: Automatic TypeScript types from database schema via Supabase CLI
- **Edge Functions**: Optional serverless functions for background jobs (e.g., recipe recommendations)
- **Generous free tier**: 500MB database, 50,000 active users, 2GB file storage

**Alternatives Considered**:
1. **Firebase**:
   - Rejected: NoSQL document model less suitable for relational recipe/ingredient data
   - More expensive at scale, vendor lock-in with proprietary Firestore queries
   - Less SQL query flexibility for complex grocery list aggregations
2. **PostgreSQL + custom auth (NextAuth.js)**:
   - Rejected: Would require manual database setup, hosting, and auth configuration
   - More infrastructure management overhead
   - NextAuth.js adds complexity for simple email/password needs
3. **Prisma + PlanetScale**:
   - Rejected: PlanetScale doesn't support foreign keys (critical for referential integrity)
   - Higher cost for production scale
   - Supabase provides more features out-of-box (auth, storage, real-time)

**Best Practices**:
- Enable Row Level Security (RLS) on all tables from day one
- Use Supabase Auth helpers for Next.js: `@supabase/ssr` for Server Components
- Create separate Supabase clients for client-side and server-side operations
- Use database migrations (SQL files) for schema changes, never manual table edits
- Implement proper indexes on foreign keys and frequently queried columns
- Store recipe images in Supabase Storage with CDN integration
- Use database triggers for automatic `updated_at` timestamps

**References**:
- Supabase Next.js Integration: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- PostgreSQL Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Supabase TypeScript Support: https://supabase.com/docs/guides/api/generating-types

---

### Decision 3: TailwindCSS for Responsive Styling

**Decision**: Use TailwindCSS 3.4+ with mobile-first breakpoints for all styling

**Rationale**:
- **Mobile-first by default**: Breakpoints start from base (mobile) and scale up
- **Utility-first approach**: Rapid UI development without context switching to CSS files
- **Design consistency**: Constrained design tokens prevent arbitrary spacing/colors
- **Bundle optimization**: PurgeCSS removes unused styles automatically
- **Dark mode support**: Built-in class variants for dark mode (future feature)
- **Responsive variants**: Simple syntax (`md:`, `lg:`) for different screen sizes
- **Plugin ecosystem**: Headless UI, Forms plugin for accessible components

**Alternatives Considered**:
1. **CSS Modules**:
   - Rejected: More verbose, requires manual media queries, no design system constraints
   - Slower development velocity compared to Tailwind utilities
2. **Styled Components / Emotion**:
   - Rejected: Runtime CSS-in-JS has performance overhead on mobile devices
   - Larger JavaScript bundle size
   - Less optimal with React Server Components
3. **Chakra UI / Material-UI**:
   - Rejected: Pre-built components are opinionated and harder to customize for unique mobile UX
   - Larger bundle sizes, unnecessary for custom design requirements

**Best Practices**:
- Define custom design tokens in `tailwind.config.ts` (colors, spacing, typography)
- Use `@apply` sparingly, prefer composition of utility classes
- Configure breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Use responsive font sizes with `text-base md:text-lg` pattern
- Implement container queries plugin for component-level responsive design
- Use Tailwind's form plugin for consistent input styling
- Set up ESLint plugin (`eslint-plugin-tailwindcss`) for class ordering

**References**:
- TailwindCSS Documentation: https://tailwindcss.com/docs
- Mobile-First Strategy: https://tailwindcss.com/docs/responsive-design
- Next.js + Tailwind Setup: https://tailwindcss.com/docs/guides/nextjs

---

### Decision 4: Jest + React Testing Library + Playwright

**Decision**: Use Jest with React Testing Library for unit/integration tests, Playwright for E2E tests

**Rationale**:
- **Jest**: Industry standard for JavaScript testing, excellent TypeScript support, fast parallel execution
- **React Testing Library**: Encourages testing user behavior over implementation details, great accessibility test support
- **Playwright**: Cross-browser E2E testing with mobile viewport emulation, auto-waiting, screenshot/video capture
- **Component testing approach**: Test components in isolation with mocked data
- **Integration testing**: Test Server Actions with actual Supabase test database
- **E2E critical paths**: Automate user scenarios from spec.md (registration → meal planning → grocery list)

**Alternatives Considered**:
1. **Vitest + Testing Library**:
   - Considered: Faster than Jest, better ESM support, but less mature ecosystem
   - Decision: Stick with Jest for stability, can migrate later if needed
2. **Cypress**:
   - Rejected: Slower than Playwright, less accurate mobile emulation
   - Playwright has better TypeScript integration and built-in test generation
3. **No E2E testing**:
   - Rejected: Constitution requires E2E tests for critical user journeys
   - Manual testing insufficient for regression prevention

**Best Practices**:
- Use Testing Library queries: `getByRole`, `getByLabelText` (avoid `getByTestId`)
- Mock Supabase client for unit tests, use test database for integration tests
- Playwright tests run in CI on every PR, use `trace: 'on-first-retry'` for debugging
- Test responsive behavior with Playwright mobile viewports (`iPhone 13`, `Pixel 5`)
- Use Jest snapshot testing sparingly, only for stable UI components
- Achieve 80%+ code coverage for `lib/` directory (business logic)
- Group tests by user scenario matching spec.md structure

**References**:
- Testing Library Best Practices: https://testing-library.com/docs/react-testing-library/intro
- Playwright Documentation: https://playwright.dev/
- Next.js Testing Guide: https://nextjs.org/docs/testing

---

## Feature-Specific Research

### Ingredient Unit Conversion

**Challenge**: Recipes use different units (cups, grams, tablespoons), grocery lists need smart merging

**Solution**: Implement unit conversion library with standardized base units
- **Base units**: Convert all measurements to metric (grams for weight, ml for volume)
- **Conversion tables**: Store common ingredient densities (1 cup flour ≈ 120g)
- **Smart merging**: When merging "2 cups flour" + "300g flour", convert both to grams → "540g flour"
- **Display**: Show in user's preferred unit system (metric/imperial toggle in settings)

**Library Options**:
1. **convert-units** package: Simple API, supports weight/volume/temperature conversions
2. **Custom implementation**: More control for recipe-specific conversions (e.g., "1 clove garlic")

**Decision**: Start with `convert-units`, extend with custom conversions for complex ingredients

**References**:
- NPM convert-units: https://www.npmjs.com/package/convert-units
- USDA Food Composition Database: https://fdc.nal.usda.gov/

---

### Serving Size Scaling

**Challenge**: Users need to adjust recipe serving sizes (2 servings → 6 servings)

**Solution**: Linear scaling with sensible rounding
- Store ingredients with numeric quantities and units separately in database
- Multiply quantities by scaling factor: `newQuantity = originalQuantity * (newServings / originalServings)`
- Round to sensible fractions: 1.33 cups → "1⅓ cups", 2.7 tablespoons → "2¾ tbsp"
- Handle edge cases: "1 clove garlic" (×2) → "2 cloves", not "2 clove"

**Implementation**: Create `scaleIngredient()` utility function with rounding logic

---

### Meal Plan Calendar UX

**Challenge**: Display 7-day calendar efficiently on mobile screens

**Solution**: Horizontal scrollable calendar strip
- Use CSS `overflow-x: auto` with `snap-scroll` for smooth day selection
- Active day highlighted with border/background color
- Touch-friendly day cells (minimum 60px width)
- Implement virtualization if calendar extends beyond 7 days (future: multi-week view)

**Component**: `CalendarStrip` component with date manipulation via `date-fns` library

**References**:
- CSS Scroll Snap: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll_Snap
- date-fns documentation: https://date-fns.org/

---

### Smart Grocery List Merging

**Challenge**: Multiple recipes with overlapping ingredients need intelligent consolidation

**Solution**: Database-level aggregation with display formatting
- SQL query: `GROUP BY ingredient_name, unit` then `SUM(quantity)`
- Show merged result: "Garlic: 5 cloves (Used in: Pasta Aglio e Olio, Caesar Salad, Stir-Fry)"
- Handle unit mismatches: Convert to common unit before summing
- User can manually split merged items if needed (e.g., different garlic types)

**Database Design**: 
- `meal_plan_items` table references `recipes`
- `grocery_list_items` generated view/materialized query from meal plan
- Use PostgreSQL aggregate functions for efficient grouping

---

### Image Optimization

**Challenge**: Recipe images can be large, slow down mobile loading

**Solution**: Next.js Image Optimization + Supabase Storage
- Store original images in Supabase Storage
- Use `next/image` component for automatic responsive images
- Generate multiple sizes: thumbnail (320w), card (640w), detail (1280w)
- Serve WebP format with JPEG fallback
- Implement lazy loading with blur placeholder
- Use CDN (Supabase CDN or Vercel Image Optimization)

**Performance**: Reduces image payload by 60-70% compared to serving full-size JPEGs

**References**:
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images

---

## Resolved Unknowns from Technical Context

All "NEEDS CLARIFICATION" items have been addressed:

✅ **Language/Version**: TypeScript 5.3+, Node.js 20 LTS  
✅ **Primary Dependencies**: Next.js 14.1+, React 18+, Supabase, TailwindCSS  
✅ **Storage**: Supabase (PostgreSQL 15+)  
✅ **Testing**: Jest + React Testing Library + Playwright  
✅ **Performance Goals**: Defined mobile-first targets (<3s TTI on 3G)  
✅ **Constraints**: Touch targets 44×44px, API <200ms, real-time <500ms  
✅ **Scale/Scope**: 1-10K users, 500-5K recipes, ~40 components

## Next Steps

Proceed to **Phase 1: Design & Contracts**:
1. Create `data-model.md` with complete database schema
2. Generate API contracts for key operations (recipes, meal plans, grocery lists)
3. Write `quickstart.md` for developer onboarding
4. Update `.github/copilot-instructions.md` with project tech stack context

All research complete. No blockers for implementation.
