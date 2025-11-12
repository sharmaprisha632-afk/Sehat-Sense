import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProfile, LoggedMeal } from '../types';

interface AppContextType {
    profile: UserProfile | null;
    setProfile: (profile: UserProfile | null) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    foodLog: Record<string, LoggedMeal[]>;
    addMealToLog: (meal: LoggedMeal) => void;
    deleteMealFromLog: (mealId: string) => void;
    loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [storedData, setStoredData] = useLocalStorage<{
        profile: UserProfile | null;
        foodLog: Record<string, LoggedMeal[]>;
    }>('sehatSenseData', { profile: null, foodLog: {} });
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate initial loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    const setProfile = (profile: UserProfile | null) => {
        setStoredData(prev => ({ ...prev, foodLog: {}, profile })); // Reset food log when new profile is set
    };

    const updateProfile = (updates: Partial<UserProfile>) => {
        setStoredData(prev => ({ 
            ...prev, 
            profile: prev.profile ? { ...prev.profile, ...updates } : null 
        }));
    };

    const addMealToLog = (meal: LoggedMeal) => {
        const date = new Date(meal.timestamp).toISOString().split('T')[0];
        setStoredData(prev => {
            const newLog = { ...prev.foodLog };
            if (!newLog[date]) {
                newLog[date] = [];
            }
            // Add to the beginning of the list
            newLog[date].unshift(meal);
            return { ...prev, foodLog: newLog };
        });
    };
    
    const deleteMealFromLog = (mealId: string) => {
         setStoredData(prev => {
            const newLog = { ...prev.foodLog };
            for (const date in newLog) {
                newLog[date] = newLog[date].filter(meal => meal.id !== mealId);
                if(newLog[date].length === 0) {
                    delete newLog[date];
                }
            }
            return { ...prev, foodLog: newLog };
        });
    }

    return (
        <AppContext.Provider value={{ 
            profile: storedData.profile, 
            setProfile, 
            updateProfile,
            foodLog: storedData.foodLog, 
            addMealToLog, 
            deleteMealFromLog, 
            loading 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};