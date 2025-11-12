import { GoogleGenAI } from "@google/genai";
import { UserProfile, FoodAnalysis, MealSuggestion, ChatMessage, Condition, ReportData, DrinkSuggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const parseReportData = (text: string): ReportData => {
    const data: ReportData = {};
    const lines = text.split('\n');
    const mappings: { [key: string]: keyof ReportData } = {
        'HbA1c': 'hba1c',
        'Fasting Glucose': 'glucose',
        'LDL': 'ldl',
        'HDL': 'hdl',
        'Total Cholesterol': 'totalCholesterol',
        'Triglycerides': 'triglycerides',
        'Vitamin D': 'vitaminD',
        'Vitamin B12': 'vitaminB12',
        'SGPT': 'sgpt',
        'SGOT': 'sgot',
    };

    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
            const key = parts[0].trim();
            const value = parseFloat(parts[1].trim());
            if (mappings[key] && !isNaN(value)) {
                data[mappings[key]] = value;
            }
        }
    });
    return data;
};

const determineConditions = (data: ReportData): Condition[] => {
    const conditions: Condition[] = [];
    if (data.hba1c) {
        if (data.hba1c >= 6.5) conditions.push('diabetes');
        else if (data.hba1c >= 5.7) conditions.push('prediabetes');
    }
    if ((data.ldl && data.ldl >= 130) || (data.triglycerides && data.triglycerides >= 150)) {
        conditions.push('high_cholesterol');
    }
    if (data.sgpt && data.sgpt > 40) conditions.push('fatty_liver');
    if (data.vitaminD && data.vitaminD < 20) conditions.push('vitamin_d_deficiency');
    if (data.vitaminB12 && data.vitaminB12 < 200) conditions.push('vitamin_b12_deficiency');
    return conditions;
};


const analyzeReport = async (file: File): Promise<{ reportData: ReportData; conditions: Condition[] }> => {
    const model = 'gemini-2.5-pro'; // Use a powerful multimodal model
    const base64Data = await fileToBase64(file);
    const filePart = { inlineData: { mimeType: file.type, data: base64Data } };
    const prompt = `Extract ALL medical test values from this blood report image. Find and return ONLY the numerical values for: HbA1c (%), Fasting Glucose (mg/dL), LDL Cholesterol (mg/dL), HDL Cholesterol (mg/dL), Triglycerides (mg/dL), Total Cholesterol (mg/dL), Vitamin D (ng/mL), Vitamin B12 (pg/mL), SGPT/ALT (U/L), SGOT/AST (U/L). If any value is not found in the image, write 'Not found'. Return as simple key-value pairs. Example: HbA1c: 6.2`;

    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [ { text: prompt }, filePart ] }],
    });
    
    const textResponse = response.text;
    const reportData = parseReportData(textResponse);
    const conditions = determineConditions(reportData);
    
    if (Object.keys(reportData).length === 0) {
        throw new Error("Could not read report. Please upload a clearer image or enter manually.");
    }
    
    return { reportData, conditions };
};


const buildUserContext = (profile: UserProfile): string => {
    let context = `Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}\n`;
    context += `Height: ${profile.height} cm, Weight: ${profile.currentWeight} kg\n`;
    context += `Conditions: ${profile.conditions.map(c => c.replace(/_/g, ' ')).join(', ') || 'None specified'}\n`;
    context += `Allergies: ${profile.allergies.join(', ') || 'None'}\n`;
    context += `Dietary Preference: ${profile.dietaryPreference}\n`;
    context += `Activity Level: ${profile.activityLevel}\n`;
    context += `Average Sleep: ${profile.sleepHours} hours/night\n`;
    context += `Daily Water Intake: ${profile.waterIntake} liters\n`;

    if (profile.weightLossGoal) {
        context += `Primary Goal: Weight Loss (Target: ${profile.targetWeight}kg)\n`;
    }
    return context;
};

const analyzeFood = async (foodName: string, profile: UserProfile): Promise<FoodAnalysis> => {
    const model = 'gemini-2.5-flash';
    const userContext = buildUserContext(profile);

    const prompt = `You are a nutrition expert analyzing food for someone with specific health conditions.
    USER PROFILE:
    ${userContext}

    FOOD EATEN: "${foodName}"

    Provide a comprehensive analysis in this EXACT JSON format, with no other text or markdown:
    {
      "overallScore": 85,
      "calories": 420,
      "protein": 18,
      "carbs": 52,
      "fats": 12,
      "fiber": 8,
      "bloodSugarImpact": { "level": "moderate", "explanation": "The rice and roti will raise blood sugar moderately.", "tip": "Replace half the rice with extra dal for slower sugar release." },
      "liverHealth": { "score": 7, "explanation": "Low fat cooking method is good. Paneer adds protein which supports liver repair.", "tip": "Use hung curd instead of paneer to reduce saturated fat." },
      "cholesterolImpact": { "effect": "neutral", "explanation": "No high saturated fat detected. This meal won't negatively impact cholesterol.", "tip": "Add a teaspoon of flax seeds for omega-3." },
      "weightLossAlignment": { "percentage": 85, "explanation": "This meal fits a 1500 calorie goal well. Good protein-to-carb ratio.", "tip": "Remove 1 roti to save 70 calories while staying satisfied." },
      "smartSuggestions": [ "Add a side of cucumber salad for volume and hydration.", "Swap refined oil for ghee (1 tsp) for better fat quality.", "Drink a glass of water 20 mins before this meal." ]
    }`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    let textResponse = response.text.trim();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to get valid JSON from food analysis.");
    return JSON.parse(jsonMatch[0]);
};


const generateMealIdeas = async (profile: UserProfile, filters: any): Promise<MealSuggestion[]> => {
    const model = 'gemini-2.5-flash';
    const userContext = buildUserContext(profile);
    const prompt = `Generate 3 personalized meal ideas for the user below.
    USER PROFILE: ${userContext}
    PREFERENCES: ${JSON.stringify(filters)}

    Return a valid JSON array of 3 objects. Each object must have this structure:
    {
      "name": "Protein-Packed Moong Dal Cheela",
      "imageSearchTerm": "moong dal chilla",
      "description": "A savory pancake perfect for a filling, low-glycemic breakfast.",
      "healthScores": [
        {"condition": "bloodSugar", "score": 9},
        {"condition": "weightLoss", "score": 9},
        {"condition": "liver", "score": 8}
      ],
      "nutrition": {"calories": 180, "protein": 12, "carbs": 22, "fats": 5},
      "prepTime": "15 minutes",
      "difficulty": "Easy",
      "ingredients": ["1 cup moong dal (soaked)", "1 small onion, chopped", "Green chili, coriander", "Spices"],
      "recipe": ["Grind soaked dal to a paste.", "Mix in veggies and spices.", "Cook on a pan like a pancake."],
      "whyItsGood": "Moong dal has a low glycemic index, preventing blood sugar spikes. It's high in protein and fiber, keeping you full and supporting weight loss."
    }`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    const textResponse = response.text.trim();
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to get valid JSON from meal ideas.");
    
    type TempMeal = Omit<MealSuggestion, 'image'> & { imageSearchTerm: string };
    const parsed: TempMeal[] = JSON.parse(jsonMatch[0]);

    return parsed.map(p => ({
        ...p,
        image: `https://source.unsplash.com/500x300/?${encodeURIComponent(p.imageSearchTerm)}`
    }));
};

const generateDrinkSuggestions = async (profile: UserProfile, filters: any): Promise<DrinkSuggestion[]> => {
    const model = 'gemini-2.5-flash';
    const userContext = buildUserContext(profile);
    const prompt = `You are a nutrition expert. Generate 6 personalized healthy drink recommendations for this user:
    USER PROFILE:
    ${userContext}
    PREFERENCES:
    Drink type: ${filters.drinkType}, Time of day: ${filters.timeOfDay}

    Return response as a valid JSON array of 6 objects, with this exact structure:
    [{
        "name": "Amla-Ginger Immunity Shot",
        "perfectFor": ["Fatty Liver (Detoxifying)", "Immunity boost"],
        "calories": 25,
        "sugar": "4g",
        "keyNutrients": "Vitamin C: 300% DV",
        "whyItWorks": "Amla supports liver detox and reduces inflammation. Ginger improves insulin sensitivity.",
        "ingredients": ["2 fresh amla", "1 inch ginger", "1 tsp honey (optional)"],
        "prepTime": "5 mins",
        "bestTime": "Morning on empty stomach",
        "recipe": "Blend amla and ginger with a little water, strain, and drink.",
        "warnings": ""
    }]`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    const textResponse = response.text.trim();
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to get valid JSON from drink suggestions.");
    return JSON.parse(jsonMatch[0]);
};

const chatResponse = async (input: string, context: { profile: UserProfile, history: ChatMessage[] }): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const userContext = buildUserContext(context.profile);
    
    const systemInstruction = `You are SehatSense, a warm, supportive AI Health Coach for Indians. Your user's profile is:\n${userContext}\nUse a friendly, conversational tone, mixing in simple Hindi-English naturally (e.g., "Try adding jeera to your dal"). Give practical, India-specific advice. Be encouraging, never judgmental. Keep responses concise.`;
    
    const history = context.history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    const chat = ai.chats.create({ model, config: { systemInstruction }, history });
    const response = await chat.sendMessage({ message: input });
    return response.text;
};

export const geminiService = {
    analyzeReport,
    determineConditions,
    analyzeFood,
    generateMealIdeas,
    generateDrinkSuggestions,
    chatResponse,
};