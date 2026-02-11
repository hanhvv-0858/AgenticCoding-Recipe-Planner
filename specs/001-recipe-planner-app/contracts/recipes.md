# Recipe API Contracts

**Feature**: Recipe Planner - Recipe Management  
**Type**: Next.js Server Actions + Route Handlers  
**Date**: February 11, 2026

## Overview

This document defines the API contracts for recipe-related operations including discovery, search, filtering, and recipe detail retrieval. These endpoints support the Home page (discovery), Recipe Detail page, and Cookbook features.

## Server Actions

### 1. Search Recipes

**Purpose**: Search and filter recipes based on user criteria

**Type**: Server Action  
**Function**: `searchRecipes()`  
**File**: `lib/actions/recipes.ts`

**Input Schema**:
```typescript
{
  query?: string;              // Free-text search query
  tags?: string[];             // Array of tag slugs (e.g., ["quick-lunch", "healthy"])
  maxCookingTime?: number;     // Maximum cooking time in minutes
  maxCalories?: number;        // Maximum calories per serving
  minRating?: number;          // Minimum rating (0-5)
  page?: number;               // Pagination (default: 1)
  pageSize?: number;           // Results per page (default: 20, max: 50)
}
```

**Output Schema**:
```typescript
{
  recipes: Array<{
    id: string;
    name: string;
    description: string;
    coverImageUrl: string;
    cookingTimeMinutes: number;
    caloriesPerServing: number;
    rating: number;
    tags: Array<{ id: string; name: string; slug: string }>;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}
```

**Validation Rules**:
- `maxCookingTime`: Must be positive integer if provided
- `maxCalories`: Must be positive integer if provided
- `minRating`: Must be between 0 and 5 if provided
- `page`: Must be positive integer, default = 1
- `pageSize`: Must be between 1 and 50, default = 20

**Error Responses**:
- `400`: Invalid input parameters (e.g., negative values)
- `500`: Database query error

---

### 2. Get Recipe Detail

**Purpose**: Retrieve complete recipe information including ingredients and steps

**Type**: Server Action  
**Function**: `getRecipeDetail()`  
**File**: `lib/actions/recipes.ts`

**Input Schema**:
```typescript
{
  recipeId: string;    // UUID of the recipe
}
```

**Output Schema**:
```typescript
{
  recipe: {
    id: string;
    name: string;
    description: string;
    coverImageUrl: string;
    cookingTimeMinutes: number;
    prepTimeMinutes: number;
    servings: number;
    caloriesPerServing: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    difficultyLevel: "easy" | "medium" | "hard";
    rating: number;
    ratingCount: number;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    ingredients: Array<{
      id: string;
      name: string;
      quantity: number;
      unit: string;
      preparationNote: string | null;
      isOptional: boolean;
    }>;
    steps: Array<{
      stepNumber: number;
      instruction: string;
      imageUrl: string | null;
      videoUrl: string | null;
      durationMinutes: number | null;
    }>;
  };
}
```

**Validation Rules**:
- `recipeId`: Must be valid UUID format

**Error Responses**:
- `400`: Invalid recipe ID format
- `404`: Recipe not found or not accessible to user
- `500`: Database query error

---

### 3. Scale Recipe Servings

**Purpose**: Adjust ingredient quantities based on new serving size

**Type**: Server Action  
**Function**: `scaleRecipeServings()`  
**File**: `lib/actions/recipes.ts`

**Input Schema**:
```typescript
{
  recipeId: string;
  originalServings: number;
  newServings: number;
}
```

**Output Schema**:
```typescript
{
  scaledIngredients: Array<{
    id: string;
    name: string;
    quantity: number;         // Scaled quantity
    displayQuantity: string;  // Formatted for display (e.g., "2¾ cups")
    unit: string;
    preparationNote: string | null;
    isOptional: boolean;
  }>;
}
```

**Validation Rules**:
- `recipeId`: Must be valid UUID
- `originalServings`: Must be positive integer
- `newServings`: Must be positive integer, max 100

**Business Logic**:
- Scale factor = newServings / originalServings
- Each ingredient quantity multiplied by scale factor
- Round to sensible fractions (⅓, ½, ¾, etc.) for display
- Handle special cases: "to taste" ingredients remain unchanged

**Error Responses**:
- `400`: Invalid input (negative servings, invalid UUID)
- `404`: Recipe not found
- `500`: Calculation error

---

### 4. Get Trending Recipes

**Purpose**: Retrieve popular/trending recipes for home page display

**Type**: Server Action  
**Function**: `getTrendingRecipes()`  
**File**: `lib/actions/recipes.ts`

**Input Schema**:
```typescript
{
  limit?: number;  // Number of recipes to return (default: 20, max: 50)
}
```

**Output Schema**:
```typescript
{
  recipes: Array<{
    id: string;
    name: string;
    coverImageUrl: string;
    cookingTimeMinutes: number;
    caloriesPerServing: number;
    rating: number;
    tags: Array<{ name: string; slug: string }>;
  }>;
}
```

**Sorting Logic**:
- Primary: Rating (DESC)
- Secondary: Rating count (DESC)
- Tertiary: Recent additions (created_at DESC)

**Validation Rules**:
- `limit`: Must be between 1 and 50, default = 20

**Error Responses**:
- `400`: Invalid limit value
- `500`: Database query error

---

### 5. Get Recipes by Tag

**Purpose**: Filter recipes by specific tag (e.g., #QuickLunch, #Healthy)

**Type**: Server Action  
**Function**: `getRecipesByTag()`  
**File**: `lib/actions/recipes.ts`

**Input Schema**:
```typescript
{
  tagSlug: string;     // Tag slug (e.g., "quick-lunch")
  page?: number;       // Pagination (default: 1)
  pageSize?: number;   // Results per page (default: 20)
}
```

**Output Schema**:
```typescript
{
  tag: {
    id: string;
    name: string;
    slug: string;
    iconEmoji: string | null;
  };
  recipes: Array<{
    id: string;
    name: string;
    coverImageUrl: string;
    cookingTimeMinutes: number;
    caloriesPerServing: number;
    rating: number;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}
```

**Validation Rules**:
- `tagSlug`: Must match pattern [a-z0-9-]+
- `page`: Must be positive integer
- `pageSize`: Must be between 1 and 50

**Error Responses**:
- `400`: Invalid tag slug or pagination parameters
- `404`: Tag not found
- `500`: Database query error

---

### 6. Get All Recipe Tags

**Purpose**: Retrieve all available tags for filtering UI

**Type**: Server Action  
**Function**: `getRecipeTags()`  
**File**: `lib/actions/recipes.ts`

**Input Schema**:
```typescript
{} // No parameters
```

**Output Schema**:
```typescript
{
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    iconEmoji: string | null;
    recipeCount: number;  // Number of recipes with this tag
  }>;
}
```

**Sorting**: By `display_order` ASC, then alphabetically

**Error Responses**:
- `500`: Database query error

---

## Route Handlers (Public API)

### 1. Get Recipe Image

**Purpose**: Serve optimized recipe images with CDN caching

**Type**: Route Handler (GET)  
**Path**: `/api/recipes/[id]/image`  
**File**: `app/api/recipes/[id]/image/route.ts`

**Query Parameters**:
- `size`: thumbnail | card | full (default: card)
- `format`: webp | jpeg (default: webp)

**Response**:
- **200**: Image file (Content-Type: image/webp or image/jpeg)
- **404**: Recipe or image not found
- **500**: Image processing error

**Caching Headers**:
```
Cache-Control: public, max-age=31536000, immutable
```

---

## TypeScript Types

```typescript
// lib/types/recipe.ts

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  cookingTimeMinutes: number;
  prepTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  difficultyLevel: DifficultyLevel;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  preparationNote: string | null;
  isOptional: boolean;
  displayOrder: number;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  imageUrl: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
}

export interface RecipeTag {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string | null;
}

export interface RecipeDetail extends Recipe {
  tags: RecipeTag[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface RecipeSearchFilters {
  query?: string;
  tags?: string[];
  maxCookingTime?: number;
  maxCalories?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasMore: boolean;
}
```

## Zod Validation Schemas

```typescript
// lib/validations/recipe.ts

import { z } from "zod";

export const recipeSearchSchema = z.object({
  query: z.string().max(200).optional(),
  tags: z.array(z.string()).max(10).optional(),
  maxCookingTime: z.number().int().positive().max(1440).optional(),
  maxCalories: z.number().int().positive().max(10000).optional(),
  minRating: z.number().min(0).max(5).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});

export const recipeDetailSchema = z.object({
  recipeId: z.string().uuid(),
});

export const scaleServingsSchema = z.object({
  recipeId: z.string().uuid(),
  originalServings: z.number().int().positive(),
  newServings: z.number().int().positive().max(100),
});

export const recipesByTagSchema = z.object({
  tagSlug: z.string().regex(/^[a-z0-9-]+$/),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});
```

## Performance Considerations

- **Caching**: Trending recipes cached for 5 minutes using React Server Components cache
- **Pagination**: Use cursor-based pagination for better performance on large datasets
- **Image Optimization**: All recipe images processed through next/image for automatic optimization
- **Database Indexes**: Ensure indexes exist on rating, cooking_time, calories columns
- **Prefetching**: Use Next.js `prefetch` for recipe detail pages on hover

## Security

- All Server Actions validate input using Zod schemas before database queries
- SQL injection prevented by parameterized queries (Supabase client handles this)
- Row Level Security ensures users can only access public recipes
- Rate limiting applied to public API routes (100 requests/minute per IP)
