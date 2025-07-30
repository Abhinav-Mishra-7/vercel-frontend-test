import { useState, useEffect , useCallback} from 'react';
import { Timer } from 'lucide-react';

export default function CountdownTimer({ targetDate , onEnd , from}) {
  
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date();
    
    // NEW: We now return an object that includes the total milliseconds.
    // This makes it easy to check if the time is up.
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference // NEW: The raw millisecond difference
    };
  }, [targetDate]); 

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // NEW: Check if the time is already up when the component first loads.
    // If so, call onEnd immediately and don't start the timer.
    if (timeLeft.total <= 0) {
      if (onEnd) onEnd();
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // NEW: When the timer hits zero, call the onEnd function and clear the interval.
      if (newTimeLeft.total <= 0) {
        if (onEnd) onEnd();
        clearInterval(timer);
      }
    }, 1000);
    
    // This cleanup function is essential to prevent memory leaks.
    return () => clearInterval(timer);
  }, [targetDate, onEnd, calculateTimeLeft, timeLeft.total]);

  const formatTime = (value) => value.toString().padStart(2, '0');

  if(from === 'problemPage')
  {
    return (
      <div className="flex justify-center items-center gap-2">
        <div className="h-5 w-px bg-white/20 transition-opacity duration-200"></div>
        <Timer size={16} className='text-muted-foreground' ></Timer>
        <h1 className='text-muted-foreground text-sm font-medium' >Timer :</h1>
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-lg px-2 py-1 text-sm font-bold text-white">
              {formatTime(timeLeft.days)}
            </div>
            <span className="text-xs text-gray-400 mt-1">DAYS</span>
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <div className="rounded-lg px-2 py-1 text-sm font-bold text-white bg-white/15">
            {formatTime(timeLeft.hours)}
          </div>
          {/* <span className="text-xs text-gray-300 mt-1 font-semibold">HRS</span> */}
        </div>
        
        <div className="flex flex-col items-center">
          <div className="rounded-lg px-2 py-1 text-sm font-bold text-white bg-white/15">
            {formatTime(timeLeft.minutes)}
          </div>
          {/* <span className="text-xs text-gray-300 mt-1 font-semibold">MIN</span> */}
        </div>
        
        <div className="flex flex-col items-center">
          <div className="rounded-lg px-2 py-1 text-sm font-bold text-white bg-white/15">
            {formatTime(timeLeft.seconds)}
          </div>
          {/* <span className="text-xs text-gray-300 mt-1 font-semibold">SEC</span> */}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center gap-2">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 rounded-lg px-2 py-1 text-lg font-bold">
            {formatTime(timeLeft.days)}
          </div>
          <span className="text-xs text-gray-400 mt-1">DAYS</span>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="rounded-lg px-1 py-0.15 text-lg font-bold text-white bg-gradient-to-r from-primary-from to-primary-to">
          {formatTime(timeLeft.hours)}
        </div>
        <span className="text-xs text-gray-300 mt-1 font-semibold">HRS</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="rounded-lg px-1 py-0.15 text-lg font-bold text-white bg-gradient-to-r from-primary-from to-primary-to">
          {formatTime(timeLeft.minutes)}
        </div>
        <span className="text-xs text-gray-300 mt-1 font-semibold">MIN</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="rounded-lg px-1 py-0.15 text-lg font-bold text-white bg-gradient-to-r from-primary-from to-primary-to">
          {formatTime(timeLeft.seconds)}
        </div>
        <span className="text-xs text-gray-300 mt-1 font-semibold">SEC</span>
      </div>
    </div>
  );
}