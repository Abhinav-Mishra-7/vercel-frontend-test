// src/pages/Profile/MonthlyBadgesSection.jsx

import React from 'react';
import MonthlyBadge from './MonthlyBadge';

// Static configuration for all 12 months. This keeps our component clean.
const MONTH_CONFIG = [
    { monthNumber: 1,  abbr: 'JAN', name: 'Jan', color: ['#6EE7B7', '#10B981'] },
    { monthNumber: 2,  abbr: 'FEB', name: 'Feb', color: ['#A7F3D0', '#34D399'] },
    { monthNumber: 3,  abbr: 'MAR', name: 'Mar', color: ['#FDE047', '#FBBF24'] },
    { monthNumber: 4,  abbr: 'APR', name: 'Apr', color: ['#F87171', '#EF4444'] },
    { monthNumber: 5,  abbr: 'MAY', name: 'May', color: ['#FDBA74', '#F97316'] },
    { monthNumber: 6,  abbr: 'JUN', name: 'Jun', color: ['#FDA4AF', '#F43F5E'] },
    { monthNumber: 7,  abbr: 'JUL', name: 'Jul', color: ['#5EEAD4', '#14B8A6'] },
    { monthNumber: 8,  abbr: 'AUG', name: 'Aug', color: ['#60A5FA', '#3B82F6'] },
    { monthNumber: 9,  abbr: 'SEP', name: 'Sep', color: ['#818CF8', '#6366F1'] },
    { monthNumber: 10, abbr: 'OCT', name: 'Oct', color: ['#F0ABFC', '#D946EF'] },
    { monthNumber: 11, abbr: 'NOV', name: 'Nov', color: ['#F9A8D4', '#EC4899'] },
    { monthNumber: 12, abbr: 'DEC', name: 'Dec', color: ['#A5B4FC', '#818CF8'] },
];

const MonthlyBadgesSection = ({ earnedBadges = [] }) => {
    // Merge the static config with the dynamic earned data
    const allBadges = MONTH_CONFIG.map(config => {
        const earnedInfo = earnedBadges.find(b => b.month === config.monthNumber);
        return {
            ...config,
            isUnlocked: !!earnedInfo,
            earnedDate: earnedInfo ? earnedInfo.date : null,
        };
    });

    const unlockedList = allBadges.filter(b => b.isUnlocked);
    const lockedList = allBadges.filter(b => !b.isUnlocked);

    return (
        <div className="bg-card rounded-xl shadow-lg p-6 lg:p-8">
            {/* Unlocked Badges Section */}
            {unlockedList.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-foreground mb-6">Unlocked Badges</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                        {unlockedList.map(badge => (
                            <MonthlyBadge key={badge.monthNumber} {...badge} />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges Section */}
            {lockedList.length > 0 && (
                 <div>
                    <h3 className="text-2xl font-bold text-foreground mb-6">Not Yet Earned</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                        {lockedList.map(badge => (
                            <MonthlyBadge key={badge.monthNumber} {...badge} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyBadgesSection;