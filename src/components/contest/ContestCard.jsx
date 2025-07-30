// src/components/contest/ContestCard.jsx
import { Link } from 'react-router';
import CountdownTimer from './CountDownTimer';

export default function ContestCard({ contest }) {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(startTime.getTime() + contest.duration * 60000);
    
    let status = 'Upcoming';
    let statusColor = 'text-blue-400';
    if (startTime <= now && endTime > now) {
        status = 'Live';
        statusColor = 'text-green-400 animate-pulse';
    } else if (endTime <= now) {
        status = 'Ended';
        statusColor = 'text-gray-500';
    }

    return (
        <Link to={`/contests/${contest._id}`} className="block group">
            <div className="bg-card rounded-lg p-6 border border-border/50 shadow-lg hover:border-primary-from/70 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary-from transition-colors">
                            {contest.title}
                        </h3>
                        <span className={`text-sm font-semibold ${statusColor}`}>● {status}</span>
                    </div>
                    <p className="text-sm text-placeholder-text mb-4">
                        Starts on: {startTime.toLocaleString()}
                    </p>
                </div>
                
                <div className="mt-auto">
                    {status === 'Upcoming' && <CountdownTimer targetDate={contest.startTime} />}
                    {status === 'Live' && <div className="text-center text-green-400 font-bold">Ends in: <CountdownTimer targetDate={endTime} /></div>}
                    {status === 'Ended' && <div className="text-center text-gray-500 font-bold">Contest has ended.</div>}
                </div>
            </div>
        </Link>
    );
}