# Feature Specification: Recipe Planner - Meal Planning & Grocery List Mobile App

**Feature Branch**: `001-recipe-planner-app`  
**Created**: February 11, 2026  
**Status**: Draft  
**Input**: User description: "Tạo ra spec cho ứng dụng Recipe Planner – Lên thực đơn & danh sách mua sắm với responsive cho mobile"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Search Recipes (Priority: P1)

As a home cook, I want to discover recipes by browsing trending options or searching with filters, so I can find meals that match my ingredients, time constraints, and dietary preferences.

**Why this priority**: Core discovery functionality - users cannot use the app without being able to find recipes. This is the entry point for all other features.

**Independent Test**: Can be fully tested by opening the app, using the search bar with various filters (ingredients, cooking time, calories), browsing trending recipes in grid view, and navigating via tag-based suggestions. Delivers value by allowing users to discover recipes immediately.

**Acceptance Scenarios**:

1. **Given** a user opens the Home page, **When** they view the page, **Then** they see a search bar with filter options, a "Next Meal" sticky card (if meal planned), tag-based suggestions in horizontal scroll, and trending recipes in grid view
2. **Given** a user enters "chicken" in the search bar, **When** they apply time filter "under 30 minutes", **Then** they see only chicken recipes that take less than 30 minutes to prepare
3. **Given** a user taps a tag like "#QuickLunch", **When** the filter is applied, **Then** they see recipes filtered to match the quick lunch category
4. **Given** a user views trending recipes, **When** they see recipe cards with images, **Then** each card displays recipe name, cooking time, calorie count, and rating
5. **Given** a user sees a recipe card, **When** they tap the "+" button on the recipe image corner, **Then** the recipe is added to their meal plan without navigating away

---

### User Story 2 - View Recipe Details and Instructions (Priority: P1)

As a user who found an interesting recipe, I want to view complete recipe information including ingredients with serving adjustments and step-by-step cooking instructions, so I can decide if I want to cook it and understand how to prepare it.

**Why this priority**: Essential for recipe evaluation and cooking guidance. Without detailed recipe information, users cannot make informed decisions or follow cooking instructions.

**Independent Test**: Can be tested by selecting any recipe from the Home page, viewing the detail page with parallax cover image, adjusting serving sizes in the ingredients tab, viewing step-by-step instructions in the instructions tab, and using the "Start Cooking" button. Delivers value by providing complete cooking information.

**Acceptance Scenarios**:

1. **Given** a user taps on a recipe card, **When** the recipe detail page loads, **Then** they see a large cover image with parallax effect, "Save" and "Add to Plan" buttons, and quick info showing cooking time, calories, and rating
2. **Given** a user is on the recipe detail page, **When** they view the tabs, **Then** they see two tabs: "Ingredients" and "Instructions"
3. **Given** a user opens the Ingredients tab, **When** they view the content, **Then** they see a checkbox list of ingredients with a servings dropdown, and changing serving size automatically adjusts ingredient quantities
4. **Given** a user opens the Instructions tab, **When** they view the content, **Then** they see numbered step-by-step instructions with accompanying images or videos
5. **Given** a user scrolls to the bottom, **When** they see the action button, **Then** there is a prominent "Start Cooking" button fixed at the bottom of the page
6. **Given** a user taps "Save" button, **When** the action completes, **Then** the recipe is saved to their personal cookbook
7. **Given** a user taps "Add to Plan" button, **When** the action completes, **Then** they are prompted to select which meal slot (breakfast/lunch/dinner/snack) and date to add the recipe

---

### User Story 3 - Plan Weekly Meals (Priority: P2)

As a busy person who wants to organize meals ahead of time, I want to create a weekly meal plan by assigning recipes to specific days and meal times, so I can manage my weekly nutrition and reduce daily decision fatigue.

**Why this priority**: Core value proposition of the app - meal planning transforms recipe browsing into organized action. High priority but dependent on having recipes to plan with.

**Independent Test**: Can be tested by accessing the Meal Planner page via navigation, viewing the 7-day calendar strip, adding recipes to specific meal slots (breakfast/lunch/dinner/snack), adding quick notes for external meals, and viewing daily nutrition summaries. Delivers value by providing organized meal structure.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Meal Planner page, **When** they view the page, **Then** they see a horizontal calendar strip showing 7 days and daily timeline sections below
2. **Given** a user taps a specific day on the calendar strip, **When** the selection changes, **Then** the daily timeline updates to show that day's meal plan
3. **Given** a user views a day's timeline, **When** they see the layout, **Then** they see four meal blocks: Breakfast, Lunch, Dinner, and Snack
4. **Given** a user taps "Add Recipe" in a meal block, **When** the action is triggered, **Then** they can select a recipe from their saved recipes or recipe library to add to that meal slot
5. **Given** a user taps "Quick Note" in a meal block, **When** the action is triggered, **Then** they can enter free-form text for meals not in the recipe system (e.g., "eating out at restaurant")
6. **Given** a user has added meals to a day, **When** they view the summary tooltip, **Then** they see total estimated calories, protein, and carbohydrates for that day
7. **Given** a user views the "Next Meal" sticky card on the Home page, **When** they have an upcoming planned meal, **Then** they see the meal name and time (e.g., "Tonight's Dinner: Pan-seared Salmon") with a quick button to open cooking instructions

---

### User Story 4 - Generate and Manage Grocery List (Priority: P2)

As a meal planner, I want an automatically generated grocery list organized by category that intelligently merges ingredients from multiple recipes, so I can efficiently shop for all my planned meals in one trip.

**Why this priority**: High value feature that completes the meal planning workflow. Enables efficient shopping but requires meal planning to be functional first.

**Independent Test**: Can be tested by having meals in the meal plan, navigating to the Grocery List page, viewing ingredients grouped by category (vegetables, meat/fish, seasonings), checking off purchased items, seeing smart merge of duplicate ingredients, clearing completed items, and sharing the list. Delivers value by converting meal plans into actionable shopping lists.

**Acceptance Scenarios**:

1. **Given** a user has recipes in their meal plan, **When** they navigate to the Grocery List page, **Then** they see ingredients automatically populated and grouped by category (vegetables, meat/fish, seasonings, etc.)
2. **Given** multiple recipes use the same ingredient, **When** the user views that ingredient, **Then** it shows the total quantity needed with notation of which recipes use it (e.g., "Garlic: 3 cloves (Used in: Beef Stir-fry, Salad)")
3. **Given** a user sees a grocery item, **When** they tap the checkbox, **Then** the item is marked as completed/purchased
4. **Given** a user has completed items, **When** they tap "Clear Completed", **Then** all checked items are removed from the list
5. **Given** a user wants to share their list, **When** they tap the "Share" button, **Then** they can send the grocery list via messaging apps or other sharing methods
6. **Given** the grocery list view, **When** displayed, **Then** the navigation bar shows a badge with the count of unchecked items

---

### User Story 5 - Create Account and Sign In (Priority: P3)

As a user who wants to access my recipes and meal plans across devices, I want to create an account with email and password and sign in, so I can save my data and access it from any device.

**Why this priority**: Important for data persistence and multi-device access, but users can explore recipes before committing to account creation. Can be added after core features are functional.

**Independent Test**: Can be tested by accessing the account creation flow, registering with email and password, signing out, and signing back in with credentials. Delivers value by enabling data persistence and multi-device synchronization.

**Acceptance Scenarios**:

1. **Given** a new user opens the app, **When** they choose to create an account, **Then** they see a registration form requesting email and password
2. **Given** a user enters valid email and password (minimum 8 characters), **When** they submit the form, **Then** their account is created and they are signed in
3. **Given** a user enters an invalid email format, **When** they attempt to submit, **Then** they see an error message indicating the email format is invalid
4. **Given** a user enters a password shorter than 8 characters, **When** they attempt to submit, **Then** they see an error message indicating password requirements
5. **Given** a user has an account, **When** they open the app on a new device and sign in with their credentials, **Then** they see their saved recipes, meal plans, and grocery lists
6. **Given** a signed-in user, **When** they navigate to the Profile section, **Then** they can view their account information and sign out

---

### User Story 6 - Save Recipes to Personal Cookbook (Priority: P3)

As a recipe collector, I want to save recipes I like to a personal cookbook section, so I can quickly access my favorite recipes without searching again.

**Why this priority**: Enhances user experience by providing quick access to favorites, but not essential for initial meal planning workflow.

**Independent Test**: Can be tested by browsing recipes, tapping the "Save" button on recipe detail pages, navigating to "My Cookbook" via bottom navigation, viewing saved recipes, and removing recipes from the collection. Delivers value by creating a personalized recipe library.

**Acceptance Scenarios**:

1. **Given** a user views a recipe detail page, **When** they tap the "Save" button, **Then** the recipe is added to their personal cookbook and the button state changes to "Saved"
2. **Given** a user navigates to "My Cookbook" via the bottom navigation, **When** the page loads, **Then** they see all recipes they have saved
3. **Given** a user views their cookbook, **When** they tap on a saved recipe, **Then** they are taken to the recipe detail page
4. **Given** a user views a saved recipe detail page, **When** they tap "Saved" button again, **Then** the recipe is removed from their cookbook

---

### User Story 7 - Navigate Between App Sections (Priority: P1)

As a mobile app user, I want clear navigation between main sections of the app, so I can easily switch between discovering recipes, managing my cookbook, planning meals, and checking my grocery list.

**Why this priority**: Essential UX foundation - without navigation, users cannot access different features. Must be functional from day one.

**Independent Test**: Can be tested by tapping each icon in the bottom navigation bar and verifying the correct page loads. Delivers value by enabling access to all app features.

**Acceptance Scenarios**:

1. **Given** a user is on any page, **When** they view the bottom of the screen, **Then** they see a bottom navigation bar with 5 icons: Home, My Cookbook, Planner, Grocery, and Profile
2. **Given** a user taps the Home icon, **When** the action completes, **Then** they navigate to the Home/Discovery page
3. **Given** a user taps the My Cookbook icon, **When** the action completes, **Then** they navigate to their saved recipes collection
4. **Given** a user taps the Planner icon, **When** the action completes, **Then** they navigate to the Meal Planner page
5. **Given** a user taps the Grocery icon, **When** the action completes, **Then** they navigate to the Grocery List page, and this icon shows a badge with the count of unchecked items
6. **Given** a user taps the Profile icon, **When** the action completes, **Then** they navigate to their profile/settings page
7. **Given** a user is on a page, **When** that page's corresponding navigation icon is displayed, **Then** the icon is visually highlighted to indicate the current section

---

### Edge Cases

- What happens when a user adjusts serving size to 0 or a very large number (e.g., 100)?
- How does the system handle recipes with missing images or incomplete information?
- What happens when a user tries to add the same recipe to multiple meal slots on the same day?
- How does the grocery list handle conflicting units for the same ingredient from different recipes (e.g., "2 cups flour" vs "300g flour")?
- What happens when a user tries to create an account with an email that already exists?
- How does the app behave when there are no trending recipes or the user has no saved recipes?
- What happens to the meal plan and grocery list when a user deletes their account?
- How does the "Next Meal" sticky card behave when no meals are planned or when the current time passes all planned meals for the day?
- What happens when there is no internet connection and the user tries to browse recipes, save data, or sync their account?
- How does the search handle special characters, emojis, or very long search queries?

## Requirements *(mandatory)*

### Functional Requirements

**Discovery & Search**
- **FR-001**: System MUST display a search bar on the Home page with filter options for ingredients, cooking time, and calorie range
- **FR-002**: System MUST show a "Next Meal" sticky card on the Home page displaying the user's nearest upcoming planned meal with quick access to cooking instructions
- **FR-003**: System MUST display tag-based recipe suggestions (examples: #QuickLunch, #Healthy, #BudgetFriendly) in a horizontal scrollable list
- **FR-004**: System MUST display trending recipes in a grid layout with recipe images, names, cooking time, calorie count, and ratings
- **FR-005**: System MUST provide a quick "Add to Plan" button (+) on recipe cards that adds the recipe to the meal plan without navigation

**Recipe Details**
- **FR-006**: System MUST display recipe detail pages with a large cover image with parallax scroll effect
- **FR-007**: System MUST provide "Save" and "Add to Plan" action buttons prominently on recipe detail pages
- **FR-008**: System MUST display quick information icons showing cooking time, calorie count, and user rating
- **FR-009**: System MUST provide two tabs on recipe detail pages: "Ingredients" and "Instructions"
- **FR-010**: System MUST display ingredients with checkboxes and a servings dropdown selector that automatically scales ingredient quantities when changed
- **FR-011**: System MUST display cooking instructions as numbered steps with optional accompanying images or videos
- **FR-012**: System MUST display a prominent "Start Cooking" button fixed at the bottom of recipe detail pages

**Meal Planning**
- **FR-013**: System MUST provide a horizontal calendar strip showing 7 days
- **FR-014**: System MUST display a daily timeline divided into four meal blocks: Breakfast, Lunch, Dinner, and Snack
- **FR-015**: System MUST allow users to select a day from the calendar strip and display that day's meal plan
- **FR-016**: System MUST provide an "Add Recipe" button in each meal block that opens the recipe library for selection
- **FR-017**: System MUST provide a "Quick Note" option in each meal block for free-form text entry of external meals
- **FR-018**: System MUST display a summary tooltip showing total estimated calories, protein, and carbohydrates for the selected day
- **FR-019**: System MUST update the "Next Meal" sticky card on the Home page based on the nearest upcoming planned meal

**Grocery List**
- **FR-020**: System MUST automatically generate a grocery list from ingredients in the meal plan
- **FR-021**: System MUST organize grocery list items by category (vegetables, meat/fish, seasonings, etc.)
- **FR-022**: System MUST display each grocery item with a checkbox, name, quantity, and notes showing which recipes use it
- **FR-023**: System MUST intelligently merge duplicate ingredients from multiple recipes, showing the total quantity and listing all recipes using that ingredient
- **FR-024**: System MUST provide a "Clear Completed" button that removes all checked items from the list
- **FR-025**: System MUST provide a "Share" button that allows users to send the grocery list via messaging apps or other sharing methods
- **FR-026**: System MUST display a badge on the Grocery navigation icon showing the count of unchecked items

**Navigation**
- **FR-027**: System MUST provide a bottom navigation bar with five sections: Home (🏠), My Cookbook (📖), Planner (🗓️), Grocery (🛒), and Profile (👤)
- **FR-028**: System MUST visually highlight the active section's icon in the bottom navigation bar
- **FR-029**: System MUST display a badge on the Grocery icon showing the number of unchecked grocery items

**User Accounts**
- **FR-030**: System MUST provide a registration flow accepting email and password (minimum 8 characters)
- **FR-031**: System MUST validate email format during registration and display error messages for invalid formats
- **FR-032**: System MUST validate password requirements (minimum 8 characters) and display error messages when not met
- **FR-033**: System MUST provide a sign-in flow for existing users using email and password
- **FR-034**: System MUST persist user data (saved recipes, meal plans, grocery lists) across sessions and devices when signed in
- **FR-035**: System MUST provide a sign-out option in the Profile section

**Personal Cookbook**
- **FR-036**: System MUST allow users to save recipes from the detail page using the "Save" button
- **FR-037**: System MUST display a "My Cookbook" section showing all saved recipes
- **FR-038**: System MUST allow users to remove recipes from their cookbook
- **FR-039**: System MUST change the button state from "Save" to "Saved" when a recipe is in the user's cookbook

**Responsive Design**
- **FR-040**: System MUST be fully responsive and optimized for mobile devices
- **FR-041**: System MUST use touch-friendly UI elements with appropriate sizing for mobile interaction
- **FR-042**: System MUST support common mobile gestures (tap, scroll, swipe) where appropriate

### Key Entities

- **Recipe**: Represents a cooking recipe with attributes including name, cover image, cooking time, calorie count, rating, ingredients list, step-by-step instructions, tags, and category
- **Ingredient**: Represents a recipe component with attributes including name, quantity, unit, and category (vegetables, meat/fish, seasonings, etc.)
- **User**: Represents an app user with attributes including email, password hash, saved recipes collection, and meal plan
- **Meal Plan Entry**: Represents a planned meal with attributes including date, meal type (breakfast/lunch/dinner/snack), associated recipe or free-form note
- **Grocery List Item**: Represents a shopping item with attributes including ingredient name, total quantity, unit, category, checked status, and list of recipes using this ingredient
- **User Session**: Represents an authenticated user session linking the user to their persisted data across devices

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can discover and view a recipe within 30 seconds of opening the app
- **SC-002**: Users can create a complete 7-day meal plan within 10 minutes
- **SC-003**: Users can generate a grocery list from their meal plan in under 5 seconds
- **SC-004**: 90% of users successfully complete account registration on their first attempt
- **SC-005**: Users can adjust recipe serving sizes and see updated ingredient quantities instantly (within 1 second)
- **SC-006**: The app loads and displays content on mobile devices within 3 seconds on standard 4G connections
- **SC-007**: Users can navigate between any two main sections of the app within 2 taps
- **SC-008**: 85% of users can successfully add a recipe to their meal plan from the Home page without viewing instructions
- **SC-009**: The grocery list intelligently merges duplicate ingredients with 100% accuracy
- **SC-010**: Users can complete the primary workflow (discover recipe → add to meal plan → generate grocery list) within 3 minutes

### Assumptions

- Users have access to a mobile device (smartphone or tablet) with internet connectivity
- Recipe data including images, ingredients, and instructions is available from a recipe database
- Nutritional information (calories, protein, carbohydrates) is pre-calculated and available for each recipe
- Standard measurement units are consistent across recipes (cups, tablespoons, grams, etc.)
- Users are comfortable with basic mobile app interactions (tapping, scrolling, form entry)
- The app will initially support a single language interface
- Image and video content for recipe instructions is hosted and accessible via URLs
- User authentication is based on email/password; social login or biometric authentication are not included in this specification
- The app requires internet connectivity for browsing recipes and syncing data; offline mode is not included in this specification
- Recipe ratings are pre-existing aggregated values; user-generated ratings and reviews are not included in this specification
