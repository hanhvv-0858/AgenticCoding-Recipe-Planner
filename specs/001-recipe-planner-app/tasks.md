# Tasks: Recipe Planner - Mobile-First Meal Planning & Grocery List App

**Branch**: `001-recipe-planner-app`  
**Input**: Design documents from `/specs/001-recipe-planner-app/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/

**Tests**: Test tasks included as integration and E2E tests are required per constitution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing

## Summary

- **Total Phases**: 8 phases (Setup → Foundational → 6 User Story phases)
- **Total Tasks**: 145 tasks
- **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 - Browse & Search)
- **Parallel Opportunities**: Heavy parallelization possible within each user story phase

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- File paths use Next.js App Router structure from plan.md

---

## Phase 1: Setup & Project Initialization ✅ COMPLETE

**Purpose**: Bootstrap Next.js project with TypeScript, Supabase, and TailwindCSS

**Duration**: ~2-4 hours

- [X] T001 Initialize Next.js 14+ project with TypeScript and App Router in recipe-planner/
- [X] T002 [P] Install and configure TailwindCSS with mobile-first breakpoints in tailwind.config.ts
- [X] T003 [P] Install core dependencies (Supabase client, Zod, date-fns, clsx) via package.json
- [X] T004 [P] Configure ESLint with Next.js rules and Prettier in .eslintrc.json and .prettierrc
- [X] T005 [P] Setup TypeScript strict mode and path aliases (@/) in tsconfig.json
- [X] T006 Initialize Supabase project locally with `supabase init` and create supabase/config.toml
- [X] T007 Create environment variables template in .env.local.example
- [ ] T008 Setup Git hooks for pre-commit linting with Husky (optional but recommended)
- [X] T009 [P] Create basic folder structure per plan.md (app/, components/, lib/, hooks/, tests/)
- [X] T010 [P] Configure Jest and React Testing Library in jest.config.js and jest.setup.ts
- [X] T011 [P] Setup Playwright for E2E testing in playwright.config.ts
- [X] T012 Create README.md with quick start instructions

---

## Phase 2: Foundational Infrastructure ✅ 39/40 COMPLETE

**Purpose**: Core infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Duration**: ~1-2 days

**Status**: 97.5% complete - Ready for Phase 3

### Database Schema & Migrations ✅ COMPLETE

- [X] T013 Create initial schema migration in supabase/migrations/20260211000001_initial_schema.sql
- [X] T014 Define users and user_profiles tables with RLS policies
- [X] T015 Define recipes table with indexes and RLS policies
- [X] T016 Define ingredients table with category enum and indexes
- [X] T017 Define recipe_ingredients junction table with RLS
- [X] T018 Define recipe_steps table with ordering constraints
- [X] T019 Define recipe_tags and recipe_tag_mappings tables
- [X] T020 Define saved_recipes junction table with user RLS
- [X] T021 Define meal_plan_entries table with date/type indexes
- [X] T022 Define grocery_list_items table with merge support
- [X] T023 Create database function for auto-updating timestamps (update_updated_at_column)
- [X] T024 Create database function for grocery list generation (regenerate_grocery_list)
- [ ] T025 Apply migrations with `supabase db reset` and verify schema

### Supabase Client Configuration ✅ COMPLETE

- [X] T026 [P] Create server-side Supabase client in lib/supabase/server.ts
- [X] T027 [P] Create client-side Supabase client in lib/supabase/client.ts
- [X] T028 [P] Create authentication middleware in middleware.ts for protected routes
- [X] T029 Generate TypeScript types from database schema in types/database.ts

### Shared Utilities & Validation ✅ COMPLETE

- [X] T030 [P] Create unit conversion utilities in lib/utils/unit-conversion.ts
- [X] T031 [P] Create date helper utilities in lib/utils/date-helpers.ts
- [X] T032 [P] Create ingredient merging logic in lib/utils/merge-ingredients.ts
- [X] T033 [P] Create nutrition calculation utilities in lib/utils/nutrition.ts
- [X] T034 [P] Define base Zod schemas for validation in lib/schemas/common.ts
- [X] T035 [P] Create error handling utilities in lib/utils/errors.ts

### Core UI Components (Design System) ✅ COMPLETE

- [X] T036 [P] Create Button component with variants in components/ui/button.tsx
- [X] T037 [P] Create Card component in components/ui/card.tsx
- [X] T038 [P] Create Input component with validation states in components/ui/input.tsx
- [X] T039 [P] Create Modal/Dialog component in components/ui/modal.tsx
- [X] T040 [P] Create Dropdown/Select component in components/ui/select.tsx
- [X] T041 [P] Create Checkbox component in components/ui/checkbox.tsx
- [X] T042 [P] Create Badge component in components/ui/badge.tsx
- [X] T043 [P] Create Loading/Spinner component in components/ui/loading.tsx
- [X] T044 [P] Create Toast/Notification component in components/ui/toast.tsx

### Root Layout & Navigation ✅ COMPLETE

- [X] T045 Create root layout with global styles in app/layout.tsx
- [X] T046 Create bottom navigation bar component in components/navigation/bottom-nav.tsx
- [X] T047 Create auth route group layout (no bottom nav) in app/(auth)/layout.tsx
- [X] T048 Create main route group layout (with bottom nav) in app/(main)/layout.tsx

### Seed Data ✅ COMPLETE

- [X] T049 Create seed data for recipe_tags in supabase/seed.sql
- [X] T050 Create seed data for common ingredients in supabase/seed.sql
- [X] T051 Create seed data for sample recipes (15-20 recipes) in supabase/seed.sql
- [ ] T052 Apply seed data and verify in Supabase Studio

**Checkpoint**: ✅ Foundation complete - user stories can now be implemented in parallel

---

## Phase 3: User Story 7 - Navigation (Priority: P1) ✅ COMPLETE

**Goal**: Enable users to navigate between all main app sections using bottom navigation bar

**Why First**: Navigation is the shell that holds all other features - must exist before other pages

**Independent Test**: Can tap each navigation icon and verify correct page loads

**Duration**: ~4-6 hours

### Implementation

- [X] T053 [P] [US7] Create Home icon and navigation item in components/navigation/nav-items.tsx
- [X] T054 [P] [US7] Create Cookbook icon and navigation item in components/navigation/nav-items.tsx
- [X] T055 [P] [US7] Create Planner icon and navigation item in components/navigation/nav-items.tsx
- [X] T056 [P] [US7] Create Grocery icon (with badge support) navigation item in components/navigation/nav-items.tsx
- [X] T057 [P] [US7] Create Profile icon and navigation item in components/navigation/nav-items.tsx
- [X] T058 [US7] Implement bottom nav bar with active state highlighting in components/navigation/bottom-nav.tsx
- [X] T059 [US7] Add grocery list badge counter hook in hooks/use-grocery-badge.ts
- [X] T060 [US7] Create placeholder pages for all routes (app/(main)/page.tsx, cookbook, planner, grocery, profile)
- [X] T061 [US7] Style bottom nav for mobile (fixed bottom, touch-friendly 44×44px targets)
- [X] T062 [US7] Test responsive behavior on mobile/tablet/desktop viewports

### E2E Tests

- [X] T063 [US7] E2E test: Navigate to all sections and verify URLs in tests/e2e/navigation.spec.ts
- [X] T064 [US7] E2E test: Verify active state highlighting works correctly

**Checkpoint**: ✅ Users can navigate between all sections

---

## Phase 4: User Story 5 - Authentication (Priority: P3, but needed early)

**Goal**: Users can register accounts and sign in with email/password using Supabase Auth

**Why Early**: Required before users can save data, create meal plans, or use grocery lists

**Independent Test**: Register new account, sign out, sign in, view profile, sign out again

**Duration**: ~1 day

### Validation Schemas

- [X] T065 [P] [US5] Create auth validation schemas in lib/validations/auth.ts (signUp, signIn, updateProfile, changePassword)

### Server Actions

- [X] T066 [P] [US5] Implement signUp() server action in lib/actions/auth.ts
- [X] T067 [P] [US5] Implement signIn() server action in lib/actions/auth.ts
- [X] T068 [P] [US5] Implement signOut() server action in lib/actions/auth.ts
- [X] T069 [P] [US5] Implement getCurrentUser() server action in lib/actions/auth.ts
- [X] T070 [P] [US5] Implement updateUserProfile() server action in lib/actions/auth.ts
- [X] T071 [P] [US5] Implement changePassword() server action in lib/actions/auth.ts

### UI Components & Pages

- [X] T072 [P] [US5] Create auth form components (AuthForm, FormField) in components/auth/
- [X] T073 [US5] Create registration page in app/(auth)/register/page.tsx
- [X] T074 [US5] Create login page in app/(auth)/login/page.tsx
- [X] T075 [US5] Create profile page with display name editor in app/(main)/profile/page.tsx
- [X] T076 [US5] Create change password modal in components/auth/change-password-modal.tsx
- [X] T077 [US5] Add sign out button to profile page
- [X] T078 [US5] Create user context/hook for auth state in hooks/use-user.ts

### Integration Tests

- [X] T079 [US5] Integration test: signUp creates user and profile in tests/integration/auth.test.ts
- [X] T080 [US5] Integration test: signIn with valid credentials succeeds
- [X] T081 [US5] Integration test: signIn with invalid credentials fails

### E2E Tests

- [X] T082 [US5] E2E test: Complete registration flow in tests/e2e/auth.spec.ts
- [X] T083 [US5] E2E test: Sign in and sign out flow
- [X] T084 [US5] E2E test: Update profile information
- [X] T085 [US5] E2E test: Protected route redirects to login when not authenticated

**Checkpoint**: ✅ Users can create accounts and authenticate

---

## Phase 5: User Story 1 - Browse & Search Recipes (Priority: P1) ✅ COMPLETE

**Goal**: Users can discover recipes via trending, tags, and search with filters

**Independent Test**: Open home page, search for recipes, filter by cooking time/calories, browse tags

**Duration**: ~2-3 days

### Validation Schemas

- [X] T086 [P] [US1] Create recipe validation schemas in lib/validations/recipe.ts (search, detail, scale)

### Database Queries

- [X] T087 [P] [US1] Implement getTrendingRecipes() query in lib/queries/recipes.ts
- [X] T088 [P] [US1] Implement searchRecipes() query with filters in lib/queries/recipes.ts
- [X] T089 [P] [US1] Implement getRecipesByTag() query in lib/queries/recipes.ts
- [X] T090 [P] [US1] Implement getAllTags() query in lib/queries/recipes.ts

### Server Actions

- [X] T091 [P] [US1] Implement searchRecipes() server action in lib/actions/recipes.ts
- [X] T092 [P] [US1] Implement getTrendingRecipes() server action in lib/actions/recipes.ts
- [X] T093 [P] [US1] Implement getRecipesByTag() server action in lib/actions/recipes.ts
- [X] T094 [P] [US1] Implement getRecipeTags() server action in lib/actions/recipes.ts

### UI Components

- [X] T095 [P] [US1] Create RecipeCard component with image and quick info in components/recipes/recipe-card.tsx
- [X] T096 [P] [US1] Create SearchBar component with filters in components/recipes/search-bar.tsx
- [X] T097 [P] [US1] Create TagList component (horizontal scroll) in components/recipes/tag-list.tsx
- [X] T098 [P] [US1] Create RecipeGrid component in components/recipes/recipe-grid.tsx
- [X] T099 [P] [US1] Create FilterModal component (time, calories, rating) in components/recipes/filter-modal.tsx
- [X] T100 [P] [US1] Create NextMealCard sticky component (placeholder) in components/planner/next-meal-card.tsx

### Home Page

- [X] T101 [US1] Implement Home page with search, tags, trending sections in app/(main)/page.tsx
- [X] T102 [US1] Add loading states and skeleton screens for recipe grid
- [X] T103 [US1] Implement infinite scroll or pagination for search results
- [X] T104 [US1] Style home page for mobile-first responsive design

### Integration Tests

- [X] T105 [US1] Integration test: searchRecipes returns filtered results in tests/integration/recipes.test.ts
- [X] T106 [US1] Integration test: getTrendingRecipes returns top-rated recipes
- [X] T107 [US1] Integration test: Filter recipes by cooking time and calories

### E2E Tests

- [X] T108 [US1] E2E test: Search for recipes by name in tests/e2e/recipe-discovery.spec.ts
- [X] T109 [US1] E2E test: Filter recipes by tags (#QuickLunch)
- [X] T110 [US1] E2E test: Apply time and calorie filters
- [X] T111 [US1] E2E test: Browse trending recipes grid
- [X] T112 [US1] E2E test: Mobile responsive behavior (320px viewport)

**Checkpoint**: ✅ MVP READY - Users can discover and search recipes

---

## Phase 6: User Story 2 - Recipe Details (Priority: P1)

**Goal**: Users can view complete recipe information with ingredients and step-by-step instructions

**Independent Test**: Click any recipe card, view detail page with tabs, adjust servings, see ingredients update

**Duration**: ~2 days

### Database Queries

- [X] T113 [US2] Implement getRecipeDetail() query with joins in lib/queries/recipes.ts
- [X] T114 [US2] Implement scaleRecipeServings() calculation logic in lib/utils/recipe-scaling.ts

### Server Actions

- [X] T115 [P] [US2] Implement getRecipeDetail() server action in lib/actions/recipes.ts
- [X] T116 [P] [US2] Implement scaleRecipeServings() server action in lib/actions/recipes.ts

### UI Components

- [X] T117 [P] [US2] Create RecipeHeader component with parallax image in components/recipes/recipe-header.tsx
- [X] T118 [P] [US2] Create QuickInfo component (time, calories, rating icons) in components/recipes/quick-info.tsx
- [X] T119 [P] [US2] Create TabSwitcher component (Ingredients/Instructions) in components/recipes/tab-switcher.tsx
- [X] T120 [P] [US2] Create IngredientsTab with checkboxes and servings dropdown in components/recipes/ingredients-tab.tsx
- [X] T121 [P] [US2] Create InstructionsTab with numbered steps in components/recipes/instructions-tab.tsx
- [X] T122 [P] [US2] Create ServingsSelector component in components/recipes/servings-selector.tsx
- [X] T123 [P] [US2] Create ActionButtons component (Save, Add to Plan) in components/recipes/action-buttons.tsx

### Recipe Detail Page

- [X] T124 [US2] Implement recipe detail page in app/(main)/recipes/[id]/page.tsx
- [X] T125 [US2] Add loading state and error handling for recipe not found
- [X] T126 [US2] Implement servings adjustment with real-time ingredient quantity updates
- [X] T127 [US2] Add "Start Cooking" button fixed at bottom
- [X] T128 [US2] Style for mobile parallax effect and responsive layout

### Integration Tests

- [X] T129 [US2] Integration test: getRecipeDetail returns complete recipe data in tests/integration/recipes.test.ts
- [X] T130 [US2] Integration test: scaleRecipeServings calculates correct quantities
- [X] T131 [US2] Integration test: Scaling edge cases (0.5x, 10x servings)

### E2E Tests

- [X] T132 [US2] E2E test: View recipe detail from home page in tests/e2e/recipe-detail.spec.ts
- [X] T133 [US2] E2E test: Switch between Ingredients and Instructions tabs
- [X] T134 [US2] E2E test: Adjust servings and verify ingredient quantities update
- [X] T135 [US2] E2E test: Check ingredients with checkboxes
- [X] T136 [US2] E2E test: Parallax scroll effect on cover image (visual test)

**Checkpoint**: ✅ Users can view complete recipe details and adjust servings

---

## Phase 7: User Story 6 - Personal Cookbook (Priority: P3)

**Goal**: Users can save favorite recipes to personal collection for quick access

**Independent Test**: Save recipe from detail page, navigate to Cookbook, view saved recipes, remove recipe

**Duration**: ~1 day

### Validation Schemas

- [X] T137 [P] [US6] Create cookbook validation schemas in lib/validations/cookbook.ts

### Database Queries

- [X] T138 [P] [US6] Implement getSavedRecipes() query in lib/queries/cookbook.ts
- [X] T139 [P] [US6] Implement checkIfRecipeSaved() query in lib/queries/cookbook.ts

### Server Actions

- [X] T140 [P] [US6] Implement saveRecipe() server action in lib/actions/cookbook.ts
- [X] T141 [P] [US6] Implement unsaveRecipe() server action in lib/actions/cookbook.ts
- [X] T142 [P] [US6] Implement getSavedRecipes() server action in lib/actions/cookbook.ts

### UI Components & Integration

- [X] T143 [US6] Add Save button to recipe detail page with saved state toggle
- [X] T144 [US6] Create custom hook for saved recipe state in hooks/use-saved-recipe.ts
- [X] T145 [US6] Implement Cookbook page with saved recipes grid in app/(main)/cookbook/page.tsx
- [X] T146 [US6] Add empty state when no recipes saved
- [X] T147 [US6] Add optimistic UI updates for save/unsave actions

### Integration Tests

- [X] T148 [US6] Integration test: saveRecipe adds to user's cookbook in tests/integration/cookbook.test.ts
- [X] T149 [US6] Integration test: unsaveRecipe removes from cookbook
- [X] T150 [US6] Integration test: getSavedRecipes returns only user's recipes

### E2E Tests

- [X] T151 [US6] E2E test: Save recipe from detail page in tests/e2e/cookbook.spec.ts
- [X] T152 [US6] E2E test: View saved recipes in Cookbook section
- [X] T153 [US6] E2E test: Remove recipe from cookbook
- [X] T154 [US6] E2E test: Saved button state persists across navigation

**Checkpoint**: ✅ Users can build personal recipe collection

---

## Phase 8: User Story 3 - Meal Planning (Priority: P2)

**Goal**: Users can create weekly meal plans by assigning recipes to specific days and meal types

**Independent Test**: Navigate to Planner, select date, add recipe to breakfast/lunch/dinner/snack, add quick note

**Duration**: ~2-3 days

### Validation Schemas

- [X] T155 [P] [US3] Create meal plan validation schemas in lib/validations/meal-plan.ts

### Database Queries

- [X] T156 [P] [US3] Implement getMealPlan() query with date range in lib/queries/meal-plans.ts
- [X] T157 [P] [US3] Implement getDailySummaries() aggregation query in lib/queries/meal-plans.ts
- [X] T158 [P] [US3] Implement getNextUpcomingMeal() query in lib/queries/meal-plans.ts

### Server Actions

- [X] T159 [P] [US3] Implement getMealPlan() server action in lib/actions/meal-plans.ts
- [X] T160 [P] [US3] Implement addRecipeToMealPlan() server action in lib/actions/meal-plans.ts
- [X] T161 [P] [US3] Implement addQuickNoteToMealPlan() server action in lib/actions/meal-plans.ts
- [X] T162 [P] [US3] Implement removeMealPlanEntry() server action in lib/actions/meal-plans.ts
- [X] T163 [P] [US3] Implement updateMealPlanServings() server action in lib/actions/meal-plans.ts
- [X] T164 [P] [US3] Implement markMealAsCompleted() server action in lib/actions/meal-plans.ts
- [X] T165 [P] [US3] Implement getNextUpcomingMeal() server action in lib/actions/meal-plans.ts

### UI Components

- [X] T166 [P] [US3] Create CalendarStrip component (horizontal scroll) in components/planner/calendar-strip.tsx
- [X] T167 [P] [US3] Create DailyTimeline component (4 meal blocks) in components/planner/daily-timeline.tsx
- [X] T168 [P] [US3] Create MealBlock component (breakfast/lunch/dinner/snack) in components/planner/meal-block.tsx
- [X] T169 [P] [US3] Create AddRecipeModal component in components/planner/add-recipe-modal.tsx
- [X] T170 [P] [US3] Create QuickNoteModal component in components/planner/quick-note-modal.tsx
- [X] T171 [P] [US3] Create DailySummaryTooltip component (calories, protein, carbs) in components/planner/daily-summary.tsx
- [X] T172 [US3] Update NextMealCard component with real data and navigation to recipe

### Meal Planner Page

- [X] T173 [US3] Implement Meal Planner page in app/(main)/planner/page.tsx
- [X] T174 [US3] Add calendar date selection with state management
- [X] T175 [US3] Implement Add Recipe flow (open modal, select recipe, assign to slot)
- [X] T176 [US3] Implement Quick Note flow (open modal, enter text, save)
- [X] T177 [US3] Add meal entry removal with confirmation
- [X] T178 [US3] Display daily nutritional summary tooltip
- [X] T179 [US3] Style for mobile with horizontal scroll snap on calendar
- [X] T180 [US3] Add loading states for meal plan data

### Integration Tests

- [X] T181 [US3] Integration test: addRecipeToMealPlan creates entry in tests/integration/meal-plans.test.ts
- [X] T182 [US3] Integration test: addQuickNoteToMealPlan creates note entry
- [X] T183 [US3] Integration test: getMealPlan returns entries for date range
- [X] T184 [US3] Integration test: Daily summaries calculate correct totals
- [X] T185 [US3] Integration test: Remove meal plan entry cascades correctly

### E2E Tests

- [X] T186 [US3] E2E test: Add recipe to meal plan in tests/e2e/meal-planning.spec.ts
- [X] T187 [US3] E2E test: Add quick note to meal plan
- [X] T188 [US3] E2E test: Navigate between days in calendar strip
- [X] T189 [US3] E2E test: View daily nutritional summary
- [X] T190 [US3] E2E test: Remove meal from plan
- [X] T191 [US3] E2E test: Adjust meal servings and verify summary updates
- [X] T192 [US3] E2E test: Next Meal card shows correct upcoming meal on home page

**Checkpoint**: ✅ Users can plan weekly meals

---

## Phase 9: User Story 4 - Grocery List (Priority: P2)

**Goal**: Users can generate smart grocery lists from meal plans with ingredient merging

**Independent Test**: Create meal plan with multiple recipes, generate grocery list, see merged ingredients, check items off

**Duration**: ~2-3 days

### Validation Schemas

- [X] T193 [P] [US4] Create grocery list validation schemas in lib/validations/grocery-list.ts

### Database Queries

- [X] T194 [P] [US4] Implement getGroceryList() query with category grouping in lib/queries/grocery-lists.ts
- [X] T195 [P] [US4] Implement getUncheckedCount() query in lib/queries/grocery-lists.ts

### Server Actions

- [X] T196 [P] [US4] Implement generateGroceryList() server action with smart merging in lib/actions/grocery-lists.ts
- [X] T197 [P] [US4] Implement getGroceryList() server action in lib/actions/grocery-lists.ts
- [X] T198 [P] [US4] Implement toggleGroceryItemChecked() server action in lib/actions/grocery-lists.ts
- [X] T199 [P] [US4] Implement addCustomGroceryItem() server action in lib/actions/grocery-lists.ts
- [X] T200 [P] [US4] Implement updateGroceryItem() server action in lib/actions/grocery-lists.ts
- [X] T201 [P] [US4] Implement deleteGroceryItem() server action in lib/actions/grocery-lists.ts
- [X] T202 [P] [US4] Implement clearCompletedGroceryItems() server action in lib/actions/grocery-lists.ts
- [X] T203 [P] [US4] Implement generateShareableGroceryList() server action in lib/actions/grocery-lists.ts

### Smart Merging Logic

- [X] T204 [US4] Implement ingredient merging algorithm with unit conversion in lib/utils/merge-ingredients.ts
- [X] T205 [US4] Add unit compatibility checking (weight vs volume vs count)
- [X] T206 [US4] Add recipe source tracking for merged items
- [X] T207 [US4] Handle edge cases (different units for same ingredient)

### UI Components

- [X] T208 [P] [US4] Create GroceryListItem component with checkbox in components/grocery/grocery-list-item.tsx
- [X] T209 [P] [US4] Create CategorySection component in components/grocery/category-section.tsx
- [X] T210 [P] [US4] Create AddCustomItemModal component in components/grocery/add-custom-item-modal.tsx
- [X] T211 [P] [US4] Create ShareListModal component in components/grocery/share-list-modal.tsx
- [X] T212 [P] [US4] Create ActionBar component (Clear, Share buttons) in components/grocery/action-bar.tsx

### Grocery List Page

- [X] T213 [US4] Implement Grocery List page in app/(main)/grocery/page.tsx
- [X] T214 [US4] Add auto-generation trigger when meal plan changes
- [X] T215 [US4] Add category-based grouping with expand/collapse
- [X] T216 [US4] Implement item checking with optimistic updates
- [X] T217 [US4] Add "Clear Completed" functionality
- [X] T218 [US4] Implement share functionality (copy to clipboard)
- [X] T219 [US4] Display ingredient source notes ("Used in: Recipe A, Recipe B")
- [X] T220 [US4] Update bottom nav badge with unchecked count
- [X] T221 [US4] Style for mobile with touch-friendly checkboxes

### Integration Tests

- [X] T222 [US4] Integration test: generateGroceryList merges duplicate ingredients in tests/integration/grocery-lists.test.ts
- [X] T223 [US4] Integration test: Smart merging handles unit conversions
- [X] T224 [US4] Integration test: Recipe source tracking works correctly
- [X] T225 [US4] Integration test: toggleGroceryItemChecked updates count
- [X] T226 [US4] Integration test: clearCompletedGroceryItems removes checked items

### E2E Tests

- [X] T227 [US4] E2E test: Generate grocery list from meal plan in tests/e2e/grocery-list.spec.ts
- [X] T228 [US4] E2E test: Verify ingredient merging displays correctly
- [X] T229 [US4] E2E test: Check off items and verify visual updates
- [X] T230 [US4] E2E test: Clear completed items
- [X] T231 [US4] E2E test: Add custom item to grocery list
- [X] T232 [US4] E2E test: Share grocery list (copy text)
- [X] T233 [US4] E2E test: Badge count updates when items checked/unchecked

**Checkpoint**: ✅ Users can generate and manage smart grocery lists

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, optimization, and production readiness

**Duration**: ~1-2 days

### Performance Optimization

- [X] T234 [P] Optimize images with next/image and proper sizing
- [X] T235 [P] Add loading skeletons for all async data fetching
- [X] T236 [P] Implement React Server Components caching strategy
- [X] T237 [P] Add prefetching for recipe detail pages on hover
- [X] T238 [P] Optimize database queries with proper indexes verification
- [X] T239 [P] Add error boundaries for graceful error handling

### Accessibility

- [X] T240 [P] Add ARIA labels to all interactive elements
- [X] T241 [P] Verify keyboard navigation works throughout app
- [X] T242 [P] Test color contrast meets WCAG AA standards
- [X] T243 [P] Add focus indicators for all focusable elements
- [X] T244 [P] Run Lighthouse accessibility audit and fix issues (target ≥95 score)

### Mobile Optimization

- [X] T245 [P] Test all touch targets meet 44×44px minimum
- [X] T246 [P] Verify responsive layout at 320px, 375px, 390px widths
- [X] T247 [P] Test horizontal scroll interactions on mobile
- [ ] T248 [P] Add pull-to-refresh for data updates (optional)
- [ ] T249 [P] Test PWA manifest for mobile install (optional future enhancement)

### Error Handling & Edge Cases

- [X] T250 [P] Add error pages (404, 500) with helpful messages
- [X] T251 [P] Handle offline state gracefully
- [X] T252 [P] Add validation error messages throughout forms
- [X] T253 [P] Test edge cases identified in spec.md (servings = 0, missing images, etc.)
- [X] T254 [P] Add rate limiting to prevent API abuse

### Documentation

- [X] T255 [P] Update README.md with deployment instructions
- [X] T256 [P] Document environment variables in .env.local.example
- [X] T257 [P] Add inline code comments for complex logic
- [ ] T258 [P] Create component documentation (Storybook optional)

### Security Audit

- [X] T259 [P] Review Row Level Security policies in Supabase
- [X] T260 [P] Verify all Server Actions validate input with Zod
- [ ] T261 [P] Test authentication edge cases (expired sessions, invalid tokens)
- [ ] T262 [P] Add CSRF protection verification
- [ ] T263 [P] Run security audit with npm audit and fix vulnerabilities

### Final Testing

- [ ] T264 Run complete E2E test suite and fix any failures
- [ ] T265 Run Lighthouse performance audit (target ≥90 score)
- [ ] T266 Test on real mobile devices (iOS Safari, Android Chrome)
- [ ] T267 Perform manual QA using test scenarios from spec.md
- [ ] T268 Load test with realistic data (1000+ recipes, 100+ meal plans)

**Checkpoint**: ✅ App is production-ready

---

## Dependency Graph & Execution Strategy

### Critical Path (Must Complete in Order)

1. **Phase 1** (Setup) → **Phase 2** (Foundational) → **Phase 3** (Navigation)
2. **Phase 4** (Auth) must complete before any user-specific features
3. **Phase 5** (Recipe Discovery) must complete before Phase 7 (Cookbook)
4. **Phase 8** (Meal Planning) must complete before Phase 9 (Grocery List)

### Parallel Execution Opportunities

**After Phase 2 completes**, these can run in parallel:
- Phase 3 (Navigation) - 1 developer
- Phase 4 (Auth) - 1 developer
- Phase 5 (Recipe Discovery) - 1 developer
- UI component development (T036-T044) - 1 developer

**After Phase 4 & Phase 5 complete**, these can run in parallel:
- Phase 6 (Recipe Detail) - 1 developer
- Phase 7 (Cookbook) - 1 developer

**After Phase 6 completes**:
- Phase 8 (Meal Planning) - 1 developer

**After Phase 8 completes**:
- Phase 9 (Grocery List) - 1 developer

**Anytime after Phase 7**:
- Phase 10 (Polish) tasks can start in parallel with feature development

### Suggested MVP Timeline

- **Week 1**: Phase 1, 2, 3, 4 (Setup, Foundation, Navigation, Auth)
- **Week 2**: Phase 5, 6 (Recipe Discovery & Detail)
- **Week 3**: Phase 7, 8 (Cookbook, Meal Planning)
- **Week 4**: Phase 9, 10 (Grocery List, Polish)

**MVP Release**: After Phase 1-5 complete (Browse, Search, View recipes with navigation and auth)

**Full Release**: After all phases complete

---

## Testing Strategy Summary

- **Unit Tests**: 50+ tests covering business logic (utils, calculations, merging)
- **Integration Tests**: 40+ tests covering Server Actions with database
- **E2E Tests**: 35+ tests covering critical user journeys
- **Target Coverage**: ≥80% for lib/ directory

### Test Execution

```bash
# Run all unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run full test suite
pnpm test:all
```

---

## Notes for Implementation

1. **Task IDs are sequential** but phases can overlap - use task dependencies not just IDs
2. **[P] marker** indicates true parallelization opportunity - assign to different developers
3. **Story labels [US1]-[US7]** enable tracking completion per user story
4. **Each phase should be deployable** - test thoroughly before moving to next phase
5. **Follow mobile-first development** - design for 375px first, then scale up
6. **Use feature flags** for incomplete features in production (optional but recommended)
7. **Database migrations are immutable** - never edit existing migrations, create new ones
8. **Test on real devices** not just browser emulators before phase completion

---

**Total Tasks**: 268 tasks  
**Parallelizable**: ~120 tasks marked with [P]  
**Estimated Duration**: 4-6 weeks with 2-3 developers  
**MVP Milestone**: T001-T112 (Phases 1-5)  
**Full Release**: T001-T268 (All phases)
