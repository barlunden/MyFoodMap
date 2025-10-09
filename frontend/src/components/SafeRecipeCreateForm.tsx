import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import RecipePrivacySelector from './RecipePrivacySelector.tsx';
import { apiClient, type CreateRecipePayload } from '../lib/api';

interface Ingredient {
  id: string;
  amount: number;
  unit: string;
  name: string;
  notes?: string;
  category?: string;
  brand?: string;
  isOptional?: boolean;
}

interface RecipeFormData {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  scalingKeyIngredient?: string;
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  isArfidFriendly: boolean;
  arfidNotes?: string;
}

interface RecipeCreateFormProps {
  onSave?: (recipe: RecipeFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<RecipeFormData>;
}

const RecipeCreateFormInner: React.FC<RecipeCreateFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // All hooks must be called before any conditional returns
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'Easy',
    visibility: 'PUBLIC',
    ingredients: [{ id: '1', amount: 1, unit: 'cup', name: '', category: 'other' }],
    instructions: [''],
    tags: [],
    isArfidFriendly: false,
    ...initialData
  });

  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700 mb-6">You need to be logged in to create recipes.</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Common units for ingredients
  const commonUnits = [
    'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
    'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves', 'large', 'medium', 'small'
  ];

  // Common ingredient categories
  const ingredientCategories = [
    'protein', 'dairy', 'grain', 'vegetable', 'fruit', 'seasoning', 
    'oil', 'sweetener', 'leavening', 'other'
  ];

  // ARFID-friendly tags
  const arfidTags = [
    'Smooth texture', 'No mixed textures', 'Mild flavor', 'Familiar ingredients',
    'Single color', 'No strong smells', 'Room temperature safe', 'Brand flexible'
  ];

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      amount: 1,
      unit: 'cup',
      name: '',
      category: 'other'
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('Processing ingredients...');
      
      // Process ingredients for submission
      const ingredientData = formData.ingredients
        .filter(ing => ing.name.trim())
        .map((ing, index) => {
          console.log('Processing ingredient:', ing.name);
          return {
            amount: ing.amount,
            unit: ing.unit,
            notes: ing.notes,
            brand: ing.brand,
            isOptional: ing.isOptional || false,
            name: ing.name.trim(),
            category: ing.category || 'other'
          };
        });

      if (ingredientData.length === 0) {
        throw new Error('Please add at least one ingredient');
      }

      // Create or find ingredients and get their IDs
      console.log('Creating/finding ingredients...');
      const processedIngredients = await Promise.all(
        ingredientData.map(async (ing) => {
          try {
            // Find or create the ingredient by name
            const ingredientResponse = await apiClient.findOrCreateIngredient(
              ing.name,
              ing.category
            );
            
            return {
              amount: ing.amount,
              unit: ing.unit,
              notes: ing.notes,
              brand: ing.brand,
              isOptional: ing.isOptional,
              ingredientId: ingredientResponse.id
            };
          } catch (error) {
            console.error('Error processing ingredient:', ing.name, error);
            throw new Error(`Failed to process ingredient: ${ing.name}`);
          }
        })
      );

      // Prepare the recipe data for the API
      const recipePayload = {
        title: formData.title,
        description: formData.description,
        instructions: JSON.stringify(formData.instructions.filter(i => i.trim())),
        servings: formData.servings,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        difficulty: formData.difficulty,
        visibility: formData.visibility,
        isArfidFriendly: formData.isArfidFriendly,
        arfidNotes: formData.arfidNotes,
        tags: JSON.stringify(formData.tags),
        ingredients: processedIngredients
      };

      console.log('Submitting recipe:', recipePayload);

      // Create the recipe via API
      const createdRecipe = await apiClient.createRecipe(recipePayload);
      
      // Success - redirect to the new recipe
      window.location.href = `/recipes/${createdRecipe.id}`;

    } catch (error) {
      console.error('Error creating recipe:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Create New Recipe</h1>
        <p className="text-gray-600 mt-1">Share your recipe with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Basic Information */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mom's Perfect Scrambled Eggs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your recipe, any special techniques, or why it's great for families..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.prepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cookTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
          <RecipePrivacySelector
            value={formData.visibility}
            onChange={(visibility) => setFormData(prev => ({ ...prev, visibility }))}
          />
        </section>

        {/* ARFID Considerations */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ARFID & Dietary Considerations</h2>
          
          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.isArfidFriendly}
                onChange={(e) => setFormData(prev => ({ ...prev, isArfidFriendly: e.target.checked }))}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">This recipe is ARFID-friendly</div>
                <div className="text-sm text-gray-600">
                  Check this if your recipe uses familiar ingredients, simple preparations, 
                  and avoids common sensory triggers
                </div>
              </div>
            </label>

            {formData.isArfidFriendly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ARFID-Specific Notes
                </label>
                <textarea
                  value={formData.arfidNotes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, arfidNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Smooth texture, no strong smells, single color, brand-flexible ingredients..."
                />
              </div>
            )}
          </div>
        </section>

        {/* Ingredients */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Ingredient
            </button>
          </div>

          <div className="space-y-4">
            {formData.ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(ingredient.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {commonUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ingredient Name *</label>
                    <input
                      type="text"
                      required
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., Large eggs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={ingredient.category}
                      onChange={(e) => updateIngredient(ingredient.id, 'category', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {ingredientCategories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      disabled={formData.ingredients.length === 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Additional ingredient details */}
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand (optional)</label>
                    <input
                      type="text"
                      value={ingredient.brand || ''}
                      onChange={(e) => updateIngredient(ingredient.id, 'brand', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., Organic Valley, any brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={ingredient.notes || ''}
                      onChange={(e) => updateIngredient(ingredient.id, 'notes', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., Room temperature, finely chopped"
                    />
                  </div>
                </div>

                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={ingredient.isOptional || false}
                    onChange={(e) => updateIngredient(ingredient.id, 'isOptional', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">This ingredient is optional</span>
                </label>
              </div>
            ))}
          </div>

          {/* Scaling Key Ingredient */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scaling Key Ingredient (optional)
            </label>
            <select
              value={formData.scalingKeyIngredient || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, scalingKeyIngredient: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Choose an ingredient to use as scaling base...</option>
              {formData.ingredients.map(ing => (
                <option key={ing.id} value={ing.name}>
                  {ing.amount} {ing.unit} {ing.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              When users scale this recipe, all other ingredients will adjust proportionally based on this ingredient.
            </p>
          </div>
        </section>

        {/* Instructions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Instructions</h2>
            <button
              type="button"
              onClick={addInstruction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Step
            </button>
          </div>

          <div className="space-y-3">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this step in detail..."
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 transition-colors"
                  disabled={formData.instructions.length === 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add Tag
              </button>
            </div>

            {formData.isArfidFriendly && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ARFID-Friendly Suggested Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {arfidTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        }
                      }}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      disabled={formData.tags.includes(tag)}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex flex-col items-end">
            {/* Error Display */}
            {submitError && (
              <div className="text-red-600 text-sm mb-3 max-w-md text-right bg-red-50 p-2 rounded border border-red-200">
                {submitError}
              </div>
            )}
            
            <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                // Save as draft functionality
                console.log('Save as draft:', formData);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Creating Recipe...' : 'Publish Recipe'}</span>
            </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Self-contained wrapper component that provides AuthProvider
const SafeRecipeCreateForm: React.FC<RecipeCreateFormProps> = (props) => {
  return (
    <AuthProvider>
      <RecipeCreateFormInner {...props} />
    </AuthProvider>
  );
};

export default SafeRecipeCreateForm;