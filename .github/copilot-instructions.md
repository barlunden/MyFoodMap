# RecipeScaler AI Coding Instructions

## Project Overview
RecipeScaler is a personalized recipe management app with nutritional insights, designed for families with ARFID or specific dietary needs. It enables smart recipe scaling based on key ingredients and automatic nutritional calculations.

## Architecture Overview
Hybrid full-stack architecture with Astro frontend + Express.js backend:

### Frontend Structure
- **Astro** static site generation with **React** islands for interactivity
- **Tailwind CSS v3** for responsive styling (compatible with @astrojs/tailwind)
- Pages in `/src/pages/` (file-based routing)
- React components in `/src/components/` for dynamic UI
- Layouts in `/src/layouts/` for shared page structure
- Kitchen mode: full-screen step-by-step cooking interface

### Backend Structure
- **Express.js + TypeScript** REST API in `/server/`
- **Prisma ORM** with **PostgreSQL** database
- **JWT + bcrypt** authentication
- Separate server process from frontend

## Key Domain Patterns

### Recipe Scaling Logic
- **Scaling key ingredient**: User selects one ingredient (e.g., eggs) as scaling base
- **Proportional adjustment**: All other ingredients scale proportionally using `scaleRecipe()` utility
- Maintain precision for baking ratios while handling unit conversions
- Example: Scale from 2 eggs → 3 eggs = 1.5x multiplier for all ingredients
- Implementation in `/server/src/utils/recipeScaling.ts`

### Nutritional Calculations
- Per-serving and total nutrition computed from ingredient database
- Macros: calories, protein, carbs, fat, fiber stored per 100g in `ingredients` table
- Micronutrients: vitamins, minerals for ARFID tracking
- Handle missing nutrition data gracefully with user warnings

### Data Modeling Conventions
- Quantities stored with units (`amount: number, unit: string`)
- Recipe instructions as `string[]` array for kitchen mode
- User authentication state managed via JWT tokens
- Prisma schema defines relationships: `User → Recipes → RecipeIngredients → Ingredients`

## Development Workflow

### Commands
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Frontend development (Astro)
npm run dev

# Backend development (Express)
npm run dev:server

# Both servers concurrently
npm run dev:all

# Database operations
npm run db:migrate
npm run db:studio
npm run db:generate
npm run db:reset

# Build for production
npm run build
npm run build:server
```

### Database Setup
1. Copy `.env.example` to `.env` and configure `DATABASE_URL`
2. Run `npm run db:migrate` to apply schema
3. Use `npm run db:studio` to view/edit data

## Integration Points
- **USDA FoodData Central API** for automated nutrient lookup (planned)
- **Open Food Facts** as backup nutrition source (planned)
- Future: AI recipe suggestions, grocery list generation
- Export: CSV/PDF meal plans and nutrition reports

## ARFID-Specific Considerations
- Flexible ingredient substitutions for dietary restrictions
- Clear nutritional transparency for medical tracking
- Simple UI to reduce food-related anxiety
- Secure sharing capabilities with healthcare providers

## Testing Approach
- Unit tests for scaling calculation functions with known ratios
- Integration tests for nutrition API responses and data processing
- E2E tests for kitchen mode and recipe scaling workflows
- Validate accuracy of proportional scaling and unit conversions

---
*Focus on recipe scaling accuracy, nutritional transparency, and ARFID-friendly UX patterns.*