import { StyledInfoBadge } from './AchievementBadges';

const ACHIEVEMENT_CONFIG = [
    { id: 'first-step', title: 'First Step', description: 'Solve your very first problem.', mainText: '1', subText: 'SOLVED', accentColor: ['#6EE7B7', '#10B981'], isUnlocked: (s) => s.total >= 1 },
    { id: 'problem-solver', title: 'Problem Solver', description: 'Solve 10 problems.', mainText: '10', subText: 'SOLVED', accentColor: ['#93C5FD', '#3B82F6'], isUnlocked: (s) => s.total >= 10 },
    { id: 'dedicated-coder', title: 'Dedicated Coder', description: 'Solve 50 problems.', mainText: '50', subText: 'SOLVED', accentColor: ['#FDBA74', '#F97316'], isUnlocked: (s) => s.total >= 50 },
    { id: 'centurion', title: 'Centurion', description: 'Conquer 100 problems.', mainText: '100', subText: 'MASTER', accentColor: ['#FDE047', '#FBBF24'], isUnlocked: (s) => s.total >= 100 },
    { id: 'easy-ace', title: 'Easy Ace', description: 'Solve 25 Easy problems.', mainText: '25', subText: 'EASY', accentColor: ['#86EFAC', '#16A34A'], isUnlocked: (s) => s.easy >= 25 },
    { id: 'medium-master', title: 'Medium Master', description: 'Solve 25 Medium problems.', mainText: '25', subText: 'MEDIUM', accentColor: ['#FDBA74', '#F97316'], isUnlocked: (s) => s.medium >= 25 },
    { id: 'hard-hitter', title: 'Hard Hitter', description: 'Solve 10 Hard problems.', mainText: '10', subText: 'HARD', accentColor: ['#F87171', '#EF4444'], isUnlocked: (s) => s.hard >= 10 },
    { id: 'trifecta', title: 'Trifecta', description: 'Solve at least one of each difficulty.', mainText: 'E-M-H', subText: 'TRIFECTA', accentColor: ['#C084FC', '#9333EA'], isUnlocked: (s) => s.easy > 0 && s.medium > 0 && s.hard > 0 },
];

export const UnlockedAchievementsSection = ({ stats }) => {
    const safeStats = stats || { total: 0, easy: 0, medium: 0, hard: 0 };
    const unlockedBadges = ACHIEVEMENT_CONFIG.filter(ach => ach.isUnlocked(safeStats));

    if (unlockedBadges.length === 0) return null;

    return (
        // NEW: Premium container styling with gradient border and subtle background
        <div className="bg-card rounded-2xl shadow-lg p-6 [border-image:linear-gradient(to_bottom_right,var(--border),transparent)_1]">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-foreground">Your Achievements</h2>
                {/* NEW: Badge count pill */}
                
                <div className='flex'>
                    <h2 className='text-white/70 mr-2'>Badges</h2>
                    <div className="bg-white/60 text-gray-900 text-md font-semibold px-2 rounded-full">
                        {unlockedBadges.length}
                    </div>
                </div>
                
            </div>
            <div className="flex gap-4">
                {unlockedBadges.map((ach) => (
                    <StyledInfoBadge key={ach.id} {...ach} isUnlocked={true} />
                ))}
            </div>
        </div>
    );
};

export const LockedAchievementsSection = ({ stats }) => {
    const safeStats = stats || { total: 0, easy: 0, medium: 0, hard: 0 };
    const lockedBadges = ACHIEVEMENT_CONFIG.filter(ach => !ach.isUnlocked(safeStats));

    if (lockedBadges.length === 0) return null;

    return (
        // NEW: A cleaner, more focused container style for the side panel
        <div className="bg-card rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Achievements to Unlock</h2>
            <p className="text-sm text-muted-foreground mb-8">Keep solving problems to earn these rewards!</p>
            <div className="grid grid-cols-3 gap-y-10 gap-x-4 items-start">
                {lockedBadges.map((ach) => (
                    <StyledInfoBadge key={ach.id} {...ach} isUnlocked={false} />
                ))}
            </div>
        </div>
    );
};