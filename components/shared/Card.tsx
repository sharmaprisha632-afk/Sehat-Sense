
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    const baseClasses = "bg-white rounded-xl shadow-subtle p-6 transition-all duration-300 ease-in-out";
    const hoverClasses = onClick ? "hover:shadow-lifted hover:-translate-y-1 cursor-pointer" : "";

    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
};
