import React, { useState, useEffect, useRef } from 'react';
import { apiClient, type Recipe } from '../lib/api';

interface KitchenModeProps {
  recipeId: string;
  onExit?: () => void;
  initialScale?: number;
}

interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  remaining: number;
  isActive: boolean;
  isCompleted: boolean;
}

interface RecipeTimer {
  name: string;
  minutes: number;
  stepIndex?: number; // Which step this timer relates to
}

const KitchenMode: React.FC<KitchenModeProps> = ({ 
  recipeId, 
  onExit, 
  initialScale = 1 
}) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [scale, setScale] = useState(initialScale);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [customTimerName, setCustomTimerName] = useState('');
  const [recipeTimers, setRecipeTimers] = useState<RecipeTimer[]>([]);
  const [favoriteTimers, setFavoriteTimers] = useState<RecipeTimer[]>([]);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load favorite timers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('myFoodMap_favoriteTimers');
      if (saved) {
        setFavoriteTimers(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load favorite timers:', e);
    }
  }, []);

  // Load recipe data and parse instructions
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        const recipeData = await apiClient.getRecipe(recipeId, scale);
        setRecipe(recipeData);
        
        // Parse recipe timers if they exist
        if (recipeData.recipeTimers) {
          try {
            const parsedTimers: RecipeTimer[] = JSON.parse(recipeData.recipeTimers);
            setRecipeTimers(parsedTimers);
          } catch (e) {
            console.warn('Failed to parse recipe timers:', e);
            setRecipeTimers([]);
          }
        } else {
          setRecipeTimers([]);
        }
      } catch (err) {
        console.error('Error loading recipe for kitchen mode:', err);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId, scale]);

  // Parse instructions from JSON string to array
  let instructions: string[] = [];
  if (recipe) {
    try {
      instructions = JSON.parse(recipe.instructions);
    } catch (e) {
      console.error('Error parsing instructions:', e);
      instructions = [recipe.instructions]; // Fallback to treating as single instruction
    }
  }

  // Timer management
  useEffect(() => {
    if (timers.some(timer => timer.isActive)) {
      timerIntervalRef.current = setInterval(() => {
        setTimers(prevTimers => 
          prevTimers.map(timer => {
            if (timer.isActive && timer.remaining > 0) {
              const newRemaining = timer.remaining - 1;
              if (newRemaining === 0) {
                // Timer completed - play sound/notification
                playTimerSound();
                return { ...timer, remaining: 0, isActive: false, isCompleted: true };
              }
              return { ...timer, remaining: newRemaining };
            }
            return timer;
          })
        );
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timers]);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const playTimerSound = () => {
    // Simple beep sound - could be replaced with actual audio file
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen not supported');
      }
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const addTimer = (name: string, minutes: number) => {
    const newTimer: Timer = {
      id: `timer-${Date.now()}`,
      name: name || `${minutes} min timer`,
      duration: minutes * 60,
      remaining: minutes * 60,
      isActive: false,
      isCompleted: false
    };
    setTimers(prev => [...prev, newTimer]);
  };

  const addCustomTimer = () => {
    if (customTimerMinutes > 0) {
      const timerName = customTimerName.trim() || `${customTimerMinutes} min timer`;
      addTimer(timerName, customTimerMinutes);
      setCustomTimerName(''); // Reset name after adding
    }
  };

  const saveFavoriteTimer = (name: string, minutes: number) => {
    const newFavorite: RecipeTimer = { name, minutes };
    const updated = [...favoriteTimers, newFavorite];
    setFavoriteTimers(updated);
    localStorage.setItem('myFoodMap_favoriteTimers', JSON.stringify(updated));
  };

  const removeFavoriteTimer = (index: number) => {
    const updated = favoriteTimers.filter((_, i) => i !== index);
    setFavoriteTimers(updated);
    localStorage.setItem('myFoodMap_favoriteTimers', JSON.stringify(updated));
  };

  const startTimer = (timerId: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === timerId 
          ? { ...timer, isActive: true, isCompleted: false }
          : timer
      )
    );
  };

  const pauseTimer = (timerId: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === timerId 
          ? { ...timer, isActive: false }
          : timer
      )
    );
  };

  const removeTimer = (timerId: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== timerId));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (instructions && currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Preparing Kitchen Mode...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Unable to Load Recipe</h2>
          <p className="mb-6">{error || 'Recipe not found'}</p>
          <button 
            onClick={onExit}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Exit Kitchen Mode
          </button>
        </div>
      </div>
    );
  }

  const currentInstruction = instructions[currentStep];
  const progress = ((currentStep + 1) / instructions.length) * 100;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gray-900 text-white overflow-hidden flex flex-col z-[60]"
    >
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onExit}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Exit Kitchen Mode"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold truncate">{recipe.title}</h1>
          <span className="text-sm text-gray-400">({Math.round(recipe.servings * scale)} servings)</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Scale Controls */}
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
            <span className="text-sm">Scale:</span>
            <button 
              onClick={() => handleScaleChange(Math.max(0.25, scale - 0.25))}
              className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center">{scale}×</span>
            <button 
              onClick={() => handleScaleChange(Math.min(4, scale + 0.25))}
              className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
            >
              +
            </button>
          </div>

          {/* Ingredients Toggle */}
          <button 
            onClick={() => setShowIngredients(!showIngredients)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showIngredients 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            Ingredients
          </button>

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Ingredients Sidebar */}
        {showIngredients && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Ingredients</h3>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="font-medium">{ingredient.ingredient.name}</span>
                  <span className="text-green-400 font-bold">
                    {parseFloat((ingredient.amount * scale).toFixed(2))} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Recipe-specific Timers */}
            {recipeTimers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Recipe Timers</h4>
                <div className="space-y-2">
                  {recipeTimers.map((timer, index) => (
                    <button
                      key={index}
                      onClick={() => addTimer(timer.name, timer.minutes)}
                      className="w-full text-left px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{timer.name}</span>
                        <span className="text-emerald-200">{timer.minutes}m</span>
                      </div>
                      {timer.stepIndex !== undefined && (
                        <div className="text-sm text-emerald-200 mt-1">
                          For step {timer.stepIndex + 1}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Timer Buttons */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-3">Quick Timers</h4>
              <div className="grid grid-cols-2 gap-2">
                {[1, 3, 5, 10, 15, 20].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => addTimer(`${minutes} min timer`, minutes)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Timer */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Custom Timer</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Timer Name (optional)</label>
                  <input
                    type="text"
                    value={customTimerName}
                    onChange={(e) => setCustomTimerName(e.target.value)}
                    placeholder="e.g., Boil eggs"
                    className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Minutes</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCustomTimerMinutes(Math.max(1, customTimerMinutes - 1))}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={customTimerMinutes}
                      onChange={(e) => setCustomTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 bg-gray-600 text-white text-center rounded-lg border border-gray-500 focus:border-blue-400 focus:outline-hidden"
                    />
                    <button
                      onClick={() => setCustomTimerMinutes(Math.min(180, customTimerMinutes + 1))}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={addCustomTimer}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
                >
                  Add Timer
                </button>
                
                {customTimerName.trim() && customTimerMinutes > 0 && (
                  <button
                    onClick={() => saveFavoriteTimer(customTimerName.trim(), customTimerMinutes)}
                    className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors font-medium text-sm"
                  >
                    💾 Save as Favorite
                  </button>
                )}
              </div>
            </div>

            {/* Favorite Timers */}
            {favoriteTimers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Favorite Timers</h4>
                <div className="space-y-2">
                  {favoriteTimers.map((timer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <button
                        onClick={() => addTimer(timer.name, timer.minutes)}
                        className="flex-1 text-left px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{timer.name}</span>
                          <span className="text-purple-200 text-sm">{timer.minutes}m</span>
                        </div>
                      </button>
                      <button
                        onClick={() => removeFavoriteTimer(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove favorite"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Step Progress */}
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            {/* Large Step Counter */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold">{currentStep + 1}</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    Step {currentStep + 1}
                  </div>
                  <div className="text-lg text-gray-300">
                    of {instructions.length} steps
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">
                    {progress.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    complete
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step Dots */}
            <div className="flex justify-center space-x-2 mb-3">
              {instructions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep 
                      ? 'bg-blue-500 scale-125' 
                      : index < currentStep 
                        ? 'bg-green-500 hover:bg-green-400' 
                        : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  title={`Go to step ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="max-w-4xl text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                {currentInstruction}
              </h2>
              
              {/* Step Navigation */}
              <div className="flex justify-center space-x-6 mt-12">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 ${
                    currentStep === 0 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-600 hover:bg-gray-500 hover:scale-105'
                  }`}
                >
                  ← Previous
                </button>
                
                <button 
                  onClick={nextStep}
                  disabled={currentStep === instructions.length - 1}
                  className={`px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 ${
                    currentStep === instructions.length - 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 hover:scale-105'
                  }`}
                >
                  Next →
                </button>
              </div>
              
              {/* Quick Step Navigation */}
              {instructions.length > 1 && (
                <div className="mt-8">
                  <p className="text-sm text-gray-400 mb-3">Quick jump to step:</p>
                  <div className="flex justify-center flex-wrap gap-2">
                    {instructions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                          index === currentStep 
                            ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                            : index < currentStep 
                              ? 'bg-green-600 text-white hover:bg-green-500' 
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                        title={`Jump to step ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Timers */}
          {timers.length > 0 && (
            <div className="bg-gray-800 border-t border-gray-700 p-4">
              <div className="flex flex-wrap gap-4">
                {timers.map(timer => (
                  <div 
                    key={timer.id}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                      timer.isCompleted 
                        ? 'bg-green-600' 
                        : timer.isActive 
                          ? 'bg-blue-600' 
                          : 'bg-gray-600'
                    }`}
                  >
                    <span className="font-medium">{timer.name}</span>
                    <span className="font-mono text-lg">
                      {formatTime(timer.remaining)}
                    </span>
                    
                    {!timer.isCompleted && (
                      <button
                        onClick={() => timer.isActive ? pauseTimer(timer.id) : startTimer(timer.id)}
                        className="p-1 hover:bg-black/20 rounded"
                      >
                        {timer.isActive ? (
                          // Pause icon
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          // Play icon
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a.5.5 0 01.533 0l8 5a.5.5 0 010 .844l-8 5a.5.5 0 01-.8-.422V3.877a.5.5 0 01.267-.422z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeTimer(timer.id)}
                      className="p-1 hover:bg-red-500/50 rounded text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenMode;