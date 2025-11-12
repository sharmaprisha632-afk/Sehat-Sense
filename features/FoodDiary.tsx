
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/shared/Card';
import { Trash2, Calendar, Download, PlusCircle } from 'lucide-react';
import { LoggedMeal } from '../types';
import { View } from '../../App';
import { Button } from '../components/shared/Button';

const FoodDiary: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { foodLog, deleteMealFromLog } = useApp();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const dates = Object.keys(foodLog).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const mealsForDate = foodLog[selectedDate] || [];
    
    const dailySummary = mealsForDate.reduce((acc, meal) => {
        acc.calories += meal.analysis.calories;
        acc.avgScore += meal.analysis.overallScore;
        return acc;
    }, { calories: 0, avgScore: 0 });
    
    if (mealsForDate.length > 0) {
        dailySummary.avgScore = Math.round(dailySummary.avgScore / mealsForDate.length);
    }

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Meal,Calories,Protein(g),Carbs(g),Fats(g),Score\n";
        // FIX: Explicitly type the forEach parameters to ensure `meals` is recognized as an array.
        Object.entries(foodLog).forEach(([date, meals]: [string, LoggedMeal[]]) => {
            meals.forEach(meal => {
                const row = [date, meal.name.replace(/,/g, ''), meal.analysis.calories, meal.analysis.protein, meal.analysis.carbs, meal.analysis.fats, meal.analysis.overallScore].join(",");
                csvContent += row + "\r\n";
            });
        });
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "sehatsense_food_diary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold">My Food Diary</h1>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setView('analyzer')} className="flex items-center space-x-2 text-sm bg-primary text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        <PlusCircle size={16}/>
                        <span>Log Meal</span>
                    </button>
                    <button onClick={exportToCSV} className="flex items-center space-x-2 text-sm bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        <Download size={16}/>
                        <span>Export</span>
                    </button>
                 </div>
            </div>

            <div className="flex items-center space-x-2">
                <Calendar className="text-text-secondary" />
                <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg bg-white text-text-primary">
                    {dates.map(date => <option key={date} value={date}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</option>)}
                    {dates.length === 0 && <option>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</option>}
                </select>
            </div>

            {mealsForDate.length > 0 ? (
                <>
                    <Card>
                         <h2 className="text-xl font-heading font-semibold mb-4">Daily Summary</h2>
                         <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                                <p className="text-lg text-text-secondary">Overall Health Score</p>
                                <p className="text-5xl font-bold text-primary">{dailySummary.avgScore}/100</p>
                            </div>
                            <div>
                                <p className="text-lg text-text-secondary">Total Calories</p>
                                <p className="text-5xl font-bold text-primary">{dailySummary.calories}</p>
                                <p className="text-text-secondary">/ 1500 kcal 🎯</p>
                            </div>
                            <div>
                                <p className="text-lg text-text-secondary">Meals Logged</p>
                                <p className="text-5xl font-bold text-primary">{mealsForDate.length}</p>
                                <p className="text-text-secondary">🔥 5 day streak!</p>
                            </div>
                         </div>
                    </Card>

                    <div className="space-y-4">
                        {mealsForDate.map(meal => (
                            <Card key={meal.id} className="relative group">
                                <button onClick={() => deleteMealFromLog(meal.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18} />
                                </button>
                                <div className="flex items-start gap-4">
                                    <div className="text-center">
                                        <p className="font-semibold text-text-secondary">{new Date(meal.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit'})}</p>
                                        <p className={`text-2xl font-bold ${meal.analysis.overallScore > 80 ? 'text-green-500' : 'text-yellow-500'}`}>{meal.analysis.overallScore}</p>
                                        <p className="text-xs">Score</p>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-bold">{meal.name}</h3>
                                        <div className="text-sm text-text-secondary mt-1">
                                            <span>{meal.analysis.calories} cal</span> | 
                                            <span> P: {meal.analysis.protein}g</span> | 
                                            <span> C: {meal.analysis.carbs}g</span> | 
                                            <span> F: {meal.analysis.fats}g</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <Card className="text-center py-12">
                    <p className="text-text-secondary text-lg mb-4">No meals logged for this day.</p>
                    <Button onClick={() => setView('analyzer')}>
                        <PlusCircle size={18} className="inline mr-2"/>
                        Log Your First Meal
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default FoodDiary;