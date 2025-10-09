# ARFID Support Features - Development Plan

## 🎯 **Overview**
Extending RecipeScaler with comprehensive ARFID support features to help families track food acceptance, meal patterns, and behavioral challenges.

## 📋 **New Features**

### 1. **Safe Foods Management**
**Purpose**: Digital replacement for physical notebooks tracking accepted foods

#### Core Features:
- **Safe Foods List**: Create/edit list of foods the child accepts
- **Date Tracking**: Record when each food was first accepted (important milestone)
- **Food Categories**: Organize by type (proteins, carbs, fruits, etc.)
- **Notes**: Texture, preparation method, brand preferences
- **Photos**: Visual reference for specific presentations

#### User Stories:
- "As a parent, I want to add a new safe food with the date it was first accepted"
- "As a parent, I want to see the history of when foods were added to build confidence"
- "As a parent, I want to categorize foods to identify gaps in nutrition"

### 2. **Meal Logging**
**Purpose**: Track what and how much the child actually eats

#### Core Features:
- **Quick Meal Entry**: Select from safe foods list
- **Portion Tracking**: Amount eaten (visual portions: all, half, few bites, none)
- **Meal Context**: Breakfast, lunch, dinner, snack
- **Mood/Energy**: Pre and post-meal energy levels
- **Location**: Home, school, restaurant, etc.
- **Success Factors**: What helped (music, TV, company, etc.)

#### User Stories:
- "As a parent, I want to quickly log what my child ate at lunch"
- "As a parent, I want to see patterns of when my child eats best"
- "As a parent, I want to track if new foods are being accepted"

### 3. **Lockdown Logging**
**Purpose**: Track challenging episodes to identify patterns and solutions

#### Core Features:
- **Incident Recording**: Date, time, duration of episode
- **Triggers**: What preceded the lockdown (hunger, transitions, sensory)
- **Behaviors**: Description of what happened
- **Resolution**: What helped end the episode
- **Energy Level**: Child's energy before/after
- **Family Impact**: How it affected the whole family
- **Success Strategies**: What worked for next time

#### User Stories:
- "As a parent, I want to log a difficult mealtime to understand triggers"
- "As a parent, I want to see if lockdowns correlate with low energy/hunger"
- "As a parent, I want to identify successful resolution strategies"

## 🗃️ **Database Schema Extensions**

### Safe Foods Table
```sql
CREATE TABLE safe_foods (
  id STRING PRIMARY KEY,
  user_id STRING NOT NULL,
  food_name STRING NOT NULL,
  date_first_accepted DATE NOT NULL,
  category STRING, -- protein, carb, fruit, vegetable, dairy, snack
  preparation_notes TEXT,
  brand_preference STRING,
  texture_notes TEXT,
  photo_url STRING,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Meal Log Table
```sql
CREATE TABLE meal_logs (
  id STRING PRIMARY KEY,
  user_id STRING NOT NULL,
  safe_food_id STRING NOT NULL,
  meal_date DATE NOT NULL,
  meal_type STRING, -- breakfast, lunch, dinner, snack
  portion_eaten STRING, -- all, most, half, few-bites, none
  energy_before INTEGER, -- 1-5 scale
  energy_after INTEGER, -- 1-5 scale
  location STRING,
  success_factors TEXT,
  notes TEXT,
  created_at TIMESTAMP
);
```

### Lockdown Log Table
```sql
CREATE TABLE lockdown_logs (
  id STRING PRIMARY KEY,
  user_id STRING NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  duration_minutes INTEGER,
  energy_level_before INTEGER, -- 1-5 scale
  triggers TEXT,
  behaviors_observed TEXT,
  resolution_strategy TEXT,
  resolution_time_minutes INTEGER,
  family_impact_level INTEGER, -- 1-5 scale
  notes TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP
);
```

## 🎨 **UI/UX Design**

### Navigation Updates
```
Main Menu:
├── Recipes (existing)
├── 🍎 Safe Foods (NEW)
├── 📝 Meal Log (NEW)
├── ⚠️ Lockdown Log (NEW)
└── 📊 Progress Dashboard (NEW)
```

### Key UI Components

#### 1. Safe Foods Management
- **Add Food Form**: Simple, encouraging design
- **Food Grid**: Visual cards with photos
- **Timeline View**: See acceptance journey over time
- **Quick Add**: Floating action button for fast entry

#### 2. Meal Logging
- **Quick Log**: Swipe-based portion selection
- **Daily View**: Timeline of meals for the day
- **Food Picker**: Easy selection from safe foods
- **Energy Sliders**: Visual 1-5 scale indicators

#### 3. Lockdown Logging
- **Gentle Interface**: Calming colors, non-judgmental language
- **Quick Templates**: Common trigger/resolution patterns
- **Timeline Entry**: Simple chronological logging
- **Pattern Recognition**: Subtle insights, not blame

## 📊 **Analytics & Insights**

### Progress Dashboard
- **Safe Foods Growth**: Chart showing acceptance over time
- **Meal Success Rate**: Percentage of successful meals
- **Energy Patterns**: Correlation between meals and energy
- **Lockdown Trends**: Frequency and duration over time
- **Success Strategies**: Most effective resolution methods

### Pattern Recognition
- **Hunger-Lockdown Correlation**: Alert if episodes increase when meals missed
- **Energy-Acceptance Relationship**: Show optimal energy levels for trying new foods
- **Time-of-Day Patterns**: Best times for meals and challenges
- **Resolution Effectiveness**: Which strategies work best

## 🛠️ **Implementation Phases**

### Phase 1: Safe Foods (2-3 weeks)
1. Database schema for safe foods
2. Basic CRUD operations
3. Simple list view and add form
4. Date tracking and categories

### Phase 2: Meal Logging (2-3 weeks)
1. Meal log database schema
2. Quick logging interface
3. Integration with safe foods
4. Basic daily view

### Phase 3: Lockdown Logging (2-3 weeks)
1. Lockdown log database schema
2. Incident recording interface
3. Pattern templates
4. Basic analytics

### Phase 4: Analytics & Insights (3-4 weeks)
1. Progress dashboard
2. Pattern recognition algorithms
3. Export capabilities for healthcare providers
4. Advanced visualizations

## 🎯 **ARFID-Specific Considerations**

### Positive Focus
- **Celebration Language**: "New acceptance!" not "finally tried"
- **Progress Emphasis**: Show growth, not deficits
- **Non-Judgmental**: Neutral language for challenges

### Family Dynamics
- **Multiple Users**: Support for multiple children per family
- **Shared Access**: Both parents can log and view
- **Healthcare Integration**: Export reports for medical teams

### Accessibility
- **Low Stress**: Quick logging to reduce friction
- **Visual Cues**: Pictures and icons over text when possible
- **Offline Capability**: Log even without internet

## 📱 **Mobile-First Design**
- **Quick Actions**: Log meal or incident in under 30 seconds
- **Voice Notes**: Hands-free logging during stressful moments
- **Photo Integration**: Easy food and mood documentation
- **Notifications**: Gentle reminders, not pressure

## 🔒 **Privacy & Security**
- **Sensitive Data**: Extra protection for behavioral logs
- **Family Sharing**: Controlled access between family members
- **Healthcare Export**: Secure, HIPAA-compliant data sharing
- **Local Storage**: Option to keep data device-only

## 🎨 **Design Principles**
1. **Hope-Focused**: Every interaction builds confidence
2. **Judgment-Free**: Support, not criticism
3. **Pattern-Aware**: Help families see progress
4. **Stress-Reducing**: Minimize friction in difficult moments
5. **Empowering**: Give families tools for success

---

This comprehensive plan transforms RecipeScaler from a recipe management app into a complete ARFID family support system, addressing both nutritional and behavioral aspects of eating challenges.