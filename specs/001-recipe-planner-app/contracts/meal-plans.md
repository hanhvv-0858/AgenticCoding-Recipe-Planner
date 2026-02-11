# Meal Planning API Contracts

**Feature**: Recipe Planner - Meal Planning & Calendar  
**Type**: Next.js Server Actions  
**Date**: February 11, 2026

## Overview

This document defines the API contracts for meal planning operations including viewing weekly meal plans, adding/removing recipes to meal slots, managing quick notes, and calculating daily nutritional summaries.

## Server Actions

### 1. Get Meal Plan for Date Range

**Purpose**: Retrieve user's meal plan entries for a specific date range (typically 7 days)

**Type**: Server Action  
**Function**: `getMealPlan()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  startDate: string;  // ISO date format (YYYY-MM-DD)
  endDate: string;    // ISO date format (YYYY-MM-DD)
}
```

**Output Schema**:
```typescript
{
  mealPlan: Array<{
    id: string;
    mealDate: string;           // ISO date (YYYY-MM-DD)
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    servings: number;
    isCompleted: boolean;
    recipe: {
      id: string;
      name: string;
      coverImageUrl: string;
      cookingTimeMinutes: number;
      caloriesPerServing: number;
      proteinGrams: number;
      carbsGrams: number;
    } | null;
    quickNote: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  dailySummaries: Record<string, {  // Keyed by date (YYYY-MM-DD)
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    mealCount: number;
  }>;
}
```

**Validation Rules**:
- `startDate`: Must be valid ISO date format
- `endDate`: Must be valid ISO date format
- `endDate` must be >= `startDate`
- Date range must not exceed 90 days

**Business Logic**:
- Only returns meal plans for authenticated user (via auth.uid())
- Daily summaries calculated by summing nutritional values from all meals on each date
- For scaled recipes: nutrition = (recipe_nutrition / recipe.servings) * meal_entry.servings

**Error Responses**:
- `400`: Invalid date format or date range
- `401`: User not authenticated
- `500`: Database query error

---

### 2. Add Recipe to Meal Plan

**Purpose**: Add a recipe to a specific meal slot in the user's meal plan

**Type**: Server Action  
**Function**: `addRecipeToMealPlan()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  recipeId: string;
  mealDate: string;     // ISO date (YYYY-MM-DD)
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings?: number;    // Optional, defaults to recipe's default servings
}
```

**Output Schema**:
```typescript
{
  mealPlanEntry: {
    id: string;
    recipeId: string;
    recipeName: string;
    mealDate: string;
    mealType: string;
    servings: number;
    createdAt: string;
  };
}
```

**Validation Rules**:
- `recipeId`: Must be valid UUID and recipe must exist
- `mealDate`: Must be valid ISO date, cannot be more than 1 year in the past
- `mealType`: Must be one of: breakfast, lunch, dinner, snack
- `servings`: Must be positive integer between 1 and 100 if provided

**Side Effects**:
- Triggers grocery list regeneration for affected date range
- Recipe added replaces any existing recipe in the same meal slot

**Error Responses**:
- `400`: Invalid input (bad UUID, invalid date/type)
- `401`: User not authenticated
- `404`: Recipe not found or not accessible
- `500`: Database insert error

---

### 3. Add Quick Note to Meal Plan

**Purpose**: Add a free-form text note to a meal slot without a recipe

**Type**: Server Action  
**Function**: `addQuickNoteToMealPlan()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  quickNote: string;
  mealDate: string;     // ISO date (YYYY-MM-DD)
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}
```

**Output Schema**:
```typescript
{
  mealPlanEntry: {
    id: string;
    quickNote: string;
    mealDate: string;
    mealType: string;
    createdAt: string;
  };
}
```

**Validation Rules**:
- `quickNote`: Required, max length 500 characters, min 1 character (trimmed)
- `mealDate`: Must be valid ISO date
- `mealType`: Must be one of: breakfast, lunch, dinner, snack

**Business Logic**:
- Quick notes do not contribute to nutritional summaries
- Quick notes do not generate grocery list items
- Replaces any existing meal entry in the same slot

**Error Responses**:
- `400`: Invalid input (empty note, invalid date/type)
- `401`: User not authenticated
- `500`: Database insert error

---

### 4. Remove Meal Plan Entry

**Purpose**: Delete a meal plan entry (recipe or quick note)

**Type**: Server Action  
**Function**: `removeMealPlanEntry()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  mealPlanEntryId: string;  // UUID of the meal plan entry
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  deletedEntryId: string;
}
```

**Validation Rules**:
- `mealPlanEntryId`: Must be valid UUID

**Side Effects**:
- Removes associated grocery list items generated from this meal plan entry
- Triggers grocery list regeneration for affected date

**Error Responses**:
- `400`: Invalid entry ID format
- `401`: User not authenticated
- `403`: Entry belongs to different user
- `404`: Meal plan entry not found
- `500`: Database deletion error

---

### 5. Update Meal Plan Entry Servings

**Purpose**: Adjust serving size for a recipe in the meal plan

**Type**: Server Action  
**Function**: `updateMealPlanServings()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  mealPlanEntryId: string;
  newServings: number;
}
```

**Output Schema**:
```typescript
{
  mealPlanEntry: {
    id: string;
    servings: number;
    updatedAt: string;
  };
}
```

**Validation Rules**:
- `mealPlanEntryId`: Must be valid UUID
- `newServings`: Must be positive integer between 1 and 100

**Side Effects**:
- Updates nutritional calculations for daily summary
- Updates grocery list quantities proportionally
- Triggers grocery list regeneration

**Error Responses**:
- `400`: Invalid input (bad UUID, invalid servings)
- `401`: User not authenticated
- `403`: Entry belongs to different user
- `404`: Meal plan entry not found
- `500`: Database update error

---

### 6. Mark Meal as Completed

**Purpose**: Mark a meal plan entry as cooked/consumed

**Type**: Server Action  
**Function**: `markMealAsCompleted()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  mealPlanEntryId: string;
  isCompleted: boolean;
}
```

**Output Schema**:
```typescript
{
  mealPlanEntry: {
    id: string;
    isCompleted: boolean;
    updatedAt: string;
  };
}
```

**Validation Rules**:
- `mealPlanEntryId`: Must be valid UUID
- `isCompleted`: Boolean value required

**Business Logic**:
- Completed meals remain in meal plan for historical tracking
- Does not affect grocery list (items already generated)
- UI may show completed meals with different styling

**Error Responses**:
- `400`: Invalid entry ID
- `401`: User not authenticated
- `403`: Entry belongs to different user
- `404`: Meal plan entry not found
- `500`: Database update error

---

### 7. Get Next Upcoming Meal

**Purpose**: Get the user's next planned meal for "Next Meal" sticky card on home page

**Type**: Server Action  
**Function**: `getNextUpcomingMeal()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{} // No parameters (uses current date/time + auth user)
```

**Output Schema**:
```typescript
{
  nextMeal: {
    id: string;
    mealDate: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    recipe: {
      id: string;
      name: string;
      coverImageUrl: string;
    } | null;
    quickNote: string | null;
    timeLabel: string;  // Human-readable: "Tonight", "Tomorrow morning", etc.
  } | null;  // null if no upcoming meals
}
```

**Business Logic**:
- Finds nearest future meal starting from current date/time
- Determines appropriate meal type based on time of day:
  - 6am-10am: breakfast
  - 11am-2pm: lunch
  - 5pm-9pm: dinner
  - Other times: snack
- If today's appropriate meal is found, returns it; otherwise next day's first meal

**Error Responses**:
- `401`: User not authenticated
- `500`: Database query error

---

### 8. Duplicate Meal Plan

**Purpose**: Copy a meal plan from one date range to another (e.g., repeat last week's meals)

**Type**: Server Action  
**Function**: `duplicateMealPlan()`  
**File**: `lib/actions/meal-plans.ts`

**Input Schema**:
```typescript
{
  sourceStartDate: string;  // ISO date
  sourceEndDate: string;    // ISO date
  targetStartDate: string;  // ISO date to begin copying to
}
```

**Output Schema**:
```typescript
{
  copiedEntries: number;  // Count of meal plan entries copied
  targetDateRange: {
    startDate: string;
    endDate: string;
  };
}
```

**Validation Rules**:
- All dates must be valid ISO format
- Date ranges must not exceed 90 days
- `sourceEndDate` >= `sourceStartDate`

**Business Logic**:
- Copies all meal plan entries from source range, shifting dates to target range
- Preserves recipe references, servings, meal types
- Overwrites any existing entries in target slots
- Triggers grocery list regeneration for target date range

**Error Responses**:
- `400`: Invalid date format or range
- `401`: User not authenticated
- `500`: Database operation error

---

## TypeScript Types

```typescript
// lib/types/meal-plan.ts

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPlanEntry {
  id: string;
  userId: string;
  recipeId: string | null;
  quickNote: string | null;
  mealDate: string;  // ISO date
  mealType: MealType;
  servings: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanWithRecipe extends MealPlanEntry {
  recipe: {
    id: string;
    name: string;
    coverImageUrl: string;
    cookingTimeMinutes: number;
    caloriesPerServing: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  } | null;
}

export interface DailyNutritionalSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface MealPlanDateRange {
  startDate: string;
  endDate: string;
}
```

## Zod Validation Schemas

```typescript
// lib/validations/meal-plan.ts

import { z } from "zod";

export const mealTypeEnum = z.enum(["breakfast", "lunch", "dinner", "snack"]);

export const getMealPlanSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const addRecipeToMealPlanSchema = z.object({
  recipeId: z.string().uuid(),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: mealTypeEnum,
  servings: z.number().int().positive().max(100).optional(),
});

export const addQuickNoteSchema = z.object({
  quickNote: z.string().trim().min(1).max(500),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: mealTypeEnum,
});

export const removeMealPlanEntrySchema = z.object({
  mealPlanEntryId: z.string().uuid(),
});

export const updateServingsSchema = z.object({
  mealPlanEntryId: z.string().uuid(),
  newServings: z.number().int().positive().max(100),
});

export const markCompletedSchema = z.object({
  mealPlanEntryId: z.string().uuid(),
  isCompleted: z.boolean(),
});

export const duplicateMealPlanSchema = z.object({
  sourceStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

## Performance Considerations

- **Daily Summaries**: Calculate on-demand rather than storing, using database aggregation
- **Caching**: Cache meal plan data for current week using React Server Components
- **Optimistic Updates**: Use optimistic UI updates when marking meals complete
- **Batch Operations**: Group grocery list regeneration when multiple meals added/removed

## Security

- All Server Actions enforce Row Level Security via Supabase (user can only access their own meal plans)
- Input validation via Zod schemas before database operations
- Date range limits prevent excessive data queries (max 90 days)
- User ID extracted from auth session, never from client input
