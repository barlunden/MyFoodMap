# MyFoodMap 🍎📊

A personalized food tracking and nutrition management app designed for families with ARFID (Avoidant/Restrictive Food Intake Disorder) and specific dietary needs.

## ✨ Features

- **📝 Food Diary** - Simple, non-judgmental food logging with automatic nutrition calculation
- **🧮 Nutrition Database** - Comprehensive ingredient database with macronutrients and micronutrients
- **📖 Recipe Management** - Create and manage ARFID-friendly recipes with scaling capabilities
- **⏰ Kitchen Mode** - Full-screen cooking interface with customizable timers
- **🎯 ARFID-Focused Design** - Clean, anxiety-reducing interface designed for sensitive eaters

## 🚀 Live Demo

[View Demo on Netlify](https://your-app-name.netlify.app) *(coming soon)*

## 🏗️ Architecture

**Hybrid Full-Stack Application:**
- **Frontend:** Astro + React + Tailwind CSS
- **Backend:** Express.js + TypeScript + Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **Deployment:** Netlify (frontend) + Railway/Render (backend)

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myfoodmap.git
   cd myfoodmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

3. **Database setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your database URL
   # DATABASE_URL="postgresql://username:password@localhost:5432/myfoodmap"
   
   # Run migrations
   npm run db:migrate
   ```

4. **Start development servers**
   ```bash
   # Frontend (http://localhost:4321)
   npm run dev:frontend
   
   # Backend (http://localhost:3001)
   npm run dev:backend
   
   # Both servers concurrently
   npm run dev:all
   ```

## 📊 Core Functionality

### Food Logging with Automatic Nutrition
```javascript
// Example: Log "ostepop" (cheese puffs) - 25g portion
// Automatically calculates:
// - Calories: 130 (520 cal/100g × 0.25)
// - Protein: 1.5g
// - Carbs: 12.5g  
// - Fat: 8g
```

### ARFID-Specific Features
- **Safe Foods Database** - Track reliable, accepted foods
- **Gradual Exposure Logging** - Document small steps toward new foods
- **Texture/Sensory Categories** - Filter ingredients by sensory properties
- **Medical Documentation** - Export nutrition data for healthcare providers

## 🎯 Use Cases

- **Parents of children with ARFID** - Track actual food intake and nutrition
- **Healthcare providers** - Monitor patient nutrition patterns
- **Individuals with eating difficulties** - Self-monitor without judgment
- **Nutrition researchers** - Study eating patterns in sensitive populations

## 🛠️ Available Scripts

```bash
# Development
npm run dev:frontend    # Start Astro frontend
npm run dev:backend     # Start Express backend
npm run dev:all        # Start both servers

# Database
npm run db:migrate     # Run Prisma migrations
npm run db:studio      # Open Prisma Studio
npm run db:generate    # Generate Prisma client
npm run db:reset       # Reset database

# Building
npm run build:frontend # Build Astro app
npm run build:backend  # Build Express app
npm run build:all      # Build everything
```

## 📁 Project Structure

```
myfoodmap/
├── frontend/          # Astro + React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Astro pages (file-based routing)
│   │   ├── layouts/     # Page layouts
│   │   └── lib/         # API client and utilities
├── backend/           # Express.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Backend utilities
├── shared/           # Shared code and configuration
│   └── prisma/          # Database schema and migrations
└── docs/             # Documentation
```

## 🌟 Key Components

- **FoodDiary** - Main logging interface with ingredient integration
- **NutritionManager** - Ingredient database CRUD operations
- **KitchenMode** - Full-screen cooking interface with timers
- **RecipeScaler** - Proportional ingredient scaling based on key ingredients

## 🎨 Design Philosophy

**ARFID-Friendly Principles:**
- Minimal cognitive load
- Non-judgmental language
- Flexible portion sizes
- Familiar food categories
- Gradual exposure support

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome! 

## 📄 License

MIT License - feel free to use for personal or educational purposes.

## 🔗 Contact

- **Developer:** Age Jan Barlund
- **Purpose:** Supporting families with ARFID and eating difficulties
- **Company:** Comino Web

---

*Built with care for families navigating eating challenges* ❤️
