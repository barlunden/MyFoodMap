# RecipeScaler Feature Roadmap

## Phase 1: Core User Management (Current Sprint)
### Authentication & Profiles
- [ ] User registration/login with email verification
- [ ] User profiles with bio, dietary preferences, ARFID considerations
- [ ] Password reset functionality
- [ ] Profile customization (avatar, preferences)

### Recipe Management
- [ ] Recipe creation form with rich editor
- [ ] Recipe privacy settings (Public, Private, Friends-only)
- [ ] Recipe ownership and edit permissions
- [ ] Recipe versioning/revision history
- [ ] Bulk recipe import/export

## Phase 2: Social Features
### Sharing & Discovery
- [ ] Featured recipe system for homepage
- [ ] Recipe favorites/bookmarking
- [ ] Recipe collections/folders
- [ ] Share recipes via link
- [ ] Recipe ratings and reviews
- [ ] Follow other users
- [ ] Recipe activity feed

### Search & Navigation
- [ ] Advanced search with filters:
  - Dietary restrictions (gluten-free, dairy-free, etc.)
  - Prep/cook time ranges
  - Difficulty level
  - Ingredient inclusion/exclusion
  - Nutritional targets (high protein, low sodium)
  - ARFID-friendly tags
- [ ] Category-based browsing
- [ ] Tag-based discovery
- [ ] Trending recipes
- [ ] Recently viewed recipes

## Phase 3: Advanced Nutrition Features
### Custom Nutrition Database
- [ ] User-contributed ingredient database
- [ ] Manual nutrition entry for recipes
- [ ] Nutrition data validation system
- [ ] Integration with USDA FoodData Central API
- [ ] Custom ingredient creation
- [ ] Nutrition label generator
- [ ] Allergen and sensitivity tracking

### ARFID-Specific Features
- [ ] Sensory-friendly recipe tags
- [ ] Texture and temperature preferences
- [ ] Safe food tracking
- [ ] Meal planning for limited diets
- [ ] Gradual food introduction tracking
- [ ] Healthcare provider sharing portal

## Phase 4: Enhanced User Experience
### Kitchen Features
- [ ] Shopping list generation from recipes
- [ ] Meal planning calendar
- [ ] Recipe scaling for meal prep
- [ ] Cooking timers and notifications
- [ ] Voice-guided cooking mode
- [ ] Ingredient substitution suggestions

### Mobile Experience
- [ ] Progressive Web App (PWA)
- [ ] Offline recipe access
- [ ] Mobile-optimized kitchen mode
- [ ] Barcode scanning for ingredients
- [ ] Photo upload for recipe steps

## Phase 5: Community & Advanced Features
### Community Features
- [ ] Recipe contests and challenges
- [ ] User groups/communities
- [ ] Recipe collaboration tools
- [ ] Chef/nutritionist verification badges
- [ ] Recipe recommendation engine
- [ ] Social media integration

### Analytics & Insights
- [ ] Personal nutrition tracking
- [ ] Recipe performance analytics
- [ ] Dietary goal tracking
- [ ] Ingredient usage insights
- [ ] Community trends analysis

## Technical Implementation Notes

### Database Schema Extensions
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  username        String    @unique
  displayName     String?
  bio             String?
  avatar          String?
  isVerified      Boolean   @default(false)
  dietaryPrefs    String[]  // JSON array of dietary preferences
  arfidConsiderations String? // ARFID-specific notes
  
  recipes         Recipe[]
  favorites       Favorite[]
  followers       Follow[] @relation("UserFollowers")
  following       Follow[] @relation("UserFollowing")
  reviews         Review[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Recipe {
  id              String    @id @default(cuid())
  title           String
  description     String?
  visibility      Visibility @default(PUBLIC) // PUBLIC, PRIVATE, FRIENDS_ONLY
  isFeatured      Boolean   @default(false)
  isArfidFriendly Boolean   @default(false)
  
  author          User      @relation(fields: [authorId], references: [id])
  authorId        String
  
  favorites       Favorite[]
  reviews         Review[]
  collections     RecipeCollection[]
  
  // ... existing recipe fields
}

model Favorite {
  id       String @id @default(cuid())
  user     User   @relation(fields: [userId], references: [id])
  userId   String
  recipe   Recipe @relation(fields: [recipeId], references: [id])
  recipeId String
  
  createdAt DateTime @default(now())
  
  @@unique([userId, recipeId])
}

model Follow {
  id          String @id @default(cuid())
  follower    User   @relation("UserFollowing", fields: [followerId], references: [id])
  followerId  String
  following   User   @relation("UserFollowers", fields: [followingId], references: [id])
  followingId String
  
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
}

enum Visibility {
  PUBLIC
  PRIVATE
  FRIENDS_ONLY
}
```

### API Endpoints to Implement
- `GET /api/recipes/featured` - Get featured recipe
- `GET /api/recipes/search` - Advanced search with filters
- `POST /api/recipes/{id}/favorite` - Toggle favorite
- `GET /api/users/{id}/favorites` - Get user's favorite recipes
- `GET /api/users/{id}/recipes` - Get user's recipes (respecting privacy)
- `POST /api/ingredients/custom` - Create custom ingredient with nutrition

### Frontend Components to Build
- `SearchBar` - Advanced search with filter dropdown
- `RecipePrivacySelector` - Privacy settings for recipe creation
- `FavoriteButton` - Heart icon with toggle functionality
- `FeaturedRecipeHero` - Homepage featured recipe display
- `UserProfile` - User profile page with recipe collections
- `RecipeCreateForm` - Comprehensive recipe creation form