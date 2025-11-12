
import React from 'react';
import { HeartPulse, BarChart3, BookOpen, UtensilsCrossed, Bot } from 'lucide-react';
import { View } from '../../App';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const navItems = [
        { id: 'insights', label: 'Dashboard', icon: BarChart3 },
        { id: 'diary', label: 'Food Diary', icon: BookOpen },
        { id: 'planner', label: 'Meal Ideas', icon: UtensilsCrossed },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-2">
                        <HeartPulse className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-heading font-bold text-primary">SehatSense</span>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as View)}
                                className={`font-semibold text-lg transition-colors relative ${
                                    currentView === item.id
                                        ? 'text-primary'
                                        : 'text-text-secondary hover:text-primary'
                                }`}
                            >
                                {item.label}
                                {currentView === item.id && <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* Future profile icon can go here */}
                    </div>
                </div>
            </div>
        </header>
    );
};
