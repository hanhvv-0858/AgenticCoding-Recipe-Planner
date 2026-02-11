-- Migration: Initial Recipe Planner Schema
-- Created: 2026-02-11
-- Description: Create all tables for Recipe Planner application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create meal_type enum
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- ============================================================================
-- USER PROFILES
-- ============================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_unit_system TEXT CHECK (preferred_unit_system IN ('metric', 'imperial')) DEFAULT 'metric',
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RECIPES
-- ============================================================================

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT NOT NULL,
  cooking_time_minutes INTEGER NOT NULL CHECK (cooking_time_minutes > 0),
  prep_time_minutes INTEGER DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
  calories_per_serving INTEGER,
  protein_grams DECIMAL(6,2),
  carbs_grams DECIMAL(6,2),
  fat_grams DECIMAL(6,2),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for recipes
CREATE INDEX idx_recipes_rating ON recipes(rating DESC);
CREATE INDEX idx_recipes_cooking_time ON recipes(cooking_time_minutes);
CREATE INDEX idx_recipes_calories ON recipes(calories_per_serving);
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_recipes_name_search ON recipes USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- INGREDIENTS
-- ============================================================================

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'vegetables', 'fruits', 'meat', 'seafood', 'dairy', 
    'grains', 'seasonings', 'condiments', 'baking', 'other'
  )),
  default_unit TEXT NOT NULL,
  icon_emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ingredients
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_name_search ON ingredients USING GIN (to_tsvector('english', name));

-- ============================================================================
-- RECIPE INGREDIENTS (Junction Table)
-- ============================================================================

CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  preparation_note TEXT,
  is_optional BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL,
  UNIQUE(recipe_id, ingredient_id)
);

-- Indexes for recipe_ingredients
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- ============================================================================
-- RECIPE STEPS
-- ============================================================================

CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number > 0),
  instruction TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, step_number)
);

-- Indexes for recipe_steps
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id, step_number);

-- ============================================================================
-- RECIPE TAGS
-- ============================================================================

CREATE TABLE recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon_emoji TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for recipe_tags
CREATE INDEX idx_recipe_tags_slug ON recipe_tags(slug);

-- ============================================================================
-- RECIPE TAG MAPPINGS (Junction Table)
-- ============================================================================

CREATE TABLE recipe_tag_mappings (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES recipe_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (recipe_id, tag_id)
);

-- Indexes for recipe_tag_mappings
CREATE INDEX idx_recipe_tag_mappings_recipe ON recipe_tag_mappings(recipe_id);
CREATE INDEX idx_recipe_tag_mappings_tag ON recipe_tag_mappings(tag_id);

-- ============================================================================
-- SAVED RECIPES (User's Cookbook)
-- ============================================================================

CREATE TABLE saved_recipes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Indexes for saved_recipes
CREATE INDEX idx_saved_recipes_user ON saved_recipes(user_id, saved_at DESC);
CREATE INDEX idx_saved_recipes_recipe ON saved_recipes(recipe_id);

-- ============================================================================
-- MEAL PLAN ENTRIES
-- ============================================================================

CREATE TABLE meal_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  quick_note TEXT,
  meal_date DATE NOT NULL,
  meal_type meal_type NOT NULL,
  servings INTEGER DEFAULT 1 CHECK (servings > 0),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT recipe_or_note_required CHECK (
    (recipe_id IS NOT NULL) OR (quick_note IS NOT NULL)
  )
);

-- Indexes for meal_plan_entries
CREATE INDEX idx_meal_plan_user_date ON meal_plan_entries(user_id, meal_date);
CREATE INDEX idx_meal_plan_recipe ON meal_plan_entries(recipe_id);
CREATE INDEX idx_meal_plan_user_type ON meal_plan_entries(user_id, meal_type);

-- ============================================================================
-- GROCERY LIST ITEMS
-- ============================================================================

CREATE TABLE grocery_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  custom_name TEXT,
  quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  category TEXT,
  is_checked BOOLEAN DEFAULT false,
  source_meal_plan_ids UUID[] DEFAULT ARRAY[]::UUID[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT ingredient_or_custom_required CHECK (
    (ingredient_id IS NOT NULL) OR (custom_name IS NOT NULL)
  )
);

-- Indexes for grocery_list_items
CREATE INDEX idx_grocery_list_user ON grocery_list_items(user_id);
CREATE INDEX idx_grocery_list_ingredient ON grocery_list_items(ingredient_id);
CREATE INDEX idx_grocery_list_checked ON grocery_list_items(user_id, is_checked);
