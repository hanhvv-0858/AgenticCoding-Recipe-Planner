-- Migration: Database Functions and Triggers
-- Created: 2026-02-11
-- Description: Create utility functions and triggers

-- ============================================================================
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plan_entries_updated_at
    BEFORE UPDATE ON meal_plan_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_list_items_updated_at
    BEFORE UPDATE ON grocery_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REGENERATE GROCERY LIST FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION regenerate_grocery_list(
  p_user_id UUID, 
  p_start_date DATE, 
  p_end_date DATE
)
RETURNS void AS $$
BEGIN
  -- Delete existing grocery list items generated from meal plans in this date range
  DELETE FROM grocery_list_items
  WHERE user_id = p_user_id
    AND array_length(source_meal_plan_ids, 1) > 0;
  
  -- Insert aggregated ingredients from meal plan
  INSERT INTO grocery_list_items (
    user_id, ingredient_id, custom_name, quantity, unit, category, source_meal_plan_ids, notes
  )
  SELECT
    p_user_id,
    ri.ingredient_id,
    NULL as custom_name,
    SUM(ri.quantity * mpe.servings / r.servings) as quantity,
    ri.unit,
    i.category,
    ARRAY_AGG(DISTINCT mpe.id) as source_meal_plan_ids,
    STRING_AGG(DISTINCT r.name, ', ') as notes
  FROM meal_plan_entries mpe
  JOIN recipes r ON mpe.recipe_id = r.id
  JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE mpe.user_id = p_user_id
    AND mpe.meal_date BETWEEN p_start_date AND p_end_date
    AND mpe.recipe_id IS NOT NULL
  GROUP BY ri.ingredient_id, ri.unit, i.category
  ORDER BY i.category, i.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
