
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HealthProfileSetup from './features/Onboarding';
import HealthInsights from './features/Dashboard';
import FoodDiary from './features/FoodDiary';
import MealPlanner from './features/MealSuggester';
import FoodAnalyzer from './features/FoodAnalyzer';
import Chatbot from './features/Chatbot';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeartPulse, MessageSquare, X } from 'lucide-react';

export type View = 'insights' | 'diary' | 'analyzer' | 'planner' | 'drinks' | 'chat';

const App: React.FC = () => {
    return (
        <AppProvider>
            <MainApp />
        </AppProvider>
    );
};

const MainApp: React.FC = () => {
    const { profile, loading } = useApp();
    const [view, setView] = useState<View>('insights');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <HeartPulse className="w-16 h-16 text-primary animate-pulse" />
            </div>
        );
    }
    
    if (!profile) {
        return <HealthProfileSetup />;
    }

    const renderView = () => {
        switch (view) {
            case 'insights':
                return <HealthInsights setView={setView} />;
            case 'diary':
                return <FoodDiary setView={setView} />;
            case 'analyzer':
                 return <FoodAnalyzer setView={setView}/>;
            case 'planner':
            case 'drinks': // MealSuggester now handles both
                return <MealPlanner initialTab={view} />;
            default:
                return <HealthInsights setView={setView} />;
        }
    };

    return (
        <div className="bg-background min-h-screen font-sans text-text-primary">
            <Header currentView={view} setView={setView} />
            <main className="pb-24 pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderView()}
            </main>
            <ChatbotFab />
            <BottomNav currentView={view} setView={setView} />
        </div>
    );
};

const ChatbotFab = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-40 transform hover:scale-110 transition-transform animate-pulse hover:animate-none"
                aria-label="Open AI Health Coach"
            >
                <MessageSquare size={32} />
            </button>
            {isOpen && <ChatbotModal onClose={() => setIsOpen(false)} />}
        </>
    )
}

const ChatbotModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col relative">
                 <div className="p-4 flex justify-between items-center">
                    <h2 className="text-xl font-heading font-bold text-primary">💚 AI Health Coach</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close chat">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <Chatbot isModal={true}/>
                </div>
            </div>
        </div>
    );
};

export default App;