
import React from 'react';
import { Link } from 'react-router-dom';

interface BreakingNewsTickerProps {
    message: string;
    link?: string;
    onClose: () => void;
    bgColor?: string;
    textColor?: string;
    speed?: 'slow' | 'normal' | 'fast';
}

const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({ 
    message, 
    link, 
    onClose,
    bgColor = '#DC2626',
    textColor = '#FFFFFF',
    speed = 'normal'
}) => {
    
    const getDuration = () => {
        switch(speed) {
            case 'slow': return '30s';
            case 'fast': return '10s';
            default: return '20s';
        }
    };

    return (
        <div 
            className="relative overflow-hidden h-10 flex items-center z-50 shadow-sm"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <div 
                className="absolute left-0 px-4 h-full flex items-center z-10 font-black uppercase text-xs tracking-widest shadow-lg"
                style={{ backgroundColor: bgColor, filter: 'brightness(0.9)' }}
            >
                Breaking News
            </div>
            
            <div className="flex-1 overflow-hidden relative h-full flex items-center mask-linear-fade">
                <div 
                    className="whitespace-nowrap pl-[100%] font-bold text-sm"
                    style={{ 
                        animation: `marquee ${getDuration()} linear infinite` 
                    }}
                >
                    {link ? (
                        <Link to={link} className="hover:underline decoration-2 underline-offset-2">{message}</Link>
                    ) : (
                        <span>{message}</span>
                    )}
                </div>
            </div>

            <button 
                onClick={onClose} 
                className="h-full px-3 z-10 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: bgColor, filter: 'brightness(0.9)' }}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                `}
            </style>
        </div>
    );
};

export default BreakingNewsTicker;