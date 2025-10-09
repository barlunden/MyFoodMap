# ARFID-Specific Filtering Considerations

## Current Implementation
- Simple checkbox: "ARFID-friendly only"
- Basic binary filter (yes/no)

## ARFID Complexity Considerations

### Sensory Sensitivities
- **Texture preferences**: Smooth, crunchy, soft, chewy, etc.
- **Temperature preferences**: Hot, cold, room temperature
- **Visual appearance**: Colors, mixed textures, presentation
- **Smell sensitivity**: Strong vs. mild aromas
- **Taste intensity**: Bland, mild, strong flavors

### Common ARFID Patterns
- **Safe foods**: Individual lists of accepted foods
- **Brand specificity**: Only certain brands of ingredients
- **Preparation methods**: Specific cooking techniques
- **Cross-contamination concerns**: Foods that can't touch
- **Portion expectations**: Specific serving sizes

### Individual Variations
- **Age-related differences**: Child vs. adult needs
- **Sensory processing differences**: Hyper vs. hyposensitive
- **Medical restrictions**: Allergies, intolerances
- **Expansion readiness**: Willingness to try new foods

## Proposed Enhanced Filter System

### Level 1: Basic ARFID Support (Current)
```
☑ ARFID-friendly
```

### Level 2: Sensory Categories
```
Texture Preferences:
☐ Smooth/pureed
☐ Soft/tender  
☐ Crunchy/crispy
☐ Chewy/firm

Temperature:
☐ Served hot
☐ Served cold  
☐ Room temperature

Visual:
☐ Single colors
☐ No mixed textures
☐ Familiar shapes
```

### Level 3: Individual Profiles (Future)
```
Personal Safe Foods Profile:
- User-defined safe ingredient lists
- Texture preference mapping
- Trigger food avoidance
- Brand preferences
- Preparation method requirements
```

### Level 4: Therapeutic Integration
```
Expansion Goals:
☐ Similar to safe foods
☐ Gradual texture introduction
☐ New flavor exploration
☐ Healthcare provider approved
```

## Implementation Recommendations

### Phase 1 (Current): Keep Simple
- Maintain basic ARFID checkbox
- Focus on clearly labeled, simple recipes
- Use descriptive tags for common preferences

### Phase 2: Enhanced Filtering
- Add sensory category filters
- Implement texture/temperature tags
- Create recipe difficulty levels for ARFID

### Phase 3: Personalization
- User sensory profiles
- AI-powered safe food recommendations
- Integration with healthcare provider goals

### Phase 4: Community Support
- ARFID community recipe sharing
- Parent/caregiver collaboration tools
- Progress tracking and expansion goals

## Recipe Tagging Strategy

### Current Tags
```
'ARFID-friendly' // Generic support
```

### Enhanced Tags (Future)
```
// Sensory descriptors
'smooth-texture'
'no-mixed-textures'
'mild-flavor'
'familiar-ingredients'
'single-color'

// Preparation indicators  
'no-cooking-required'
'simple-prep'
'brand-flexible'
'temperature-flexible'

// Expansion support
'safe-food-variation'
'texture-bridge'
'flavor-introduction'
'healthcare-approved'
```

## User Experience Considerations

### Avoid Overwhelm
- Progressive disclosure of filter options
- Smart defaults based on user profile
- Optional advanced filtering

### Positive Framing
- Focus on "supports" rather than "restrictions"
- Celebrate food victories and expansion
- Avoid medical/clinical language in UI

### Family-Centered Design
- Multi-user household profiles
- Caregiver and individual preferences
- Shared safe food databases

## Technical Implementation Notes

### Database Schema Extensions
```prisma
model UserARFIDProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  
  // Sensory preferences
  preferredTextures String[] // ['smooth', 'crunchy', 'soft']
  avoidedTextures   String[] // ['slimy', 'chunky', 'sticky']
  temperaturePrefs  String[] // ['hot', 'cold', 'room-temp']
  
  // Safe foods
  safeFoods         String[] // User-defined safe ingredient list
  triggerFoods      String[] // Foods to avoid
  brandPreferences  Json?    // Brand-specific requirements
  
  // Expansion goals
  expansionGoals    String[] // Therapeutic objectives
  willingnessLevel  Int      // 1-10 scale for trying new foods
  
  // Healthcare integration
  providerNotes     String?
  lastUpdated       DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
}
```

### Search Query Enhancement
```typescript
interface ARFIDSearchFilters {
  // Current
  isARFIDFriendly?: boolean;
  
  // Enhanced (future)
  textures?: string[];
  temperatures?: string[];
  flavorIntensity?: 'mild' | 'moderate' | 'strong';
  visualComplexity?: 'simple' | 'moderate' | 'complex';
  
  // Personal (future)
  safeFoodsOnly?: boolean;
  expansionCandidate?: boolean;
  similarToFavorites?: boolean;
}
```

---

**Recommendation**: Keep the current simple implementation for now, but design the architecture to support progressive enhancement as we better understand user needs and gather feedback from the ARFID community.