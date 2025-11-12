import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { FoodAnalysis, LoggedMeal } from '../types';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const placeholders = [
    "e.g., 2 roti, paneer sabzi, dal",
    "Try typing: poha with peanuts",
    "Or: chicken biryani with raita"
];

const FoodAnalyzer: React.FC<{ setView: (view: any) => void }> = ({ setView }) => {
    const { profile, addMealToLog } = useApp();
    const [foodName, setFoodName] = useState('');
    const [placeholder, setPlaceholder] = useState(placeholders[0]);
    const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholder(p => placeholders[(placeholders.indexOf(p) + 1) % placeholders.length]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAnalyze = async () => {
        if (!foodName.trim() || !profile) {
            setError('Please describe your meal.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await geminiService.analyzeFood(foodName, profile);
            setAnalysisResult(result);
            
            const newMeal: LoggedMeal = {
                id: uuidv4(),
                name: foodName,
                timestamp: new Date().toISOString(),
                mealType: 'Lunch', // Simplified for now
                analysis: result
            };
            addMealToLog(newMeal);

        } catch (e) {
            setError("Sorry, we couldn't analyze your meal. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const ProgressBar: React.FC<{ value: number, goal: number, color: string }> = ({ value, goal, color}) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min((value/goal)*100, 100)}%` }}></div>
        </div>
    );

    const renderAnalysis = () => {
        if (!analysisResult) return null;
        
        const { overallScore, bloodSugarImpact, liverHealth, cholesterolImpact, weightLossAlignment, smartSuggestions, calories, protein, carbs, fats } = analysisResult;
        const scoreColor = overallScore > 80 ? 'text-green-500' : overallScore > 50 ? 'text-yellow-500' : 'text-red-500';

        return (
            <div className="mt-6 space-y-4 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="md:col-span-1 text-center">
                        <h3 className="font-bold text-lg">Overall Score</h3>
                        <p className={`text-6xl font-bold ${scoreColor}`}>{overallScore}</p>
                        <p className="text-text-secondary">out of 100</p>
                    </Card>
                     <Card className="md:col-span-2">
                        <h3 className="font-bold text-lg mb-2">Nutrition Breakdown</h3>
                        <div className="space-y-2 text-sm">
                           <p>Calories: {calories} kcal</p>
                           <ProgressBar value={protein} goal={50} color="bg-blue-500" />
                           <p>Protein: {protein}g</p>
                           <ProgressBar value={carbs} goal={150} color="bg-yellow-500" />
                           <p>Carbs: {carbs}g</p>
                           <ProgressBar value={fats} goal={50} color="bg-red-500" />
                           <p>Fats: {fats}g</p>
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                   {profile?.conditions.some(c => c.includes('diabetes')) && <Card className={`border-l-4 ${bloodSugarImpact.level === 'low' ? 'border-green-500' : 'border-yellow-500'}`}><h3 className="font-bold">🩸 Blood Sugar Impact: {bloodSugarImpact.level}</h3><p className="text-sm text-text-secondary">{bloodSugarImpact.explanation}</p><p className="text-sm font-semibold mt-1">💡 {bloodSugarImpact.tip}</p></Card>}
                   {profile?.conditions.includes('fatty_liver') && <Card className={`border-l-4 ${liverHealth.score > 6 ? 'border-green-500' : 'border-yellow-500'}`}><h3 className="font-bold">🫀 Liver Health: {liverHealth.score}/10</h3><p className="text-sm text-text-secondary">{liverHealth.explanation}</p><p className="text-sm font-semibold mt-1">💡 {liverHealth.tip}</p></Card>}
                   {profile?.conditions.includes('high_cholesterol') && <Card className={`border-l-4 ${cholesterolImpact.effect === 'positive' ? 'border-green-500' : 'border-yellow-500'}`}><h3 className="font-bold">❤️ Cholesterol: {cholesterolImpact.effect}</h3><p className="text-sm text-text-secondary">{cholesterolImpact.explanation}</p><p className="text-sm font-semibold mt-1">💡 {cholesterolImpact.tip}</p></Card>}
                   {profile?.conditions.includes('weight_loss_goal') && <Card className={`border-l-4 ${weightLossAlignment.percentage > 80 ? 'border-green-500' : 'border-yellow-500'}`}><h3 className="font-bold">⚖️ Weight Loss: {weightLossAlignment.percentage}% aligned</h3><p className="text-sm text-text-secondary">{weightLossAlignment.explanation}</p><p className="text-sm font-semibold mt-1">💡 {weightLossAlignment.tip}</p></Card>}
                </div>

                <Card className="bg-accent-blue">
                     <div className="flex items-center font-bold text-blue-800 mb-1"><Lightbulb size={18} className="mr-2"/> Smart Suggestions</div>
                     <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        {smartSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                     </ul>
                </Card>

                 <div className="text-center">
                    <Button onClick={() => setView('diary')}>View in Diary</Button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-heading font-bold text-center">What did you eat?</h1>
            <Card>
                <textarea 
                    value={foodName} 
                    onChange={e => setFoodName(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-4 text-lg border-gray-200 rounded-lg h-28 resize-none focus:border-primary bg-white text-text-primary"
                />
                <div className="mt-4 text-center">
                    <Button onClick={handleAnalyze} disabled={isLoading || !foodName.trim()}>
                        {isLoading ? 'Analyzing...' : 'Analyze This Meal'}
                    </Button>
                </div>
                {error && <p className="text-danger text-center mt-4">{error}</p>}
            </Card>

            {isLoading && <div className="text-center p-8"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-2">AI is analyzing your meal...</p> </div>}
            
            {renderAnalysis()}
        </div>
    );
};

export default FoodAnalyzer;