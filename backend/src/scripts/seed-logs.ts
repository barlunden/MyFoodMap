import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLogs() {
  console.log('🌱 Seeding ARFID logs...');

  // Use the existing user ID from database
  const userId = 'cmglx0anx000f10evffnqrmwi';

  // Create some safe foods first
  const safeFoods = await Promise.all([
    prisma.safeFood.create({
      data: {
        userId,
        foodName: 'White Rice',
        dateFirstAccepted: new Date('2024-01-15'),
        category: 'carb',
        preparationNotes: 'Plain, no seasoning',
        textureNotes: 'Soft, individual grains',
        isActive: true,
        notes: 'Goes well with familiar proteins'
      }
    }),
    prisma.safeFood.create({
      data: {
        userId,
        foodName: 'Chicken Nuggets',
        dateFirstAccepted: new Date('2024-02-03'),
        category: 'protein',
        preparationNotes: 'Baked, not fried',
        brandPreference: 'Tyson brand only',
        textureNotes: 'Crispy outside, tender inside',
        isActive: true,
        notes: 'Cut into small pieces'
      }
    }),
    prisma.safeFood.create({
      data: {
        userId,
        foodName: 'Vanilla Yogurt',
        dateFirstAccepted: new Date('2024-03-10'),
        category: 'dairy',
        preparationNotes: 'Room temperature, not cold',
        brandPreference: 'Chobani vanilla',
        textureNotes: 'Smooth, no chunks',
        isActive: true,
        notes: 'Good source of protein'
      }
    })
  ]);

  console.log(`✅ Created ${safeFoods.length} safe foods`);

  // Create meal logs
  const mealLogs = await Promise.all([
    prisma.mealLog.create({
      data: {
        userId,
        safeFoodId: safeFoods[0].id, // White Rice
        mealDate: new Date('2024-12-08T12:00:00'),
        mealType: 'lunch',
        portionEaten: 'most',
        energyBefore: 3,
        energyAfter: 4,
        location: 'home',
        successFactors: 'Quiet environment, familiar bowl',
        notes: 'Good day overall'
      }
    }),
    prisma.mealLog.create({
      data: {
        userId,
        safeFoodId: safeFoods[1].id, // Chicken Nuggets
        mealDate: new Date('2024-12-07T18:30:00'),
        mealType: 'dinner',
        portionEaten: 'all',
        energyBefore: 4,
        energyAfter: 5,
        location: 'home',
        successFactors: 'Cut into small pieces, favorite plate',
        notes: 'Very successful meal'
      }
    }),
    prisma.mealLog.create({
      data: {
        userId,
        safeFoodId: safeFoods[2].id, // Vanilla Yogurt
        mealDate: new Date('2024-12-06T15:00:00'),
        mealType: 'snack',
        portionEaten: 'half',
        energyBefore: 2,
        energyAfter: 3,
        location: 'home',
        successFactors: 'Room temperature, small spoon',
        notes: 'Took some coaxing but went well'
      }
    })
  ]);

  console.log(`✅ Created ${mealLogs.length} meal logs`);

  // Create a lockdown log
  const lockdownLogs = await Promise.all([
    prisma.lockdownLog.create({
      data: {
        userId,
        incidentDate: new Date('2024-12-05T16:45:00'),
        incidentTime: '16:45',
        durationMinutes: 25,
        energyLevelBefore: 2,
        triggers: 'Unexpected texture in food, loud noise from construction',
        behaviorsObserved: 'Refusal to eat, crying, seeking comfort space',
        resolutionStrategy: 'Offered safe food alternative, quiet space, favorite blanket',
        resolutionTimeMinutes: 15,
        familyImpactLevel: 3,
        notes: 'Construction noise was a significant factor',
        lessonsLearned: 'Check food texture more carefully, have noise-canceling headphones ready'
      }
    })
  ]);

  console.log(`✅ Created ${lockdownLogs.length} lockdown logs`);

  console.log('🎉 ARFID logs seeded successfully!');
}

seedLogs()
  .catch((e) => {
    console.error('❌ Error seeding ARFID logs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });