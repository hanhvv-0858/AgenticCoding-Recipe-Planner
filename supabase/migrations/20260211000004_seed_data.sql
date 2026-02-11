-- Seed Data: Recipe Tags
-- Created: 2026-02-11
-- Description: Initial recipe tags for categorization

INSERT INTO recipe_tags (name, slug, icon_emoji, display_order) VALUES
  ('Bữa Sáng Nhanh', 'quick-breakfast', '🌅', 1),
  ('Bữa Trưa Văn Phòng', 'office-lunch', '🏢', 2),
  ('Bữa Tối Gia Đình', 'family-dinner', '🏠', 3),
  ('Món Chay', 'vegetarian', '🥗', 4),
  ('Ăn Kiêng', 'diet-friendly', '💪', 5),
  ('Nấu Nhanh <30 Phút', 'quick-30min', '⚡', 6),
  ('Món Việt', 'vietnamese', '🇻🇳', 7),
  ('Món Âu', 'western', '🍝', 8),
  ('Món Á', 'asian', '🍜', 9),
  ('Món Tráng Miệng', 'desert', '🍰', 10),
  ('Meal Prep', 'meal-prep', '📦', 11),
  ('Ít Carb', 'low-carb', '🥑', 12);

-- Seed Data: Common Ingredients
-- Created: 2026-02-11
-- Description: Base ingredient catalog

-- Vegetables
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Cà chua', 'vegetables', 'pieces', '🍅'),
  ('Hành tây', 'vegetables', 'pieces', '🧅'),
  ('Tỏi', 'vegetables', 'cloves', '🧄'),
  ('Ớt', 'vegetables', 'pieces', '🌶️'),
  ('Cà rốt', 'vegetables', 'grams', '🥕'),
  ('Khoai tây', 'vegetables', 'grams', '🥔'),
  ('Bông cải xanh', 'vegetables', 'grams', '🥦'),
  ('Rau muống', 'vegetables', 'grams', '🥬'),
  ('Rau cải', 'vegetables', 'grams', '🥬'),
  ('Dưa chuột', 'vegetables', 'pieces', '🥒');

-- Fruits
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Chanh', 'fruits', 'pieces', '🍋'),
  ('Chuối', 'fruits', 'pieces', '🍌'),
  ('Táo', 'fruits', 'pieces', '🍎'),
  ('Cam', 'fruits', 'pieces', '🍊');

-- Meat
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Thịt gà', 'meat', 'grams', '🍗'),
  ('Thịt bò', 'meat', 'grams', '🥩'),
  ('Thịt heo', 'meat', 'grams', '🥓'),
  ('Trứng gà', 'meat', 'pieces', '🥚');

-- Seafood
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Cá hồi', 'seafood', 'grams', '🐟'),
  ('Tôm', 'seafood', 'grams', '🦐'),
  ('Mực', 'seafood', 'grams', '🦑');

-- Dairy
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Sữa tươi', 'dairy', 'ml', '🥛'),
  ('Bơ', 'dairy', 'grams', '🧈'),
  ('Phô mai', 'dairy', 'grams', '🧀'),
  ('Sữa chua', 'dairy', 'grams', '🥣');

-- Grains
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Gạo', 'grains', 'grams', '🍚'),
  ('Mì sợi', 'grains', 'grams', '🍝'),
  ('Bánh mì', 'grains', 'slices', '🍞'),
  ('Bột mì', 'grains', 'grams', '🌾');

-- Seasonings
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Muối', 'seasonings', 'teaspoons', '🧂'),
  ('Đường', 'seasonings', 'teaspoons', '🍬'),
  ('Nước mắm', 'seasonings', 'tablespoons', '🥫'),
  ('Dầu ăn', 'seasonings', 'tablespoons', '🫗'),
  ('Tiêu', 'seasonings', 'teaspoons', '⚫'),
  ('Gừng', 'seasonings', 'grams', '🫚'),
  ('Sả', 'seasonings', 'stalks', '🌿');

-- Condiments
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Tương ớt', 'condiments', 'tablespoons', '🌶️'),
  ('Tương cà', 'condiments', 'tablespoons', '🍅'),
  ('Mayonnaise', 'condiments', 'tablespoons', '🥫'),
  ('Mù tạt', 'condiments', 'teaspoons', '🟡');

-- Baking
INSERT INTO ingredients (name, category, default_unit, icon_emoji) VALUES
  ('Bột nở', 'baking', 'teaspoons', '🥄'),
  ('Vanilla', 'baking', 'teaspoons', '🌼'),
  ('Bột ca cao', 'baking', 'tablespoons', '🍫');
