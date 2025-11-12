import { LucideIcon } from "lucide-react";

export type Condition = 
    | 'prediabetes' 
    | 'diabetes'
    | 'fatty_liver' 
    | 'high_cholesterol' 
    | 'high_blood_pressure'
    | 'vitamin_d_deficiency'
    | 'vitamin_b12_deficiency'
    | 'pcos_hormonal_imbalance'
    | 'weight_loss_goal';

export interface UserProfile {
    name: string;
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;
    conditions: Condition[];
    metrics: { [key: string]: string | number };
    dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'eggetarian';
    allergies: string[];
    weightLossGoal: boolean;
    currentWeight: number | null;
    targetWeight: number | null;
    height: number | null;
    bmi: number | null;
    waterIntake: number | null; // in liters
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | null;
    sleepHours: number | null;
}

export interface ReportData {
    [key: string]: number | undefined;
    hba1c?: number;
    glucose?: number;
    ldl?: number;
    hdl?: number;
    totalCholesterol?: number;
    triglycerides?: number;
    vitaminD?: number;
    vitaminB12?: number;
    sgpt?: number;
    sgot?: number;
}

export interface FoodAnalysis {
    overallScore: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    bloodSugarImpact: {
        level: 'low' | 'moderate' | 'high';
        explanation: string;
        tip: string;
    };
    liverHealth: {
        score: number;
        explanation: string;
        tip: string;
    };
    cholesterolImpact: {
        effect: 'positive' | 'neutral' | 'negative';
        explanation: string;
        tip: string;
    };
    weightLossAlignment: {
        percentage: number;
        explanation: string;
        tip: string;
    };
    smartSuggestions: string[];
}


export interface LoggedMeal {
    id: string;
    name: string;
    timestamp: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    analysis: FoodAnalysis;
}

export interface MealSuggestion {
    name: string;
    image: string;
    description: string;
    healthScores: { condition: string; score: number }[];
    nutrition: { calories: number; protein: number; carbs: number; fats: number };
    prepTime: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    ingredients: string[];
    recipe: string[];
    whyItsGood: string;
}

export interface DrinkSuggestion {
    name: string;
    perfectFor: string[];
    calories: number;
    sugar: string;
    keyNutrients: string;
    whyItWorks: string;
    ingredients: string[];
    prepTime: string;
    bestTime: string;
    recipe: string;
    warnings: string;
}


export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

export type ConditionDetail = {
    label: string;
    description: string;
    icon: LucideIcon;
};

export type ConditionDetails = {
    [key in Condition]: ConditionDetail;
};