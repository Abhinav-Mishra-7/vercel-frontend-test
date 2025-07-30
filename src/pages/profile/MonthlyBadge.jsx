// src/pages/Profile/MonthlyBadge.jsx

import React from 'react';

const MonthlyBadge = ({ monthNumber, monthAbbr, color, isUnlocked, earnedDate }) => {
    // Each badge has two colors for its gradient
    const [colorFrom, colorTo] = color;

    return (
        <div className={`relative flex flex-col items-center text-center transition-opacity duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-60'}`}>
            <svg width="100" height="115" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform hover:scale-110 transition-transform duration-200">
                <defs>
                    {/* Gradient for the metallic silver border */}
                    <linearGradient id="silver-sheen" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#E5E7EB" />
                        <stop offset="100%" stopColor="#9CA3AF" />
                    </linearGradient>
                    
                    {/* Gradient for the inner colored section */}
                    <linearGradient id={`month-grad-${monthNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colorFrom} />
                        <stop offset="100%" stopColor={colorTo} />
                    </linearGradient>
                </defs>
                
                {/* Outermost Hexagon (The Metallic Border) */}
                <g filter={isUnlocked ? 'url(#badge-shadow)' : 'none'}>
                    <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" fill="url(#silver-sheen)" />
                    <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" stroke="#4B5563" strokeWidth="1" />
                </g>
                
                {/* Inner Hexagon (The Colored Part with Gradient) */}
                <path d="M50 5L89.32 27.5V72.5L50 95L10.68 72.5V27.5L50 5Z" fill={`url(#month-grad-${monthNumber})`} />
                
                {/* The diagonal colored stripes */}
                <g opacity="0.4">
                    <path d="M10.68 27.5L50 5L55.5 8L15.18 30.5L10.68 27.5Z" fill={colorTo} />
                    <path d="M19.68 33L59.00 10.5L64.5 13.5L24.18 36L19.68 33Z" fill={colorTo} />
                    <path d="M28.68 38.5L68.00 16L73.5 19L33.18 41.5L28.68 38.5Z" fill={colorTo} />
                </g>
                
                {/* Top Silver Plate for the Number */}
                <g>
                    <path d="M10.68 27.5L50 5L89.32 27.5L85.32 32.5L50 12.5L14.68 32.5L10.68 27.5Z" fill="#B0B8C3" fillOpacity="0.8" />
                    <path d="M14.68 32.5L50 12.5L85.32 32.5" stroke="#FFF" strokeOpacity="0.5" strokeWidth="0.5" />
                </g>

                {/* Text for Month Number and Abbreviation */}
                <text x="50" y="27" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    {monthNumber}
                </text>
                <text x="50" y="38" textAnchor="middle" dominantBaseline="middle" className="text-xs font-semibold fill-white" opacity="0.8">
                    {monthAbbr}
                </text>
            </svg>

            {/* Title and Date below the badge */}
            <h4 className="font-semibold text-foreground mt-2">{monthAbbr} Badge</h4>
            <p className="text-sm text-muted-foreground">
                {isUnlocked ? earnedDate : 'Not Yet Earned'}
            </p>
        </div>
    );
};

export default MonthlyBadge;