-- T238: Additional indexes for query optimization
-- These indexes cover common query patterns identified during performance review

-- Composite index for trending recipes query: WHERE is_public = true ORDER BY rating DESC
CREATE INDEX IF NOT EXISTS idx_recipes_public_rating ON recipes(is_public, rating DESC NULLS LAST)
    WHERE is_public = true;

-- Index for difficulty_level filtering (used in recipe search filters)
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty_level)
    WHERE difficulty_level IS NOT NULL;

-- Composite index for meal plan date range queries: WHERE user_id = ? AND meal_date BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_meal_plan_user_date_range ON meal_plan_entries(user_id, meal_date DESC);

-- Index for grocery list category grouping
CREATE INDEX IF NOT EXISTS idx_grocery_list_category ON grocery_list_items(user_id, category);
