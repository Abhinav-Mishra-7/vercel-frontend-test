import { StyledInfoBadge } from './AchievementBadges';

const AchievementGroup = ({ title, badges, stats }) => {
    // Sort badges within this group to show unlocked ones first
    const sortedBadges = [...badges].sort((a, b) => {
        const aUnlocked = a.isUnlocked(stats);
        const bUnlocked = b.isUnlocked(stats);
        return bUnlocked - aUnlocked; // Puts true (1) before false (0)
    });

    return (
        <div className="mb-10 last:mb-0">
            <h3 className="text-lg font-semibold text-muted-foreground mb-4 border-b border-border/50 pb-2">
                {title}
            </h3>
            {/* The layout is now strictly 3 columns for clarity */}
            <div className="grid grid-cols-3 gap-y-10 gap-x-6">
                {sortedBadges.map((ach) => (
                    <StyledInfoBadge
                        key={ach.id}
                        title={ach.title}
                        description={ach.description}
                        isUnlocked={ach.isUnlocked(stats)}
                        mainText={ach.mainText}
                        subText={ach.subText}
                        accentColor={ach.accentColor}
                    />
                ))}
            </div>
        </div>
    );
};


const AchievementsCard = ({ stats }) => {
    const safeStats = stats || { total: 0, easy: 0, medium: 0, hard: 0 };

    // --- NEW: Achievements are now defined in logical groups ---
    const achievementGroups = [
        {
            title: "Problems Solved",
            badges: [
                { id: 'first-step', title: 'First Step', description: 'Solve your very first problem.', mainText: '1', subText: 'SOLVED', accentColor: ['#6EE7B7', '#10B981'], isUnlocked: (s) => s.total >= 1 },
                { id: 'problem-solver', title: 'Problem Solver', description: 'Solve 10 problems.', mainText: '10', subText: 'SOLVED', accentColor: ['#93C5FD', '#3B82F6'], isUnlocked: (s) => s.total >= 10 },
                { id: 'dedicated-coder', title: 'Dedicated Coder', description: 'Solve 50 problems.', mainText: '50', subText: 'SOLVED', accentColor: ['#FDBA74', '#F97316'], isUnlocked: (s) => s.total >= 50 },
                { id: 'centurion', title: 'Centurion', description: 'Conquer 100 problems.', mainText: '100', subText: 'MASTER', accentColor: ['#FDE047', '#FBBF24'], isUnlocked: (s) => s.total >= 100 },
            ]
        },
        {
            title: "Difficulty Mastery",
            badges: [
                { id: 'easy-ace', title: 'Easy Ace', description: 'Solve 25 Easy problems.', mainText: '25', subText: 'EASY', accentColor: ['#86EFAC', '#16A34A'], isUnlocked: (s) => s.easy >= 25 },
                { id: 'medium-master', title: 'Medium Master', description: 'Solve 25 Medium problems.', mainText: '25', subText: 'MEDIUM', accentColor: ['#FDBA74', '#F97316'], isUnlocked: (s) => s.medium >= 25 },
                { id: 'hard-hitter', title: 'Hard Hitter', description: 'Solve 10 Hard problems.', mainText: '10', subText: 'HARD', accentColor: ['#F87171', '#EF4444'], isUnlocked: (s) => s.hard >= 10 },
            ]
        },
        {
            title: "Special Achievements",
            badges: [
                { id: 'trifecta', title: 'Trifecta', description: 'Solve at least one of each difficulty.', mainText: 'E-M-H', subText: 'TRIFECTA', accentColor: ['#C084FC', '#9333EA'], isUnlocked: (s) => s.easy > 0 && s.medium > 0 && s.hard > 0 },
            ]
        }
    ];

    return (
        <div className="bg-card rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-8">Achievements</h2>
            <div className="flex flex-col">
                {achievementGroups.map(group => (
                    <AchievementGroup
                        key={group.title}
                        title={group.title}
                        badges={group.badges}
                        stats={safeStats}
                    />
                ))}
            </div>
        </div>
    );
};

export default AchievementsCard;