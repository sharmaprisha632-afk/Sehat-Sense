import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { BookOpen, UtensilsCrossed, PlusCircle, Award, TrendingUp, Lightbulb, UploadCloud, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { View } from '../../App';
import { LoggedMeal, ReportData, Condition } from '../types';
import { geminiService } from '../services/geminiService';

interface HealthInsightsProps {
    setView: (view: View) => void;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ setView }) => {
    const { profile, foodLog } = useApp();
    const [showUploadModal, setShowUploadModal] = useState(false);

    const hasReportData = profile && Object.keys(profile.metrics).length > 0;
    
    const allMeals: LoggedMeal[] = (Object.values(foodLog) as LoggedMeal[][]).flat();
    const macroData = allMeals.reduce((acc, meal) => {
        acc[0].value += meal.analysis.protein;
        acc[1].value += meal.analysis.carbs;
        acc[2].value += meal.analysis.fats;
        return acc;
    }, [
        { name: 'Protein', value: 0, fill: '#3b82f6' },
        { name: 'Carbs', value: 0, fill: '#f59e0b' },
        { name: 'Fats', value: 0, fill: '#ef4444' },
    ]);

    const weeklyScores = Object.entries(foodLog).slice(0, 7).map(([date, meals]: [string, LoggedMeal[]]) => {
        const avgScore = meals.length > 0 ? meals.reduce((sum, meal) => sum + meal.analysis.overallScore, 0) / meals.length : 0;
        return {
            date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short'}),
            score: Math.round(avgScore) || 0,
        };
    }).reverse();

    const achievementBadges = [
        { icon: '🔥', title: '5-Day Streak' },
        { icon: '🥗', title: 'Veggie Champion' },
        { icon: '💧', title: 'Hydration Hero' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-heading font-bold">Hello, {profile?.name}!</h1>
                <p className="text-text-secondary">Here are your health insights.</p>
            </div>
            
            {!hasReportData && (
                <Card className="bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-heading font-semibold text-blue-800">Get Deeper Insights</h2>
                            <p className="text-blue-700">Upload your medical report for even more personalized advice.</p>
                        </div>
                        <Button onClick={() => setShowUploadModal(true)}>Upload Report</Button>
                    </div>
                </Card>
            )}

            <Card>
                <h2 className="text-xl font-heading font-semibold mb-4 flex items-center"><TrendingUp className="mr-2"/> Condition Management</h2>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                    {profile?.conditions.map(c => (
                        <div key={c} className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-bold capitalize">{c.replace(/_/g, ' ')}</p>
                            <p className="text-green-600 font-semibold text-lg">Improving ↗️</p>
                            <p className="text-xs text-text-secondary">Based on food choices</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <h2 className="text-xl font-heading font-semibold mb-4">Weekly Health Score</h2>
                     <div className="w-full h-64">
                        <ResponsiveContainer>
                            <BarChart data={weeklyScores}>
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="score" fill="#4CAF50" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-heading font-semibold mb-4">Macronutrient Balance</h2>
                    <div className="w-full h-64">
                       <ResponsiveContainer>
                            <PieChart>
                                <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <h2 className="text-xl font-heading font-semibold mb-4 flex items-center"><Award className="mr-2"/> Your Achievements</h2>
                    <div className="flex justify-around items-center text-center">
                        {achievementBadges.map(badge => (
                            <div key={badge.title}>
                                <p className="text-4xl">{badge.icon}</p>
                                <p className="font-semibold text-sm mt-1">{badge.title}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                 <Card className="flex flex-col justify-center items-center text-center bg-primary text-white">
                    <Lightbulb size={32} />
                    <h2 className="text-xl font-heading font-semibold mt-2">This Week's Health Tip</h2>
                    <p className="opacity-80 mt-1">Eating protein before carbs can reduce blood sugar spikes by up to 35%!</p>
                </Card>
            </div>
             {showUploadModal && <UploadReportModal onClose={() => setShowUploadModal(false)} />}
        </div>
    );
};


const UploadReportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { profile, updateProfile } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0 && files[0].size < 5 * 1024 * 1024) {
            setFile(files[0]);
            setError(null);
        } else {
            setError("Please select a file smaller than 5MB.");
        }
    };
    
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
        handleFileChange(event.dataTransfer.files);
    }, []);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };

    const handleAnalyze = async () => {
        if (!file || !profile) return;
        setIsLoading(true);
        setError(null);
        try {
            const { reportData, conditions } = await geminiService.analyzeReport(file);
            // Merge new conditions with existing, avoiding duplicates
            const newConditions = [...new Set([...profile.conditions, ...conditions])];
            updateProfile({
                metrics: reportData,
                conditions: newConditions,
            });
            onClose();
        } catch (e: any) {
            setError(e.message || "Failed to analyze report.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={24}/></button>
                 <h2 className="text-2xl font-heading font-bold text-primary mb-4">Upload Medical Report</h2>
                 <div 
                    onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                    className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-green-50' : 'border-gray-300'}`}
                >
                    <input type="file" id="modal-file-upload" className="hidden" accept="application/pdf,image/jpeg,image/png" onChange={(e) => handleFileChange(e.target.files)} />
                    <label htmlFor="modal-file-upload" className="cursor-pointer">
                        <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-text-secondary"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-sm text-gray-500">PDF, JPG, or PNG (Max 5MB)</p>
                    </label>
                </div>
                 {file && <p className="mt-4 text-center font-medium text-text-secondary">Selected: {file.name}</p>}
                 {error && <p className="text-danger text-center mt-2">{error}</p>}
                <div className="mt-6 text-center">
                    <Button onClick={handleAnalyze} disabled={!file || isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze & Update Profile'}
                    </Button>
                </div>
            </Card>
        </div>
    )
};

export default HealthInsights;