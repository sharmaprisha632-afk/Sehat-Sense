
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { MealSuggestion, DrinkSuggestion } from '../types';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Check, X } from 'lucide-react';
import { View } from '../../App';

type FeatureTab = 'planner' | 'drinks';

const MealPlanner: React.FC<{ initialTab: FeatureTab }> = ({ initialTab }) => {
    const [activeTab, setActiveTab] = useState<FeatureTab>(initialTab);

    return (
        <div className="space-y-6">
            <div className="flex justify-center bg-gray-200 rounded-full p-1">
                <button onClick={() => setActiveTab('planner')} className={`w-1/2 py-2 rounded-full font-semibold ${activeTab === 'planner' ? 'bg-white shadow' : ''}`}>🍽️ Meal Ideas</button>
                <button onClick={() => setActiveTab('drinks')} className={`w-1/2 py-2 rounded-full font-semibold ${activeTab === 'drinks' ? 'bg-white shadow' : ''}`}>🥤 Healthy Drinks</button>
            </div>
            {activeTab === 'planner' ? <MealIdeasGenerator /> : <HealthyDrinksGenerator />}
        </div>
    )
};

const MealIdeasGenerator = () => {
    const { profile } = useApp();
    const [filters, setFilters] = useState({ mealType: 'Lunch', time: 'Moderate (20-30 min)', cuisine: 'North Indian' });
    const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<MealSuggestion | null>(null);
    
    const handleGenerate = async () => {
        if (!profile) return;
        setIsLoading(true);
        setSuggestions([]);
        try {
            const result = await geminiService.generateMealIdeas(profile, filters);
            setSuggestions(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-heading font-semibold mb-4">Find your next healthy meal</h2>
                {/* Filters can be added here */}
                <div className="text-center">
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? 'Generating...' : '🎯 Generate Personalized Meals'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-2">AI is cooking up some ideas...</p> </div>}

            {suggestions.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {suggestions.map((meal, index) => (
                        <Card key={index} className="flex flex-col">
                            <img src={meal.image} alt={meal.name} className="w-full h-48 object-cover rounded-t-xl mb-4" />
                            <h3 className="text-xl font-heading font-bold">{meal.name}</h3>
                            <p className="text-sm text-text-secondary flex-grow">{meal.description}</p>
                             <div className="text-xs my-2">
                                <span>{meal.prepTime}</span> &bull; <span>{meal.difficulty}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Button onClick={() => setSelectedRecipe(meal)} className="w-full">Show Recipe</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
             {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
        </div>
    )
}

const HealthyDrinksGenerator = () => {
    const { profile } = useApp();
    const [filters, setFilters] = useState({ drinkType: 'all', timeOfDay: 'any' });
    const [suggestions, setSuggestions] = useState<DrinkSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!profile) return;
        setIsLoading(true);
        setSuggestions([]);
        try {
            const result = await geminiService.generateDrinkSuggestions(profile, filters);
            setSuggestions(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-heading font-semibold mb-4">Personalized Drink Recommendations</h2>
                <div className="text-center">
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Drinks'}
                    </Button>
                </div>
            </Card>

             {isLoading && <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-2">Mixing up some healthy drinks...</p> </div>}

            {suggestions.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {suggestions.map((drink, index) => (
                        <Card key={index}>
                            <h3 className="text-xl font-heading font-bold">🥤 {drink.name}</h3>
                            <div className="my-2">
                                {drink.perfectFor.map(p => <span key={p} className="text-xs bg-green-100 text-green-800 font-medium mr-2 px-2.5 py-0.5 rounded-full">{p}</span>)}
                            </div>
                            <p className="text-sm text-text-secondary flex-grow my-2">{drink.whyItWorks}</p>
                            <div className="text-xs text-text-secondary">
                                <span>Calories: {drink.calories}</span> | <span>Sugar: {drink.sugar}</span>
                            </div>
                            <details className="text-sm mt-2">
                                <summary className="cursor-pointer font-semibold">View Recipe</summary>
                                <ul className="list-disc list-inside mt-1">
                                    {drink.ingredients.map(i => <li key={i}>{i}</li>)}
                                </ul>
                                <p className="mt-1">{drink.recipe}</p>
                            </details>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

const RecipeModal: React.FC<{ recipe: MealSuggestion, onClose: () => void }> = ({ recipe, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24}/></button>
            <h2 className="text-2xl font-heading font-bold text-primary pr-8">{recipe.name}</h2>
            <div className="overflow-y-auto mt-4 pr-2">
                <p className="font-semibold text-lg mb-2">Why It's Great For You:</p>
                <p className="mb-4 text-text-secondary">{recipe.whyItsGood}</p>
                <h3 className="font-bold text-lg mb-2">Ingredients:</h3>
                <ul className="list-disc list-inside mb-4 text-text-secondary columns-2">{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                <h3 className="font-bold text-lg mb-2">Recipe:</h3>
                <ol className="list-decimal list-inside space-y-3">{recipe.recipe.map((step, i) => <li key={i}>{step}</li>)}</ol>
            </div>
        </Card>
    </div>
);


export default MealPlanner;
