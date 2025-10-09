# 🔄 Project Restructure Plan

## Current Issues:
- Mixed frontend/backend code in root
- Unclear dependency ownership
- Terminal execution confusion
- Prisma client generation conflicts

## Target Structure:
```
foodCalc/
├── frontend/             # Pure Astro/React app
├── backend/              # Pure Node.js/Express API
├── shared/               # Database schema, types
└── package.json          # Orchestration only
```

## Migration Steps:

### 1. Create New Structure
```bash
mkdir -p frontend backend shared/prisma shared/types
```

### 2. Move Frontend Code
```bash
mv src/ frontend/
mv public/ frontend/
mv astro.config.mjs frontend/
mv tailwind.config.js frontend/
mv tsconfig.json frontend/
```

### 3. Move Backend Code
```bash
mv server/* backend/
```

### 4. Move Shared Resources
```bash
mv prisma/ shared/
```

### 5. Update Package Files
- Root package.json: orchestration scripts only
- Frontend package.json: Astro + React dependencies
- Backend package.json: Express + API dependencies

### 6. Update Import Paths
- Frontend: relative imports within frontend/
- Backend: relative imports within backend/
- Shared: explicit paths to shared/

## Benefits:
✅ Clear separation of concerns
✅ Independent dependency management
✅ Isolated execution contexts
✅ Easier testing and deployment
✅ No more terminal confusion

## Commands After Restructure:
```bash
# Frontend development
cd frontend && npm run dev

# Backend development  
cd backend && npm run dev

# Both together (from root)
npm run dev:all

# Database operations (from root)
npm run db:migrate
```

This structure eliminates all the execution context confusion we've been experiencing.