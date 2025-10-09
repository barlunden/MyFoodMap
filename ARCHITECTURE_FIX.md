# 🏗️ Architecture Fix: Proper Separation of Concerns

## Current Problems
1. **Dependency Confusion**: Frontend has backend dependencies
2. **Execution Context**: Commands run from wrong directories  
3. **Circular Dependencies**: Prisma client pointing to parent node_modules

## Solution: Clean Separation

### 📁 Directory Structure
```
foodCalc/
├── package.json          # Frontend only (Astro + React)
├── prisma/              # Shared schema (stays at root)
├── src/                 # Frontend code only
└── server/              # Backend completely isolated
    ├── package.json     # Backend dependencies only
    ├── src/            # Backend code only
    └── node_modules/   # Independent backend deps
```

### 🔧 Dependency Separation

#### Root package.json (Frontend + Orchestration)
```json
{
  "scripts": {
    "dev": "astro dev",
    "dev:server": "cd server && npm run dev", 
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    // Astro, React, Tailwind only
  },
  "devDependencies": {
    "prisma": "^5.22.0",      // Schema management only
    "concurrently": "^9.1.0"  // Script orchestration
  }
}
```

#### Server package.json (Backend Only)
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",  // Direct dependency, not file:
    "express": "^4.21.1",
    // Other backend deps
  },
  "devDependencies": {
    "tsx": "^4.20.6",           // Backend execution only
    "typescript": "^5.6.3"
  }
}
```

### 🎯 Execution Rules
1. **Frontend commands**: Run from root
2. **Backend commands**: Run from `server/` directory  
3. **Database commands**: Run from root (shared schema)
4. **Development**: Use `npm run dev:all` from root

### 🚀 Migration Steps
1. Remove tsx/prisma from root dependencies
2. Install proper @prisma/client in server/
3. Fix server package.json dependencies
4. Test isolation by running each service independently

This eliminates the circular dependency resolution and makes each service responsible for its own runtime dependencies.