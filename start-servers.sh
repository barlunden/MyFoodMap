#!/bin/bash

# Server startup script for RecipeScaler
echo "🧹 Ryddar opp gamle serverar..."
pkill -f "tsx.*foodCalc" 2>/dev/null || true
pkill -f "astro.*foodCalc" 2>/dev/null || true
lsof -ti:3001,4321 | xargs kill -9 2>/dev/null || true

sleep 1

echo "🚀 Startar backend på port 3001..."
cd /Users/agejanbarlund/WebDev/foodCalc/backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo "🎨 Startar frontend på port 4321..."
cd /Users/agejanbarlund/WebDev/foodCalc/frontend  
npm run dev &
FRONTEND_PID=$!

echo "✅ Serverane kjører:"
echo "   Backend:  http://localhost:3001 (PID: $BACKEND_PID)"
echo "   Frontend: http://localhost:4321 (PID: $FRONTEND_PID)"
echo ""
echo "🛑 For å stoppe: kill $BACKEND_PID $FRONTEND_PID"

# Vent på begge prosessane
wait