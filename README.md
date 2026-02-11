# Recipe Planner 🍳

A mobile-first meal planning & grocery list web application built with Next.js, TypeScript, and Supabase.

Browse and search recipes, plan weekly meals, generate smart grocery lists with ingredient merging, and save favorites to a personal cookbook.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Supabase CLI** (`npm install -g supabase`)
- **Git**

### Installation

```bash
# Clone and install dependencies
pnpm install

# Copy environment variables and configure
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials (see Environment Variables below)

# Start Supabase locally
supabase start

# Run database migrations and seed data
pnpm supabase db reset

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `http://localhost:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | From `supabase start` output |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | From `supabase start` output |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

After running `supabase start`, the CLI outputs the anon key and service role key. Copy these into your `.env.local`.

## 📁 Project Structure

```
recipe_planner/
├── app/                    # Next.js App Router (pages & layouts)
│   ├── (auth)/            # Auth route group (login, register)
│   ├── (main)/            # Main route group (with bottom nav)
│   │   ├── recipes/[id]/ # Recipe detail page
│   │   ├── cookbook/      # Personal saved recipes
│   │   ├── planner/      # Meal planner calendar
│   │   ├── grocery/      # Grocery list
│   │   └── profile/      # User profile
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI primitives (Button, Card, Modal, etc.)
│   ├── recipes/          # Recipe discovery & detail components
│   ├── planner/          # Meal planning components
│   ├── grocery/          # Grocery list components
│   ├── navigation/       # Bottom nav, side nav, header
│   └── auth/             # Auth form components
├── lib/                   # Business logic & data layer
│   ├── actions/          # Server Actions (mutations)
│   ├── queries/          # Database queries (reads)
│   ├── supabase/         # Supabase client configuration
│   ├── schemas/          # Zod validation schemas
│   ├── validations/      # Feature-specific validations
│   └── utils/            # Utilities (unit conversion, date helpers, merging)
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── tests/                 # Test files
│   ├── unit/            # Unit tests (Jest + RTL)
│   ├── integration/     # Integration tests (Server Actions + DB)
│   └── e2e/             # E2E tests (Playwright)
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations (immutable)
│   └── config.toml      # Supabase project config
└── specs/                # Feature specifications & design docs
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Unit tests in watch mode
pnpm test:watch

# Unit tests with coverage
pnpm test:coverage

# Integration tests (requires Supabase running)
pnpm test:integration

# E2E tests (requires dev server running)
pnpm test:e2e

# E2E tests with UI mode
pnpm test:e2e:ui

# All tests
pnpm test:all
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` → Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → Your Supabase service role key
   - `NEXT_PUBLIC_APP_URL` → Your production URL
4. Deploy

### Supabase (Production Database)

1. Create a project at [supabase.com](https://supabase.com)
2. Link your local project: `supabase link --project-ref <your-project-ref>`
3. Push migrations: `supabase db push`
4. Apply seed data via the Supabase SQL editor if needed

### Manual Build

```bash
pnpm build    # Build production bundle
pnpm start    # Start production server (port 3000)
```

## 📚 Documentation

- [Feature Specification](./specs/001-recipe-planner-app/spec.md)
- [Technical Plan](./specs/001-recipe-planner-app/plan.md)
- [Data Model](./specs/001-recipe-planner-app/data-model.md)
- [API Contracts](./specs/001-recipe-planner-app/contracts/)
- [Task Breakdown](./specs/001-recipe-planner-app/tasks.md)
- [Research Notes](./specs/001-recipe-planner-app/research.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
- **Language**: TypeScript 5.3+ (strict mode)
- **Database**: Supabase (PostgreSQL 15 with Row Level Security)
- **Auth**: Supabase Auth (email/password)
- **Styling**: TailwindCSS 3.4+ (mobile-first responsive)
- **Testing**: Jest + React Testing Library, Playwright
- **Package Manager**: pnpm

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:integration` | Run integration tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:all` | Run all test suites |

## 🌟 Features

- 🔍 **Recipe Discovery** — Browse trending recipes, search by name, filter by cooking time/calories/rating
- 📖 **Recipe Details** — View ingredients with adjustable servings, step-by-step instructions, nutritional info
- 📅 **Meal Planning** — Weekly calendar with breakfast/lunch/dinner/snack slots, quick notes, daily nutrition summary
- 🛒 **Smart Grocery Lists** — Auto-generated from meal plans with ingredient merging and unit conversion
- 📚 **Personal Cookbook** — Save favorite recipes for quick access
- 🔐 **Authentication** — Email/password with profile management
- 📱 **Mobile-first** — Responsive design (320px+), touch-friendly (44px targets), bottom navigation

## 📄 License

Private project
