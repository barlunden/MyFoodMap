import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample ingredients
  const flour = await prisma.ingredient.create({
    data: {
      name: 'All-Purpose Flour',
      category: 'Grains',
      calories: 364,
      protein: 10.3,
      carbs: 76.3,
      fat: 1.0,
      fiber: 2.7,
      sodium: 2,
      calcium: 15,
      iron: 4.6,
    },
  });

  const eggs = await prisma.ingredient.create({
    data: {
      name: 'Large Eggs',
      category: 'Protein',
      calories: 155,
      protein: 13.0,
      carbs: 1.1,
      fat: 11.0,
      fiber: 0,
      sodium: 124,
      calcium: 50,
      iron: 1.2,
    },
  });

  const sugar = await prisma.ingredient.create({
    data: {
      name: 'Granulated Sugar',
      category: 'Sweeteners',
      calories: 387,
      protein: 0,
      carbs: 100.0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      calcium: 1,
      iron: 0.01,
    },
  });

  const butter = await prisma.ingredient.create({
    data: {
      name: 'Unsalted Butter',
      category: 'Dairy',
      calories: 717,
      protein: 0.9,
      carbs: 0.1,
      fat: 81.0,
      fiber: 0,
      sodium: 11,
      calcium: 24,
      iron: 0.02,
    },
  });

  // Add more common ingredients
  const milk = await prisma.ingredient.create({
    data: {
      name: 'Whole Milk',
      category: 'Dairy',
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.2,
      fiber: 0,
      sodium: 44,
      calcium: 113,
      iron: 0.03,
    },
  });

  const bakingPowder = await prisma.ingredient.create({
    data: {
      name: 'Baking Powder',
      category: 'Leavening',
      calories: 53,
      protein: 0,
      carbs: 28.0,
      fat: 0,
      fiber: 0,
      sodium: 10600,
      calcium: 5876,
      iron: 0.37,
    },
  });

  const salt = await prisma.ingredient.create({
    data: {
      name: 'Table Salt',
      category: 'Seasonings',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 38900,
      calcium: 24,
      iron: 0.33,
    },
  });

  const vanilla = await prisma.ingredient.create({
    data: {
      name: 'Vanilla Extract',
      category: 'Flavorings',
      calories: 288,
      protein: 0.1,
      carbs: 12.7,
      fat: 0.1,
      fiber: 0,
      sodium: 9,
      calcium: 11,
      iron: 0.12,
    },
  });

  const chickenBreast = await prisma.ingredient.create({
    data: {
      name: 'Chicken Breast',
      category: 'Protein',
      calories: 165,
      protein: 31.0,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sodium: 74,
      calcium: 15,
      iron: 0.9,
    },
  });

  const rice = await prisma.ingredient.create({
    data: {
      name: 'White Rice',
      category: 'Grains',
      calories: 365,
      protein: 7.1,
      carbs: 80.0,
      fat: 0.7,
      fiber: 1.3,
      sodium: 5,
      calcium: 28,
      iron: 0.8,
    },
  });

  const onion = await prisma.ingredient.create({
    data: {
      name: 'Yellow Onion',
      category: 'Vegetables',
      calories: 40,
      protein: 1.1,
      carbs: 9.3,
      fat: 0.1,
      fiber: 1.7,
      sodium: 4,
      calcium: 23,
      iron: 0.21,
    },
  });

  const garlic = await prisma.ingredient.create({
    data: {
      name: 'Fresh Garlic',
      category: 'Vegetables',
      calories: 149,
      protein: 6.4,
      carbs: 33.1,
      fat: 0.5,
      fiber: 2.1,
      sodium: 17,
      calcium: 181,
      iron: 1.7,
    },
  });

  const oliveOil = await prisma.ingredient.create({
    data: {
      name: 'Extra Virgin Olive Oil',
      category: 'Oils',
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100.0,
      fiber: 0,
      sodium: 2,
      calcium: 1,
      iron: 0.56,
    },
  });

  const pasta = await prisma.ingredient.create({
    data: {
      name: 'Spaghetti Pasta',
      category: 'Grains',
      calories: 371,
      protein: 13.0,
      carbs: 74.7,
      fat: 1.5,
      fiber: 3.2,
      sodium: 6,
      calcium: 21,
      iron: 1.3,
    },
  });

  const tomatoSauce = await prisma.ingredient.create({
    data: {
      name: 'Tomato Sauce',
      category: 'Sauces',
      calories: 32,
      protein: 1.8,
      carbs: 7.3,
      fat: 0.2,
      fiber: 1.4,
      sodium: 431,
      calcium: 16,
      iron: 0.9,
    },
  });

  // Create a sample user
  const sampleUser = await prisma.user.create({
    data: {
      email: 'demo@recipescaler.com',
      username: 'demo_user',
      password: '$2b$10$dummy.hash.for.demo.purposes', // This would be properly hashed in real usage
      name: 'Demo User',
      bio: 'Sample user for testing RecipeScaler',
      dietaryPreferences: JSON.stringify(['vegetarian-friendly']),
      arfidConsiderations: JSON.stringify({
        textures: ['smooth', 'creamy'],
        temperatures: ['warm', 'room-temp'],
        flavors: ['mild', 'sweet']
      }),
    },
  });

  // Create a sample recipe
  const pancakeRecipe = await prisma.recipe.create({
    data: {
      title: 'Simple Pancakes',
      description: 'Fluffy, easy pancakes perfect for breakfast',
      instructions: JSON.stringify([
        'Mix dry ingredients in a large bowl',
        'Whisk eggs and milk in separate bowl',
        'Combine wet and dry ingredients until just mixed',
        'Heat griddle over medium heat',
        'Pour 1/4 cup batter per pancake',
        'Cook until bubbles form, then flip',
        'Cook until golden brown'
      ]),
      servings: 4,
      prepTime: 10,
      cookTime: 15,
      difficulty: 'Easy',
      visibility: 'PUBLIC',
      isArfidFriendly: true,
      tags: JSON.stringify(['breakfast', 'easy', 'family-friendly']),
      userId: sampleUser.id,
    },
  });

  // Add ingredients to the recipe
  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: pancakeRecipe.id,
        ingredientId: flour.id,
        amount: 2,
        unit: 'cups',
        order: 0,
      },
      {
        recipeId: pancakeRecipe.id,
        ingredientId: eggs.id,
        amount: 2,
        unit: 'large',
        order: 1,
      },
      {
        recipeId: pancakeRecipe.id,
        ingredientId: milk.id,
        amount: 1.5,
        unit: 'cups',
        order: 2,
      },
      {
        recipeId: pancakeRecipe.id,
        ingredientId: sugar.id,
        amount: 2,
        unit: 'tablespoons',
        order: 3,
      },
      {
        recipeId: pancakeRecipe.id,
        ingredientId: butter.id,
        amount: 3,
        unit: 'tablespoons',
        order: 4,
      },
      {
        recipeId: pancakeRecipe.id,
        ingredientId: bakingPowder.id,
        amount: 2,
        unit: 'teaspoons',
        order: 5,
      },
      {
        recipeId: pancakeRecipe.id,
        ingredientId: salt.id,
        amount: 0.5,
        unit: 'teaspoon',
        order: 6,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Created user: ${sampleUser.username}`);
  console.log(`Created recipe: ${pancakeRecipe.title}`);
  console.log(`Added ${await prisma.ingredient.count()} ingredients`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });