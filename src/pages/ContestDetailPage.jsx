import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link , useLocation} from 'react-router';
import axiosClient from '../utils/axiosClient';
import CountdownTimer from '../components/contest/CountDownTimer';
import Loader from '../components/loader/Loader';
import ProblemListItem from '../components/contest/ProblemListItems';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import MissedOpportunityCard from '../components/contest/MissedOpportunityCard';

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const location = useLocation();

    useEffect(() => {
        // Check if we were redirected because the contest ended
        if (location.state?.contestEnded) {
            toast.success('The contest has ended!', { duration: 4000 });
            // Clear the state to prevent the toast from showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

  const fetchContest = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/contest/${id}`);
      setContest(data.contest);
      setIsRegistered(data.isRegistered);
      setStatus(data.status);
      setError(null);
    } catch (err) {
      if (err.missed) {
        setError(err) ;
      } else {
        setError(err.message || 'Contest not found or could not be loaded.');
      }
      
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContest();
  }, [fetchContest]);

  useEffect(() => {
    if (!contest) return;
    const interval = setInterval(() => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(startTime.getTime() + contest.duration * 60000);
      if (now < startTime) setStatus('Upcoming');
      else if (now >= startTime && now < endTime) setStatus('Live');
      else setStatus('Ended');
    }, 1000);
    return () => clearInterval(interval);
  }, [contest]);
  
  const handleRegister = async () => {
    if (!user) {
      toast.info('Please log in to register for contests');
      navigate('/login');
      return;
    }
    setIsRegistering(true);
    try {
      const { message } = await axiosClient.post(`/contest/${id}/register`);
      toast.success(message || "You're registered! Good luck!");
      await fetchContest(); // Re-fetch to get the most up-to-date data
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return <Loader></Loader>;
  if (error?.missed) return <MissedOpportunityCard/>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!contest) return null;

  const startTime = new Date(contest.startTime);
  const endTime = new Date(startTime.getTime() + contest.duration * 60000);

  // *** THE DEFINITIVE FIX ***
  // This logic correctly uses `contest.problems` as the source of truth
  // and marks them as solved based on `problemStats`.

  // 1. Create a fast lookup map of solved statuses from the user's stats.
  const solvedStatusMap = new Map();
  if (isRegistered && contest.userStats?.problemStats) {
    for (const stat of contest.userStats.problemStats) {
      // The `problem` field will be populated by the API, so it's an object.
      // We safely get the ID and store the solved status.
      if (stat.problem?._id) {
        solvedStatusMap.set(stat.problem._id.toString(), stat.isSolved);
      }
    }
  }

  // 2. Iterate over the main `contest.problems` array. This is the complete list.
  // This ensures ALL problems are included in the final list.
  const problemsForDisplay = contest.problems.map(problem => {
    return {
      // Spread the original problem details (title, difficulty, etc.)
      ...problem,
      // Look up its solved status from the map. Default to `false` if not found.
      isSolved: solvedStatusMap.get(problem._id.toString()) || false,
    };
  });

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header - No changes needed here */}
        <div className="bg-[var(--card)] rounded-xl p-6 mb-8 border border-[var(--color-border)] shadow-lg">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">{contest.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  status === 'Upcoming' ? 'bg-[var(--accent-gold)]' :
                  status === 'Live' ? 'bg-[var(--primary-from)]' : 'bg-[var(--input-background)]'
                } text-[var(--button-text)]`}>
                  {status}
                </span>
                <span className="text-white/60 text-sm">{format(startTime, 'MMM d, yyyy • h:mm a')}</span>
              </div>
            </div>
            {status === 'Ended' && (
              <button onClick={() => navigate(`/contest/${id}/leaderboard`)} className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-[var(--button-text)] font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity hover:cursor-pointer">
                View Leaderboard
              </button>
            )}
          </div>
          <p className="text-white/60 mb-6">{contest.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-[var(--input-background)] p-4 rounded-lg">
              <div className="text-white/60 text-md">Status</div>
              <div className={`font-bold ${status === 'Upcoming' ? 'text-[var(--accent-gold)]' : status === 'Live' ? 'text-[var(--primary-from)]' : 'text-white'}`}>{status}</div>
            </div>
            <div className="bg-[var(--input-background)] p-4 rounded-lg">
              <div className="text-white/60 text-md">Duration</div>
              <div className="font-bold text-[var(--color-foreground)]">{contest.duration} minutes</div>
            </div>
            <div className="bg-[var(--input-background)] p-4 rounded-lg">
              <div className="text-white/60 text-md">Problems</div>
              <div className="font-bold text-[var(--color-foreground)]">{contest.problems?.length || 0}</div>
            </div>
            <div className="bg-[var(--input-background)] p-4 rounded-lg">
              <div className="text-white/60 text-md">Participants</div>
              <div className="font-bold text-[var(--color-foreground)]">{contest.registeredUsers?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
          {status === 'Upcoming' && (
            // Upcoming Section - No changes needed
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text mb-2">Contest Starts In</h2>
              <div className="mb-8"><CountdownTimer from={'contestDetailsPage'} targetDate={contest.startTime} /></div>
              {!isRegistered ? (
                <div>
                  <button onClick={handleRegister} disabled={isRegistering} className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-[var(--button-text)] font-semibold px-8 py-3 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </button>
                  {!user && <p className="text-[var(--muted-foreground)] mt-4"><Link to="/login" className="text-[var(--primary-from)] hover:underline">Log in</Link> to register for this contest</p>}
                </div>
              ) : <p className="text-[var(--primary-from)] font-semibold text-lg py-4">You are registered for this contest!</p>}
            </div>
          )}

          {/* This section now correctly handles Live and Ended contests for registered users */}
          {(status === 'Live' || status === 'Ended') && isRegistered && (
            <div>
              {status === 'Live' ? (
                <div className="flex flex-wrap justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to flex items-center gap-2">
                    <span className="flex h-3 w-3"><span className="animate-ping absolute h-3 w-3 rounded-full bg-[var(--primary-from)] opacity-75"></span><span className="relative h-3 w-3 rounded-full bg-[var(--primary-from)]"></span></span>
                    Contest is Live!
                  </h2>
                  <div className="flex-col bg-[var(--input-background)] p-2  rounded-lg">
                    <p className="text-white/70 text-md font-semibold mb-1">Time Remaining</p>
                    <CountdownTimer contest_id={id} targetDate={endTime}/>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to mb-4">Contest Has Ended</h2>
                  <p className="text-white/60 mb-8 max-w-2xl mx-auto">Review the problems and check the final standings.</p>
                </div>
              )}
              
              {/* **** THIS IS THE CORRECTED RENDER LOOP **** */}
              {/* It iterates over the `problemsForDisplay` array we created earlier. */}
              <div className="space-y-4">
                {problemsForDisplay.map((problem, index) => (
                  <ProblemListItem 
                    key={problem._id} 
                    problem={problem} 
                    index={index} 
                    contestId={id}
                    isSolved={problem.isSolved} // This now comes from our merged data
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useParams, useNavigate, Link } from 'react-router';
// import axiosClient from '../utils/axiosClient';
// import CountdownTimer from '../components/contest/CountdownTimer';
// import Loader from '../components/ui/Loader';
// import ProblemListItem from '../components/contest/ProblemListItems';
// import { toast } from 'react-toastify';
// import { format } from 'date-fns';
// import MissedOpportunityCard from '../components/contest/MissedOpportunityCard';

// export default function ContestDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
  
//   const [contest, setContest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [status, setStatus] = useState('');
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [problemStats , setProblemStats] = useState({}) ;
//   const [registered , setRegistered] = useState(true) ;

//   useEffect(() => {
//     const fetchContest = async () => {
//       try {
//         const {data} = await axiosClient.get(`/contest/${id}`);
//         if(!data.isRegistered)
//         {
//           setRegistered(false) ;
//         }
//         setContest(data?.contest);
//         setProblemStats(data?.userStats?.problemStats) ;
        
//         if (user) {
//           setIsRegistered(data?.contest?.registeredUsers.some(u => u._id === user._id));
//         }
//       } catch (err) {
//         setError('Contest not found or could not be loaded.');
//         console.error(err);
//       } finally {
//           console.log("Here") ;
//           // setLoading(false) ;
          
//       }
//     };
//     fetchContest();
//   }, [id, user]);

//   useEffect(() => {
//     if (!contest) return;

//     const interval = setInterval(() => {
//       const now = new Date();
//       const startTime = new Date(contest.startTime);
//       const endTime = new Date(startTime.getTime() + contest.duration * 60000);

//       if (now < startTime) 
//       {
//         setStatus('Upcoming');
//         setLoading(false);
//       }
//       else if (now >= startTime && now < endTime) {
//         setStatus('Live');
//         setLoading(false);
//       }
//       else {
//         setStatus('Ended');
//         setLoading(false);
//       }

//     }, 1000);



//     return () => clearInterval(interval);
//   }, [contest]);
  
//   const handleRegister = async () => {
//     if (!user) {
//       toast.info('Please log in to register for contests');
//       return;
//     }
    
//     setIsRegistering(true);
//     try {
//       await axiosClient.post(`/contest/${id}/register`);
//       setIsRegistered(true);
//       toast.success("You're registered! Good luck!");
//     } catch (error) {

//       if(error?.message == "You are already registered for this contest.")
//       toast.success(error.message);
//       else
//       toast.error(error.message);

//     } finally {
//       setIsRegistering(false);
//       setLoading(false) ;
//     }
//   };

//   if (loading) return <Loader />;
//   if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
//   if (!contest) return null;

//   const startTime = new Date(contest.startTime);
//   const endTime = new Date(startTime.getTime() + contest.duration * 60000);
//   const participant = contest.participants?.find(p => p.user._id === user?._id);
//   const userSolvedProblems = participant?.problemStats?.filter(stat => stat.isSolved).map(stat => stat.problem) || [];
  
//   let timeLeft = startTime.getTime() - new Date().getTime() ;
//   // console.log(timeLeft)
//   // setInterval(()=>{
    
//   //   if(!registered && timeLeft == 0)
//   //     <MissedOpportunityCard></MissedOpportunityCard>

//   // }, 1000)

//   // if(!isRegistered && timeLeft <= 0)
//   // {   
//   //   return(
//   //     <MissedOpportunityCard></MissedOpportunityCard>
//   //   )
//   // }
//   // else
//   // {
//   return (
//     <div className="min-h-screen p-4 sm:p-8">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="bg-[var(--card)] rounded-xl p-6 mb-8 border border-[var(--color-border)] shadow-lg">
//           <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
//             <div>
//               <h1 className="text-3xl font-bold mb-2 text-[var(--color-foreground)]">{contest.title}</h1>
//               <div className="flex items-center gap-3 mb-4">
//                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                   status === 'Upcoming' ? 'bg-[var(--accent-gold)]' :
//                   status === 'Live' ? 'bg-[var(--primary-from)]' : 'bg-[var(--input-background)]'
//                 } text-[var(--button-text)]`}>
//                   {status}
//                 </span>
//                 <span className="text-white/60 text-sm">
//                   {format(startTime, 'MMM d, yyyy • h:mm a')}
//                 </span>
//               </div>
//             </div>
            
//             {status === 'Ended' && (
//               <button 
//                 onClick={() => navigate(`/contest/${id}/leaderboard`)}
//                 className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-[var(--button-text)] font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity hover:cursor-pointer"
//               >
//                 View Leaderboard
//               </button>
//             )}
//           </div>
          
//           <p className="text-white/60 mb-6">{contest.description}</p>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//             <div className="bg-[var(--input-background)] p-4 rounded-lg">
//               <div className="text-white/60 text-md">Status</div>
//               <div className={`font-bold ${
//                 status === 'Upcoming' ? 'text-[var(--accent-gold)]' :
//                 status === 'Live' ? 'text-[var(--primary-from)]' : 'text-white'
//               }`}>
//                 {status}
//               </div>
//             </div>
            
//             <div className="bg-[var(--input-background)] p-4 rounded-lg">
//               <div className="text-white/60 text-md">Duration</div>
//               <div className="font-bold text-[var(--color-foreground)]">{contest.duration} minutes</div>
//             </div>
            
//             <div className="bg-[var(--input-background)] p-4 rounded-lg">
//               <div className="text-white/60 text-md">Problems</div>
//               <div className="font-bold text-[var(--color-foreground)]">{contest.problems?.length || 0}</div>
//             </div>
            
//             <div className="bg-[var(--input-background)] p-4 rounded-lg">
//               <div className="text-white/60 text-md">Participants</div>
//               <div className="font-bold text-[var(--color-foreground)]">{contest.registeredUsers?.length || 0}</div>
//             </div>
//           </div>
//         </div>

//         {/* Dynamic Content Area */}
//         <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">

//           {status === 'Ended' && (
//             <div className="text-center py-8">
//               <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to mb-4">Contest Has Ended</h2>
//               <p className="text-white/60 mb-8 max-w-2xl mx-auto">
//                 The contest is now over. You can review the problems and check the final standings.
//               </p>
              
//               <div className="flex-col flex-wrap justify-center gap-4">
//                 <div className="space-y-4">
//                   {console.log(problemStats)}
//                   {problemStats?.map((obj , index) => (
                    
//                     <ProblemListItem 
//                       key={obj?.problem?._id} 
//                       problem={obj?.problem} 
//                       index={index} 
//                       contestId={id}
//                       isSolved={obj?.isSolved}/>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {status === 'Upcoming' && (
//             <div className="text-center py-8">
//               <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">Contest Starts In</h2>
//               <div className="mb-8">
//                 <CountdownTimer targetDate={contest.startTime} />
//               </div>
              
//               {!isRegistered ? (
//                 <div>
//                   <button 
//                     onClick={handleRegister} 
//                     disabled={isRegistering}
//                     className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-[var(--button-text)] font-semibold px-8 py-3 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//                   >
//                     {isRegistering ? 'Registering...' : 'Register Now'}
//                   </button>
//                   {!user && (
//                     <p className="text-[var(--muted-foreground)] mt-4">
//                       <Link to="/login" className="text-[var(--primary-from)] hover:underline">Log in</Link> to register for this contest
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-[var(--primary-from)] font-semibold text-lg py-4">
//                   You are registered for this contest!
//                 </p>
//               )}
//             </div>
//           )}

//           {status === 'Live' && (
//             <div>
//               <div className="flex flex-wrap justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to flex items-center gap-2">
//                   <span className="flex h-3 w-3">
//                     <span className="animate-ping absolute h-3 w-3 rounded-full bg-[var(--primary-from)] opacity-75"></span>
//                     <span className="relative h-3 w-3 rounded-full bg-[var(--primary-from)]"></span>
//                   </span>
//                   Contest is Live!
//                 </h2>
//                 <div className="text-right bg-[var(--input-background)] p-3 rounded-lg">
//                   <p className="text-white/60 text-sm">Time Remaining</p>
//                   <CountdownTimer targetDate={endTime} />
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 {/* {contest.problems.map((problem , index) => (
//                   <ProblemListItem 
//                     key={index} 
//                     problem={problem} 
//                     index={index} 
//                     contestId={id}
//                     isSolved={userSolvedProblems.includes(problem._id)}/>
//                 ))} */}
//                 {problemStats?.map((obj , index) => (
//                     <ProblemListItem 
//                       key={index} 
//                       problem={obj?.problem} 
//                       index={index} 
//                       contestId={id}
//                       isSolved={obj?.isSolved}/>
//                   ))}
//               </div>
//             </div>
//           )}

          
//         </div>
//       </div>
//     </div>
//   );
// }
// // }



// import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useParams, useNavigate, Link } from 'react-router';
// import axiosClient from '../utils/axiosClient';
// import CountdownTimer from '../components/contest/CountdownTimer';
// import Loader from '../components/ui/Loader';
// import ProblemListItem from '../components/contest/ProblemListItems';
// import { toast } from 'react-toastify';
// import { format } from 'date-fns';

// export default function ContestDetailPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
  
//   const [contest, setContest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [status, setStatus] = useState('Upcoming');
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [isRegistering, setIsRegistering] = useState(false);

//   useEffect(() => {
//     const fetchContest = async () => {
//       try {
//         const { data } = await axiosClient.get(`/contest/${id}`);
//         setContest(data);
//         if (user) {
//           setIsRegistered(data.registeredUsers.some(u => u._id === user._id));

//         //     // Find participant data for current user
//         //   const participant = data.participants?.find(p => p.user._id === user._id);
//         //   setUserSolvedProblems(participant?.solvedProblems || []);
//         }
//       } catch (err) {
//         setError('Contest not found or could not be loaded.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContest();
//   }, [id, user]);

//   useEffect(() => {
//     if (!contest) return;

//     const interval = setInterval(() => {
//       const now = new Date();
//       const startTime = new Date(contest.startTime);
//       const endTime = new Date(startTime.getTime() + contest.duration * 60000);

//       if (now < startTime) setStatus('Upcoming');
//       else if (now >= startTime && now < endTime) setStatus('Live');
//       else setStatus('Ended');
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [contest]);
  
//   const handleRegister = async () => {
//     if (!user) {
//       toast.info('Please log in to register for contests');
//       return;
//     }
    
//     setIsRegistering(true);
//     try {
//       await axiosClient.post(`/contest/${id}/register`);
//       setIsRegistered(true);
//       toast.success("You're registered! Good luck!");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Registration failed.");
//     } finally {
//       setIsRegistering(false);
//     }
//   };

//   if (loading) return <Loader />;
//   if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
//   if (!contest) return null;

//   const startTime = new Date(contest.startTime);
//   const endTime = new Date(startTime.getTime() + contest.duration * 60000);
//   const userSolvedProblems = contest.participants?.find(p => p.user._id === user?._id)?.solvedProblems || [];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg">
//           <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
//               <div className="flex items-center gap-3 mb-4">
//                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                   status === 'Upcoming' ? 'bg-yellow-500' :
//                   status === 'Live' ? 'bg-green-500' : 'bg-gray-500'
//                 }`}>
//                   {status}
//                 </span>
//                 <span className="text-gray-400 text-sm">
//                   {format(startTime, 'MMM d, yyyy • h:mm a')}
//                 </span>
//               </div>
//             </div>
            
//             {status === 'Ended' && (
//               <button 
//                 onClick={() => navigate(`/contest/${id}/leaderboard`)}
//                 className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
//               >
//                 View Leaderboard
//               </button>
//             )}
//           </div>
          
//           <p className="text-gray-300 mb-6">{contest.description}</p>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//             <div className="bg-gray-700/50 p-4 rounded-lg">
//               <div className="text-gray-400 text-sm">Status</div>
//               <div className={`font-bold ${
//                 status === 'Upcoming' ? 'text-yellow-400' :
//                 status === 'Live' ? 'text-green-400' : 'text-gray-400'
//               }`}>
//                 {status}
//               </div>
//             </div>
            
//             <div className="bg-gray-700/50 p-4 rounded-lg">
//               <div className="text-gray-400 text-sm">Duration</div>
//               <div className="font-bold">{contest.duration} minutes</div>
//             </div>
            
//             <div className="bg-gray-700/50 p-4 rounded-lg">
//               <div className="text-gray-400 text-sm">Problems</div>
//               <div className="font-bold">{contest.problems?.length || 0}</div>
//             </div>
            
//             <div className="bg-gray-700/50 p-4 rounded-lg">
//               <div className="text-gray-400 text-sm">Participants</div>
//               <div className="font-bold">{contest.registeredUsers?.length || 0}</div>
//             </div>
//           </div>
//         </div>

//         {/* Dynamic Content Area */}
//         <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
//           {status === 'Upcoming' && (
//             <div className="text-center py-8">
//               <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Contest Starts In</h2>
//               <div className="mb-8">
//                 <CountdownTimer targetDate={contest.startTime} />
//               </div>
              
//               {!isRegistered ? (
//                 <div>
//                   <button 
//                     onClick={handleRegister} 
//                     disabled={isRegistering}
//                     className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//                   >
//                     {isRegistering ? 'Registering...' : 'Register Now'}
//                   </button>
//                   {!user && (
//                     <p className="text-gray-500 mt-4">
//                       <Link to="/login" className="text-cyan-400 hover:underline">Log in</Link> to register for this contest
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-green-400 font-semibold text-lg py-4">
//                   You are registered for this contest!
//                 </p>
//               )}
//             </div>
//           )}

//           {status === 'Live' && (
//             <div>
//               <div className="flex flex-wrap justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
//                   <span className="flex h-3 w-3">
//                     <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
//                     <span className="relative h-3 w-3 rounded-full bg-green-500"></span>
//                   </span>
//                   Contest is Live!
//                 </h2>
//                 <div className="text-right bg-gray-700/50 p-3 rounded-lg">
//                   <p className="text-gray-400 text-sm">Time Remaining</p>
//                   <CountdownTimer targetDate={endTime} />
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 {contest.problems?.map((problem, index) => (
//                   <ProblemListItem 
//                     key={problem._id} 
//                     problem={problem} 
//                     index={index} 
//                     contestId={id}
//                     isSolved={userSolvedProblems.includes(problem._id)}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {status === 'Ended' && (
//             <div className="text-center py-8">
//               <h2 className="text-3xl font-bold text-gray-400 mb-4">Contest Has Ended</h2>
//               <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
//                 The contest is now over. You can review the problems and check the final standings.
//               </p>
              
//               <div className="flex flex-wrap justify-center gap-4">
//                 <button 
//                   onClick={() => navigate(`/contest/${id}/leaderboard`)}
//                   className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
//                 >
//                   View Leaderboard
//                 </button>
                
//                 <button 
//                   onClick={() => navigate(`/contest/${id}/problems`)}
//                   className="bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
//                 >
//                   Review Problems
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }







// // src/pages/ContestDetailPage.jsx
// import { useState, useEffect } from 'react';
// import {useSelector } from 'react-redux';
// import { useParams, useNavigate } from 'react-router';
// import axiosClient from '../utils/axiosClient';
// import CountdownTimer from '../components/contest/CountDownTimer';
// // import Loader from '../components/ui/Loader';
// // import ProblemListItem from '../components/contest/ProblemListItems';
// import {toast} from 'react-toastify';


// export default function ContestDetailPage() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const {user} = useSelector((state) => state.auth) ;

//     const [contest, setContest] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [status, setStatus] = useState('Upcoming');
//     const [isRegistered, setIsRegistered] = useState(false);
//     const [isRegistering, setIsRegistering] = useState(false);

//     useEffect(() => {
//         const fetchContest = async () => {
//             try {
//                 const { data } = await axiosClient.get(`/contest/${id}`);
//                 setContest(data);
//                 if (user) {
//                     setIsRegistered(data.registeredUsers.some(u => u._id === user._id));
//                 }
//             } catch (err) {
//                 setError('Contest not found or could not be loaded.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchContest();
//     }, [id, user]);

//     useEffect(() => {
//         if (!contest) return;

//         const interval = setInterval(() => {
//             const now = new Date();
//             const startTime = new Date(contest.startTime);
//             const endTime = new Date(startTime.getTime() + contest.duration * 60000);

//             if (now < startTime) setStatus('Upcoming');
//             else if (now >= startTime && now < endTime) setStatus('Live');
//             else setStatus('Ended');
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [contest]);
    
//     const handleRegister = async () => {
//         setIsRegistering(true);
//         try {
//             await axiosClient.post(`/contests/${id}/register`);
//             setIsRegistered(true);
//             toast.success("You're registered! Good luck!");
//         } catch (error) {
//             toast.error(error.response?.data?.message || "Registration failed.");
//         } finally {
//             setIsRegistering(false);
//         }
//     };

//     // if (loading) return <Loader />;
//     if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;
//     if (!contest) return null;

//     const endTime = new Date(new Date(contest.startTime).getTime() + contest.duration * 60000);

//     return (
//         <div className="min-h-screen text-card-foreground p-4 sm:p-8">
//             <div className="max-w-5xl mx-auto">
//                 {/* Header */}
//                 <div className="bg-card rounded-lg p-6 mb-8 border border-border/50">
//                     <h1 className="text-4xl font-bold mb-2">{contest.title}</h1>
//                     <p className="text-placeholder-text mb-6">{contest.description}</p>
                    
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//                         {/* Status, Duration, Problems, Participants */}
//                     </div>
//                 </div>

//                 {/* Dynamic Content Area */}
//                 <div className="bg-card rounded-lg p-6 border border-border/50">
//                     {status === 'Upcoming' && (
//                         <div className="text-center">
//                             <h2 className="text-2xl font-semibold mb-4 text-primary-from">Contest Starts In</h2>
//                             <CountdownTimer targetDate={contest.startTime} />
//                             {!isRegistered && (
//                                 <button onClick={handleRegister} disabled={isRegistering} className="mt-8 bg-gradient-to-r from-primary-from to-primary-to text-button-text font-bold px-8 py-3 rounded-md hover:opacity-90 disabled:opacity-50">
//                                     {isRegistering ? 'Registering...' : 'Register Now'}
//                                 </button>
//                             )}
//                             {isRegistered && <p className="mt-8 text-green-400 font-semibold text-lg">You are registered for this contest!</p>}
//                         </div>
//                     )}

//                     {status === 'Live' && (
//                         <div>
//                            <div className="flex justify-between items-center mb-6">
//                              <h2 className="text-2xl font-bold text-green-400">Contest is Live!</h2>
//                              <div className="text-right">
//                                <p className="text-placeholder-text text-sm">Time Remaining</p>
//                                <CountdownTimer targetDate={endTime} />
//                              </div>
//                            </div>
//                            <div className="space-y-4">
//                                {contest.problems.map((p, i) => <ProblemListItem key={p._id} problem={p} index={i} contestId={id} />)}
//                            </div>
//                         </div>
//                     )}

//                     {status === 'Ended' && (
//                          <div className="text-center">
//                             <h2 className="text-3xl font-bold text-placeholder-text mb-4">Contest Has Ended</h2>
//                             <p className="mb-8">Check out the final standings and review the problems.</p>
//                             <button onClick={() => navigate(`/contests/${id}/ranking`)} className="bg-gradient-to-r from-primary-from to-primary-to text-button-text font-bold px-8 py-3 rounded-md hover:opacity-90">
//                                 View Rankings
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router';
// import axiosClient from '../utils/axiosClient';

// export default function ContestPage() {
//   const { id } = useParams();
//   const [contest, setContest] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(0);
  
//   useEffect(() => {
//     try{
//         const fetchContest = async () => {
//         const res = await axiosClient.get(`/contest/${id}`);
//         const data = res.data;
//         setContest(data);
//         console.log(data) ;
        
//         // Calculate time until start
//         const startTime = new Date(data.startTime).getTime();
//         const now = Date.now();
//         setTimeLeft(Math.max(0, startTime - now));
//       };

//       fetchContest();
      
//       // Update timer every second
//       const timer = setInterval(() => {
//         setTimeLeft(prev => Math.max(0, prev - 1000));
//       }, 1000);
      
//       return () => clearInterval(timer);
//     }
//     catch(err)
//     {
//       console.log("Error : " + err) ;
//     }
//   }, [id]);
  
//   if (!contest) return <div>Loading...</div>;
  
//   // Format time
//   const hours = Math.floor(timeLeft / (1000 * 60 * 60));
//   const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
//   return (
//     <div className="container mx-auto py-8">
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
        
//         {timeLeft > 0 ? (
//           <div className="mb-4">
//             <div className="text-xl font-semibold text-gray-700">
//               Contest starts in:
//             </div>
//             <div className="text-4xl font-bold text-indigo-600 mt-2">
//               {hours.toString().padStart(2, '0')}:
//               {minutes.toString().padStart(2, '0')}
//             </div>
//           </div>
//         ) : (
//           <div className="mb-4">
//             <div className="text-xl font-semibold text-green-600">
//               Contest is live!
//             </div>
//             <div className="mt-4 flex space-x-4">
//               <button className="bg-green-600 text-white px-4 py-2 rounded-md">
//                 Submit Solution
//               </button>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
//                 View Problems
//               </button>
//             </div>
//           </div>
//         )}
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           <div className="border rounded-lg p-4">
//             <h3 className="font-semibold">Duration</h3>
//             <p>{Math.floor(contest.duration / 60)} hours</p>
//           </div>
//           <div className="border rounded-lg p-4">
//             <h3 className="font-semibold">Problems</h3>
//             <p>{contest.problems.length}</p>
//           </div>
//           <div className="border rounded-lg p-4">
//             <h3 className="font-semibold">Participants</h3>
//             <p>{contest.participants.length}</p>
//           </div>
//         </div>
//       </div>
      
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-bold mb-4">Problems</h2>
//         <div className="space-y-3">
//           {contest.problems.map((problem, index) => (
//             <div key={problem._id} className="flex items-center border-b pb-3">
//               <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full mr-4">
//                 {index + 1}
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-medium">{problem.title}</h3>
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
//                   problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
//                   'bg-red-100 text-red-800'
//                 }`}>
//                   {problem.difficulty}
//                 </span>
//               </div>
//               {timeLeft === 0 && (
//                 <button className="bg-indigo-600 text-white px-4 py-1 rounded-md">
//                   Solve
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }