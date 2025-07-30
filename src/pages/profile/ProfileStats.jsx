import { Award, CheckCircle, TrendingUp, BarChart } from 'lucide-react';

const ProfileStats = ({ stats }) => {
    const calculatePercentage = (count, total) => {
        if (!total || total === 0) return 0;
        return Math.round((count / total) * 100);
    };

    const easyPercentage = calculatePercentage(stats?.easy, stats?.total);
    const mediumPercentage = calculatePercentage(stats?.medium, stats?.total);
    const hardPercentage = calculatePercentage(stats?.hard, stats?.total);

    return (
        <div className="bg-card rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Solved */}
                <div className="p-6 flex items-center gap-5 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-from/10 flex items-center justify-center">
                        <Award className="w-7 h-7 text-primary-from" />
                    </div>
                    <div className="w-full">
                        <div className="text-sm text-muted-foreground">Total Solved</div>
                        <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
                        <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
                            <div className="bg-gradient-to-r from-primary-from to-primary-to h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
                {/* Easy */}
                <div className="p-6 flex items-center gap-5 border-b md:border-b-0 lg:border-r border-border">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-400" />
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">Easy</span>
                            <span className="text-sm font-semibold text-green-400">{easyPercentage}%</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">{stats?.easy || 0}</div>
                        <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
                            <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${easyPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
                {/* Medium */}
                <div className="p-6 flex items-center gap-5 border-b md:border-b-0 md:border-r border-border">
                     <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-yellow-400" />
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">Medium</span>
                            <span className="text-sm font-semibold text-yellow-400">{mediumPercentage}%</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">{stats?.medium || 0}</div>
                        <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
                            <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${mediumPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
                {/* Hard */}
                <div className="p-6 flex items-center gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <BarChart className="w-7 h-7 text-red-400" />
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">Hard</span>
                            <span className="text-sm font-semibold text-red-400">{hardPercentage}%</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400">{stats?.hard || 0}</div>
                        <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
                            <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${hardPercentage}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileStats;