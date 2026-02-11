# Recipe Planner - Developer Quickstart Guide

**Feature**: Recipe Planner - Mobile-First Meal Planning & Grocery List App  
**Branch**: `001-recipe-planner-app`  
**Last Updated**: February 11, 2026

## Overview

This guide will help you set up the Recipe Planner development environment and get the application running locally within 15 minutes. The application uses Next.js 14, TypeScript, Supabase, and TailwindCSS.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v20.x LTS or later ([Download](https://nodejs.org/))
- **pnpm**: v8.x or later (recommended) or npm v10.x
  ```bash
  npm install -g pnpm
  ```
- **Git**: [Download](https://git-scm.com/)
- **Supabase CLI**: v1.127.x or later
  ```bash
  npm install -g supabase
  ```
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## Quick Start (5 Minutes)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd recipe-planner

# Checkout feature branch
git checkout 001-recipe-planner-app

# Install dependencies
pnpm install
```

### 2. Set Up Supabase Local Development

```bash
# Initialize Supabase (if not already done)
supabase init

# Start local Supabase instance (PostgreSQL + Auth + Storage)
supabase start
```

This will output important URLs and keys:
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Anon key: <your-anon-key>
Service_role key: <your-service-role-key>
```

### 3. Configure Environment Variables

Create `.env.local` file in project root:

```bash
# Copy example environment file
cp .env.local.example .env.local
```

Edit `.env.local` with values from `supabase start` output:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Development Mode
NODE_ENV=development
```

### 4. Run Database Migrations

```bash
# Apply database schema and seed data
supabase db reset
```

This will:
- Create all tables (recipes, ingredients, meal_plans, etc.)
- Set up Row Level Security policies
- Insert seed data (sample recipes, ingredients, tags)

### 5. Start Development Server

```bash
# Start Next.js dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Recipe Planner home page with sample recipes! 🎉

## Development Workflow

### Project Structure Overview

```
recipe-planner/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages (with bottom nav)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── recipes/          # Recipe-specific components
│   ├── planner/          # Meal planner components
│   └── grocery/          # Grocery list components
├── lib/                   # Business logic & utilities
│   ├── actions/          # Server Actions (mutations)
│   ├── queries/          # Database queries
│   ├── supabase/         # Supabase clients
│   ├── utils/            # Utility functions
│   └── validations/      # Zod schemas
├── hooks/                 # Custom React hooks
├── tests/                 # Test files
├── supabase/             # Supabase config & migrations
│   └── migrations/       # SQL migration files
└── public/               # Static assets
```

### Common Development Tasks

#### 1. Create a New Database Migration

```bash
# Create a new migration file
supabase migration new <migration-name>

# Example: Add a new column
supabase migration new add_featured_flag_to_recipes

# Edit the generated file in supabase/migrations/
# Then apply migrations:
supabase db reset
```

#### 2. Generate TypeScript Types from Database

```bash
# Generate types automatically from Supabase schema
supabase gen types typescript --local > lib/types/database.ts
```

This creates TypeScript types matching your database schema. Re-run whenever schema changes.

#### 3. View Database in Supabase Studio

```bash
# Open Supabase Studio (database GUI)
supabase studio
```

Or visit: [http://localhost:54323](http://localhost:54323)

#### 4. Test Server Actions

Create a test file in `tests/integration/actions/`:

```typescript
// tests/integration/actions/recipes.test.ts
import { searchRecipes } from '@/lib/actions/recipes';

describe('Recipe Actions', () => {
  it('should search recipes by name', async () => {
    const results = await searchRecipes({ query: 'salmon' });
    expect(results.recipes.length).toBeGreaterThan(0);
  });
});
```

Run tests:
```bash
pnpm test
```

#### 5. Run End-to-End Tests

```bash
# Install Playwright browsers (first time only)
pnpm playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode (interactive)
pnpm playwright test --ui
```

#### 6. Lint and Format Code

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues automatically
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check TypeScript types
pnpm type-check
```

### Working with Components

#### Creating a New UI Component

```bash
# Create component file
touch components/ui/button.tsx
```

```typescript
// components/ui/button.tsx
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### Creating a Server Action

```typescript
// lib/actions/recipes.ts
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addRecipeToMealPlan(data: {
  recipeId: string;
  mealDate: string;
  mealType: string;
}) {
  const supabase = createServerSupabaseClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // Insert meal plan entry
  const { data: entry, error } = await supabase
    .from('meal_plan_entries')
    .insert({
      user_id: user.id,
      recipe_id: data.recipeId,
      meal_date: data.mealDate,
      meal_type: data.mealType,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Revalidate meal planner page cache
  revalidatePath('/planner');
  
  return { mealPlanEntry: entry };
}
```

### Database Queries Best Practices

#### Efficient Recipe Query with Joins

```typescript
// lib/queries/recipes.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getRecipeDetail(recipeId: string) {
  const supabase = createServerSupabaseClient();
  
  // Get recipe with ingredients and steps in parallel
  const [recipeResult, ingredientsResult, stepsResult] = await Promise.all([
    supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single(),
    
    supabase
      .from('recipe_ingredients')
      .select(`
        *,
        ingredient:ingredients(name, icon_emoji)
      `)
      .eq('recipe_id', recipeId)
      .order('display_order'),
    
    supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number')
  ]);
  
  if (recipeResult.error) throw recipeResult.error;
  
  return {
    recipe: recipeResult.data,
    ingredients: ingredientsResult.data || [],
    steps: stepsResult.data || [],
  };
}
```

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Integration Tests

```bash
# Run integration tests (with test database)
pnpm test:integration
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests headless
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E test
pnpm playwright test --debug
```

### Manual Testing Checklist

Test these user flows before committing:

- [ ] **Authentication**: Register, sign in, sign out
- [ ] **Recipe Discovery**: Search, filter by tags, view trending
- [ ] **Recipe Detail**: View recipe, adjust servings, save to cookbook
- [ ] **Meal Planning**: Add recipe to meal plan, view weekly calendar
- [ ] **Grocery List**: Generate list, check items, clear completed
- [ ] **Responsive**: Test on mobile (375px), tablet (768px), desktop (1280px)

Use Chrome DevTools Device Mode for mobile testing:
- iPhone 13 (390x844)
- Samsung Galaxy S21 (360x800)
- iPad Pro (1024x1366)

## Debugging

### Debug Server Actions

Add `console.log` in Server Actions or use Supabase Studio to inspect database:

```typescript
'use server';
export async function myAction(data: any) {
  console.log('Action called with:', data);
  
  const result = await supabase.from('table').select();
  console.log('Query result:', result);
  
  return result;
}
```

Check terminal running `pnpm dev` for server-side logs.

### Debug Client Components

Use React DevTools browser extension:
1. Install [React DevTools](https://react.dev/learn/react-developer-tools)
2. Open browser DevTools → React tab
3. Inspect component props and state

### Debug Database Queries

View SQL queries in Supabase Studio:
1. Open [http://localhost:54323](http://localhost:54323)
2. Go to SQL Editor
3. Run queries manually to test

Or use PostgreSQL CLI:
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### Common Issues & Solutions

#### Issue: "Supabase is not running"

```bash
# Check Supabase status
supabase status

# If not running, start it
supabase start
```

#### Issue: "Auth session not found"

Clear cookies and sign in again:
1. Open DevTools → Application → Cookies
2. Delete all cookies for `localhost:3000`
3. Refresh page and sign in

#### Issue: "Database migration failed"

```bash
# Reset database to clean state
supabase db reset

# Or revert last migration
supabase migration down
```

#### Issue: Environment variables not loading

- Restart Next.js dev server after changing `.env.local`
- Ensure variable names start with `NEXT_PUBLIC_` for client-side access
- Check for typos in variable names

## Deployment Preparation

### Deploy to Vercel + Supabase Cloud

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note the project URL and anon key

2. **Push Local Migrations to Cloud**:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

3. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

4. **Set Production Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Useful Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Check TypeScript types |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `supabase start` | Start local Supabase |
| `supabase stop` | Stop local Supabase |
| `supabase status` | Check Supabase status |
| `supabase db reset` | Reset database with migrations |
| `supabase gen types typescript --local` | Generate database types |
| `supabase migration new <name>` | Create new migration |

## Resources & Documentation

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **TailwindCSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Playwright Docs**: [playwright.dev](https://playwright.dev)
- **Project Specs**: [specs/001-recipe-planner-app/spec.md](./spec.md)
- **Data Model**: [specs/001-recipe-planner-app/data-model.md](./data-model.md)
- **API Contracts**: [specs/001-recipe-planner-app/contracts/](./contracts/)

## Getting Help

- **Check existing specs**: Start with [spec.md](./spec.md), [plan.md](./plan.md), and [research.md](./research.md)
- **Review API contracts**: Check [contracts/](./contracts/) for endpoint documentation
- **Inspect database**: Use Supabase Studio at [localhost:54323](http://localhost:54323)
- **Ask in team chat**: Include error messages and what you've tried
- **Create issue**: For bugs or feature requests

## Next Steps

After getting the app running:

1. ✅ Familiarize yourself with the [project structure](#project-structure-overview)
2. ✅ Review the [spec.md](./spec.md) to understand requirements
3. ✅ Check the [data-model.md](./data-model.md) for database schema
4. ✅ Explore [API contracts](./contracts/) for endpoints
5. ✅ Run tests to ensure everything works: `pnpm test && pnpm test:e2e`
6. ✅ Pick a user story from spec.md and start implementing!

Happy coding! 🚀
