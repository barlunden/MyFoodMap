# MyFoodMap - Deployment Guide

## 🚀 Netlify Deployment (Demo Mode)

This application is configured for easy deployment to Netlify with a demo mode that uses localStorage instead of a backend database.

### Quick Deploy to Netlify

1. **Fork/Clone this repository**
2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Netlify will auto-detect the settings from `netlify.toml`

3. **Set Environment Variables (Optional):**
   - In Netlify dashboard: Site settings > Environment variables
   - Add `PUBLIC_DEMO_MODE=true` (this is automatically detected if hostname contains 'netlify')

4. **Deploy!**
   - Netlify will automatically build and deploy
   - Your app will be available at `https://your-app-name.netlify.app`

### What's included in Demo Mode

✅ **Full food diary functionality** - Log meals with automatic nutrition calculation  
✅ **Nutrition database management** - Add/edit ingredients with macronutrients  
✅ **Recipe management** - Create and view recipes (basic version)  
✅ **Kitchen mode with timers** - Full-screen cooking interface  
✅ **ARFID-friendly features** - Simple, non-judgmental food logging  

### Demo Data

The demo includes sample data:
- **Ingredients:** Chicken breast, rice, broccoli, banana, ostepop (cheese puffs)
- **Recipes:** Simple ARFID-friendly meals
- **Nutrition:** Full macronutrient data per 100g

### Local Development vs Demo

- **Local:** Uses backend database (PostgreSQL + Express.js)
- **Demo:** Uses browser localStorage (no server needed)

### Technical Architecture

- **Frontend:** Astro + React + Tailwind CSS
- **Demo Storage:** localStorage with automatic nutrition calculation
- **Build:** Static site generation for fast deployment

### Share with Your Colleague

Once deployed, share the URL with your colleague from Comino Web. They can:
- Test all food logging features
- Experience the ARFID-focused UX design
- Provide feedback on nutrition tracking functionality
- See the potential for expansion

### Example Features in Action

```javascript
// Log "ostepop" (cheese puffs) - 25g portion
// Automatically calculates:
// - Calories: 130 (520 cal/100g × 0.25)
// - Protein: 1.5g
// - Carbs: 12.5g  
// - Fat: 8g
```

### Future Backend Integration

The code is ready for backend integration - just:
1. Set `PUBLIC_DEMO_MODE=false`
2. Deploy backend to service like Railway/Render
3. Set `PUBLIC_API_URL` to backend URL

---

**Perfect for showing ARFID-focused nutrition tracking potential! 🍎📊**