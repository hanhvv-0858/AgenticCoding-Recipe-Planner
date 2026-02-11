-- Migration: Row Level Security Policies
-- Created: 2026-02-11
-- Description: Enable RLS and create policies for all tables

-- ============================================================================
-- USER PROFILES RLS
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- RECIPES RLS
-- ============================================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================================================
-- INGREDIENTS RLS (Read-only for all users)
-- ============================================================================

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingredients are viewable by everyone"
  ON ingredients FOR SELECT
  USING (true);

-- ============================================================================
-- RECIPE INGREDIENTS RLS
-- ============================================================================

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe ingredients are viewable with recipe"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
        AND (recipes.is_public = true OR recipes.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage ingredients for own recipes"
  ON recipe_ingredients
  USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
        AND recipes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_ingredients.recipe_id 
        AND recipes.created_by = auth.uid()
    )
  );

-- ============================================================================
-- RECIPE STEPS RLS
-- ============================================================================

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe steps are viewable with recipe"
  ON recipe_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_steps.recipe_id 
        AND (recipes.is_public = true OR recipes.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage steps for own recipes"
  ON recipe_steps
  USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_steps.recipe_id 
        AND recipes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_steps.recipe_id 
        AND recipes.created_by = auth.uid()
    )
  );

-- ============================================================================
-- RECIPE TAGS RLS (Read-only for all users)
-- ============================================================================

ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe tags are viewable by everyone"
  ON recipe_tags FOR SELECT
  USING (true);

-- ============================================================================
-- RECIPE TAG MAPPINGS RLS
-- ============================================================================

ALTER TABLE recipe_tag_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe tag mappings are viewable by everyone"
  ON recipe_tag_mappings FOR SELECT
  USING (true);

CREATE POLICY "Users can manage tags for own recipes"
  ON recipe_tag_mappings
  USING (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_tag_mappings.recipe_id 
        AND recipes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes 
      WHERE recipes.id = recipe_tag_mappings.recipe_id 
        AND recipes.created_by = auth.uid()
    )
  );

-- ============================================================================
-- SAVED RECIPES RLS
-- ============================================================================

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own saved recipes"
  ON saved_recipes FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MEAL PLAN ENTRIES RLS
-- ============================================================================

ALTER TABLE meal_plan_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plan_entries
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GROCERY LIST ITEMS RLS
-- ============================================================================

ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own grocery list"
  ON grocery_list_items
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
