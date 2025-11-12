
import React from 'react';
import { BarChart3, BookOpen, Plus, GlassWater, UtensilsCrossed } from 'lucide-react';
import { View } from '../../App';

interface BottomNavProps {
    currentView: View;
    setView: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const navItems = [
        { id: 'insights', label: 'Home', icon: BarChart3 },
        { id: 'diary', label: 'Diary', icon: BookOpen },
        { id: 'analyzer', label: 'Add Meal', icon: Plus, isCentral: true },
        { id: 'drinks', label: 'Drinks', icon: GlassWater },
        { id: 'planner', label: 'Ideas', icon: UtensilsCrossed },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-30">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = currentView === item.id || (currentView === 'planner' && item.id === 'ideas');
                    if (item.isCentral) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as View)}
                                className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center -mt-8 shadow-lg transform hover:scale-110 transition-transform"
                                aria-label="Add and Analyze Meal"
                            >
                                <item.icon size={32} />
                            </button>
                        );
                    }
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as View)}
                            className={`flex flex-col items-center justify-center space-y-1 w-full transition-colors ${
                                isActive ? 'text-primary' : 'text-text-secondary'
                            }`}
                            aria-label={item.label}
                        >
                            <item.icon size={24} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
