import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send } from 'lucide-react';

const Chatbot: React.FC<{ isModal?: boolean }> = ({ isModal = false }) => {
    const { profile } = useApp();
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const conditions = profile?.conditions.map(c => c.replace(/_/g, ' ')).join(', ');
        return [{ 
            id: '1', 
            sender: 'ai', 
            text: `Hi! I'm here to help with your ${conditions}. Ask me anything about food, nutrition, or healthy habits 😊`, 
            timestamp: new Date().toISOString() 
        }];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isTyping]);
    
    const handleSend = async (messageText: string) => {
        if (!messageText.trim() || !profile) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: messageText,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const aiResponseText = await geminiService.chatResponse(messageText, { profile, history: messages });
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiResponseText,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Sorry, I am having trouble connecting. Please try again.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };
    
    const suggestedQuestions = [
        "Can I eat rice at night?",
        "Healthy breakfast ideas",
        "Is ghee good for me?",
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-accent-blue text-text-primary rounded-br-none' : 'bg-accent-green text-text-primary rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-end gap-2 justify-start">
                         <div className="bg-accent-green p-3 rounded-2xl rounded-bl-none">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
             <div className="p-4 bg-white">
                 {messages.length < 3 && (
                     <div className="flex flex-wrap gap-2 mb-2">
                        {suggestedQuestions.map(q => <button key={q} onClick={() => handleSend(q)} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200">{q}</button>)}
                    </div>
                 )}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend(input)}
                        placeholder="Ask me anything..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-gray-50 text-text-primary"
                    />
                    <button id="chat-send-button" onClick={() => handleSend(input)} className="bg-primary text-white p-3 rounded-lg disabled:bg-gray-400" disabled={!input.trim()}>
                        <Send />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;