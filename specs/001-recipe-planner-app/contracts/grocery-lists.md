# Grocery List API Contracts

**Feature**: Recipe Planner - Smart Grocery List Management  
**Type**: Next.js Server Actions  
**Date**: February 11, 2026

## Overview

This document defines the API contracts for grocery list operations including viewing categorized grocery lists, smart ingredient merging, marking items as purchased, adding custom items, and sharing functionality.

## Server Actions

### 1. Get Grocery List

**Purpose**: Retrieve user's complete grocery list organized by category

**Type**: Server Action  
**Function**: `getGroceryList()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  includeCompleted?: boolean;  // Include checked items (default: true)
}
```

**Output Schema**:
```typescript
{
  groceryList: {
    categorized: Record<string, Array<{  // Keyed by category name
      id: string;
      name: string;              // Ingredient or custom item name
      quantity: number;
      displayQuantity: string;   // Formatted with fractions (e.g., "2¾ cups")
      unit: string;
      category: string;
      isChecked: boolean;
      iconEmoji: string | null;
      usedInRecipes: string[];   // Array of recipe names
      notes: string | null;
      createdAt: string;
      updatedAt: string;
    }>>;
    uncheckedCount: number;      // Total unchecked items (for badge)
    checkedCount: number;        // Total checked items
    totalItems: number;
  };
}
```

**Category Order**:
1. vegetables
2. fruits
3. meat
4. seafood
5. dairy
6. grains
7. seasonings
8. condiments
9. baking
10. other

**Validation Rules**:
- `includeCompleted`: Boolean, default true

**Business Logic**:
- Items grouped by category with alphabetical sorting within each category
- Quantities displayed with sensible rounding (fractions for common measurements)
- Recipe names concatenated from `source_meal_plan_ids` lookup

**Error Responses**:
- `401`: User not authenticated
- `500`: Database query error

---

### 2. Generate Grocery List from Meal Plan

**Purpose**: Auto-generate consolidated grocery list from user's meal plan for a date range

**Type**: Server Action  
**Function**: `generateGroceryList()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  startDate: string;  // ISO date (YYYY-MM-DD)
  endDate: string;    // ISO date (YYYY-MM-DD)
  replaceExisting?: boolean;  // Clear existing list first (default: false)
}
```

**Output Schema**:
```typescript
{
  generated: {
    itemsAdded: number;
    itemsMerged: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
}
```

**Validation Rules**:
- `startDate`, `endDate`: Must be valid ISO dates
- `endDate` >= `startDate`
- Date range must not exceed 90 days

**Business Logic & Smart Merging**:
1. Query all meal plan entries in date range for authenticated user
2. For each recipe in meal plan:
   - Get recipe ingredients with quantities
   - Scale quantities by (meal_plan.servings / recipe.servings)
3. Group ingredients by ingredient_id + unit
4. Sum quantities for identical ingredient + unit combinations
5. Convert to common units when possible (e.g., "2 cups + 500ml" → "974ml")
6. For each merged ingredient:
   - Store source_meal_plan_ids array
   - Generate notes: "Used in: Recipe A, Recipe B"
7. Delete old grocery list items if `replaceExisting = true`
8. Insert consolidated grocery list items

**Error Responses**:
- `400`: Invalid date format or range
- `401`: User not authenticated
- `500`: Database operation error

---

### 3. Toggle Grocery Item Checked

**Purpose**: Mark an item as purchased/unpurchased

**Type**: Server Action  
**Function**: `toggleGroceryItemChecked()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  itemId: string;     // UUID of grocery list item
  isChecked: boolean;
}
```

**Output Schema**:
```typescript
{
  item: {
    id: string;
    isChecked: boolean;
    updatedAt: string;
  };
  uncheckedCount: number;  // Updated count for badge
}
```

**Validation Rules**:
- `itemId`: Must be valid UUID
- `isChecked`: Boolean required

**Business Logic**:
- Updates single item's checked status
- Returns updated uncheckedCount for real-time badge update

**Error Responses**:
- `400`: Invalid item ID format
- `401`: User not authenticated
- `403`: Item belongs to different user
- `404`: Item not found
- `500`: Database update error

---

### 4. Add Custom Grocery Item

**Purpose**: Manually add an item not linked to any recipe

**Type**: Server Action  
**Function**: `addCustomGroceryItem()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  customName: string;
  quantity: number;
  unit: string;
  category?: string;  // Optional, defaults to "other"
}
```

**Output Schema**:
```typescript
{
  item: {
    id: string;
    customName: string;
    quantity: number;
    unit: string;
    category: string;
    isChecked: boolean;
    createdAt: string;
  };
}
```

**Validation Rules**:
- `customName`: Required, 1-200 characters (trimmed)
- `quantity`: Must be positive number
- `unit`: Required, 1-50 characters
- `category`: Optional, must match valid category enum if provided

**Business Logic**:
- Custom items have `ingredient_id = null`
- `source_meal_plan_ids` is empty array
- User can add items for non-recipe purchases (e.g., "Paper towels")

**Error Responses**:
- `400`: Invalid input (empty name, negative quantity)
- `401`: User not authenticated
- `500`: Database insert error

---

### 5. Update Grocery Item

**Purpose**: Modify quantity, unit, or notes of an existing item

**Type**: Server Action  
**Function**: `updateGroceryItem()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  itemId: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}
```

**Output Schema**:
```typescript
{
  item: {
    id: string;
    quantity: number;
    unit: string;
    notes: string | null;
    updatedAt: string;
  };
}
```

**Validation Rules**:
- `itemId`: Must be valid UUID
- `quantity`: If provided, must be positive number
- `unit`: If provided, 1-50 characters
- `notes`: If provided, max 500 characters
- At least one field (quantity, unit, or notes) must be provided

**Business Logic**:
- Allows manual adjustment of auto-generated items
- Does not re-merge or recalculate from recipes
- User modifications persist until next full regeneration

**Error Responses**:
- `400`: Invalid input or no fields provided
- `401`: User not authenticated
- `403`: Item belongs to different user
- `404`: Item not found
- `500`: Database update error

---

### 6. Delete Grocery Item

**Purpose**: Remove a single item from grocery list

**Type**: Server Action  
**Function**: `deleteGroceryItem()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  itemId: string;
}
```

**Output Schema**:
```typescript
{
  success: boolean;
  deletedItemId: string;
  uncheckedCount: number;  // Updated count after deletion
}
```

**Validation Rules**:
- `itemId`: Must be valid UUID

**Error Responses**:
- `400`: Invalid item ID format
- `401`: User not authenticated
- `403`: Item belongs to different user
- `404`: Item not found
- `500`: Database deletion error

---

### 7. Clear Completed Items

**Purpose**: Remove all checked items from grocery list

**Type**: Server Action  
**Function**: `clearCompletedGroceryItems()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{} // No parameters (uses auth user)
```

**Output Schema**:
```typescript
{
  deletedCount: number;
  remainingItems: number;
}
```

**Business Logic**:
- Deletes all items where `is_checked = true` for authenticated user
- Useful after shopping trip to start fresh

**Error Responses**:
- `401`: User not authenticated
- `500`: Database deletion error

---

### 8. Share Grocery List

**Purpose**: Generate shareable text version of grocery list

**Type**: Server Action  
**Function**: `generateShareableGroceryList()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  includeCheckedItems?: boolean;  // Include checked items (default: false)
}
```

**Output Schema**:
```typescript
{
  shareText: string;  // Formatted text suitable for copying/sharing
  shareUrl: string;   // Deep link to grocery list (optional future feature)
}
```

**Share Text Format**:
```
🛒 My Grocery List

🥦 Vegetables
[ ] Garlic - 5 cloves
[ ] Onion - 2 medium
[x] Spinach - 300g

🥩 Meat
[ ] Chicken breast - 800g

---
Generated by Recipe Planner
```

**Validation Rules**:
- `includeCheckedItems`: Boolean, default false

**Error Responses**:
- `401`: User not authenticated
- `500`: Database query error

---

### 9. Split Merged Ingredient

**Purpose**: Manually separate a merged ingredient into individual recipe-specific items

**Type**: Server Action  
**Function**: `splitGroceryItem()`  
**File**: `lib/actions/grocery-lists.ts`

**Input Schema**:
```typescript
{
  itemId: string;  // ID of merged item to split
}
```

**Output Schema**:
```typescript
{
  newItems: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    usedInRecipes: string[];  // Single recipe per item after split
  }>;
}
```

**Business Logic**:
1. Look up original meal plan entries from `source_meal_plan_ids`
2. For each source, create separate grocery item with:
   - Original quantities from recipe (not merged sum)
   - Single recipe in usedInRecipes
3. Delete original merged item

**Use Case**: User shops at different stores and wants separate lists for each recipe

**Error Responses**:
- `400`: Invalid item ID or item has no merge sources
- `401`: User not authenticated
- `403`: Item belongs to different user
- `404`: Item not found
- `500`: Database operation error

---

## TypeScript Types

```typescript
// lib/types/grocery-list.ts

export interface GroceryListItem {
  id: string;
  userId: string;
  ingredientId: string | null;
  customName: string | null;
  quantity: number;
  displayQuantity: string;
  unit: string;
  category: string;
  isChecked: boolean;
  sourceMealPlanIds: string[];
  usedInRecipes: string[];
  notes: string | null;
  iconEmoji: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategorizedGroceryList {
  categorized: Record<string, GroceryListItem[]>;
  uncheckedCount: number;
  checkedCount: number;
  totalItems: number;
}

export interface GroceryListGenerationResult {
  itemsAdded: number;
  itemsMerged: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}
```

## Zod Validation Schemas

```typescript
// lib/validations/grocery-list.ts

import { z } from "zod";

const groceryCategoryEnum = z.enum([
  "vegetables", "fruits", "meat", "seafood", "dairy",
  "grains", "seasonings", "condiments", "baking", "other"
]);

export const getGroceryListSchema = z.object({
  includeCompleted: z.boolean().default(true),
});

export const generateGroceryListSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  replaceExisting: z.boolean().default(false),
});

export const toggleCheckedSchema = z.object({
  itemId: z.string().uuid(),
  isChecked: z.boolean(),
});

export const addCustomItemSchema = z.object({
  customName: z.string().trim().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  category: groceryCategoryEnum.optional(),
});

export const updateGroceryItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).max(50).optional(),
  notes: z.string().max(500).optional(),
}).refine(
  data => data.quantity !== undefined || data.unit !== undefined || data.notes !== undefined,
  { message: "At least one field (quantity, unit, or notes) must be provided" }
);

export const deleteGroceryItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const shareGroceryListSchema = z.object({
  includeCheckedItems: z.boolean().default(false),
});

export const splitGroceryItemSchema = z.object({
  itemId: z.string().uuid(),
});
```

## Smart Merging Algorithm

### Unit Conversion Logic

```typescript
// lib/utils/unit-conversion.ts

interface ConversionResult {
  quantity: number;
  unit: string;
}

export function mergeIngredients(
  items: Array<{ quantity: number; unit: string }>
): ConversionResult {
  // 1. Group by unit compatibility (weight-based, volume-based, count-based)
  // 2. Convert all to base unit (grams for weight, ml for volume)
  // 3. Sum quantities
  // 4. Convert back to most user-friendly unit
  
  // Example: "2 cups flour" (240g) + "300g flour" = "540g flour" or "4½ cups flour"
}
```

### Recipe Source Tracking

Each grocery list item maintains:
- `source_meal_plan_ids`: Array of meal plan entry UUIDs
- Lookup recipes via: `meal_plan_entries.recipe_id JOIN recipes.name`
- Display as: "Used in: Pasta Carbonara, Caesar Salad"

## Performance Considerations

- **Real-time Updates**: Use Supabase real-time subscriptions for collaborative grocery lists (future feature)
- **Batch Checking**: Optimistic UI updates when checking multiple items quickly
- **Category Caching**: Cache category emoji mappings client-side
- **Smart Regeneration**: Only regenerate grocery list when meal plan changes, not on every view

## Security

- Row Level Security ensures users only access their own grocery lists
- Input validation prevents injection attacks
- Rate limiting on share generation (max 10 shares per minute per user)
- Shareable links expire after 7 days (future feature)
