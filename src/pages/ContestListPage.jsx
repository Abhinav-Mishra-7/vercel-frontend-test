import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Loader from '../components/loader/Loader';
import { format } from 'date-fns';
import CountdownTimer from '../components/contest/CountDownTimer';
import Navbar from '../components/navbar/Navbar';

export default function ContestsListPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'live', 'upcoming', 'past'

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await axiosClient.get('/contest');
        setContests(data);
      } catch (err) {
        setError('Failed to load contests. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const now = new Date();
  const liveContests = contests.filter(
    c => new Date(c.startTime) <= now && 
    new Date(c.startTime).getTime() + c.duration * 60000 > now.getTime()
  );
  
  const upcomingContests = contests.filter(
    c => new Date(c.startTime) > now
  );
  
  const pastContests = contests.filter(
    c => new Date(c.startTime).getTime() + c.duration * 60000 <= now.getTime()
  );

  const filteredContests = {
    all: contests,
    live: liveContests,
    upcoming: upcomingContests,
    past: pastContests,
  }[filter];

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen ">
      <Navbar></Navbar>
      <div className="max-w-7xl mx-auto my-5">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to mb-4 py-2">
            Coding Contests
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Compete with programmers worldwide, improve your skills, and climb the leaderboard
          </p>
        </header>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {['all', 'live', 'upcoming', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-[var(--button-text)]'
                  : 'bg-[var(--input-background)] text-white/60 hover:opacity-90'
              }`}
            >
              {f} {f !== 'all' && `(${filteredContests.length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map(contest => (
            <ContestCard key={contest._id} contest={contest} />
          ))}
        </div>

        {filteredContests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl text-[var(--muted-foreground)] mb-4">No contests found</div>
            <div className="text-[var(--muted-foreground)]">Check back later for new contests</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContestCard({ contest }) {
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(startTime.getTime() + contest.duration * 60000);
  const { user, solvedProblems } = useSelector((state) => state.auth);
  
  let status = 'Upcoming';
  let statusColor = 'bg-[var(--accent-gold)]';
  let timerLabel = 'Starts in';
  let timerTarget = startTime;
  
  if (now >= startTime && now < endTime) {
    status = 'Live';
    statusColor = 'bg-[var(--primary-from)]';
    timerLabel = 'Ends in';
    timerTarget = endTime;
  } else if (now >= endTime) {
    status = 'Completed';
    statusColor = 'bg-[var(--input-background)]';
  }

   // Calculate solved count for current user
  const userSolvedCount = contest.isRegistered && user ? (solvedProblems[contest._id]?.length || 0) : 0;

  console.log(contest.title.charAt(0)) ;
  
  return (
    <Link to={`/contest/${contest._id}`}>
      <div className="bg-card/80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col border border-[var(--color-border)]">
        <div className={`${statusColor} px-4 py-1 text-sm font-semibold text-white text-center`}>
          {status}
        </div>
        
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-[var(--color-foreground)] truncate">{contest.title.charAt(0).toUpperCase() + contest.title.slice(1)}</h3>
            <span className="bg-[var(--input-background)] text-[var(--color-foreground)] text-xs px-2 py-1 rounded-full whitespace-nowrap">
              Duration : {contest.duration} Min
            </span>
          </div>
          
          <p className="text-[var(--muted-foreground)] text-sm mb-4 line-clamp-2">
            {contest.description}
          </p>
          
          {/* Timer Section */}
          {status !== 'Completed' && (
            <div className="mb-4 flex items-start ">
              <div className="text-white/60 text-md mb-1 mr-4 font-medium">{timerLabel} : </div>
              <CountdownTimer targetDate={timerTarget} />
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-white/60 flex">
              <div className="font-medium mr-3">Starts At :</div>
              <div>{format(startTime, 'MMM d, yyyy h:mm a')}</div>
            </div>
            
            {/* <div className="text-right">
              <div className="font-medium text-white/60">Participants:</div>
              <div className="font-medium text-white/60">
                {contest.registeredUsers?.length || 0}
              </div>
            </div> */}
          </div>
        </div>
        
        {/* <div className="px-6 pb-4"> */}
          {/* <div className="h-1 w-full bg-[var(--input-background)] rounded-full mb-2">
            <div 
              className="h-full bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] rounded-full" 
              style={{ width: `${Math.min(100, (userSolvedCount / contest.problemsCount) * 100)}%` }}
            ></div>
          </div> */}
          {/* <div className="text-xs text-white/60 flex justify-between">
            <span>{status} • {contest.problemsCount} problems
              {userSolvedCount > 0 && ` • Solved: ${userSolvedCount}`}</span>
            <span>{contest.participantsCount} registered</span>
          </div> */}
        {/* </div> */}
      </div>
    </Link>
  );
}



// import { useState, useEffect } from 'react';
// import { Link } from 'react-router';
// import axiosClient from '../utils/axiosClient';
// import Loader from '../components/ui/Loader';
// import { format } from 'date-fns';
// import CountdownTimer from '../components/contest/CountdownTimer';

// export default function ContestsListPage() {
//   const [contests, setContests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all'); // 'all', 'live', 'upcoming', 'past'

//   useEffect(() => {
//     const fetchContests = async () => {
//       try {
//         const { data } = await axiosClient.get('/contest');
//         setContests(data);
//       } catch (err) {
//         setError('Failed to load contests. Please try again later.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContests();
//   }, []);

//   const now = new Date();
//   const liveContests = contests.filter(
//     c => new Date(c.startTime) <= now && 
//     new Date(c.startTime).getTime() + c.duration * 60000 > now.getTime()
//   );
  
//   const upcomingContests = contests.filter(
//     c => new Date(c.startTime) > now
//   );
  
//   const pastContests = contests.filter(
//     c => new Date(c.startTime).getTime() + c.duration * 60000 <= now.getTime()
//   );

//   const filteredContests = {
//     all: contests,
//     live: liveContests,
//     upcoming: upcomingContests,
//     past: pastContests,
//   }[filter];

//   if (loading) return <Loader />;
//   if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
//       <div className="max-w-7xl mx-auto">
//         <header className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-4">
//             Coding Contests
//           </h1>
//           <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//             Compete with programmers worldwide, improve your skills, and climb the leaderboard
//           </p>
//         </header>

//         {/* Filter Tabs */}
//         <div className="flex flex-wrap gap-2 mb-8 justify-center">
//           {['all', 'live', 'upcoming', 'past'].map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
//                 filter === f
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
//               }`}
//             >
//               {f} {f !== 'all' && `(${filteredContests.length})`}
//             </button>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredContests.map(contest => (
//             <ContestCard key={contest._id} contest={contest} />
//           ))}
//         </div>

//         {filteredContests.length === 0 && (
//           <div className="text-center py-12">
//             <div className="text-2xl text-gray-400 mb-4">No contests found</div>
//             <div className="text-gray-500">Check back later for new contests</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export function ContestCard({ contest }) {
//   const now = new Date();
//   const startTime = new Date(contest.startTime);
//   const endTime = new Date(startTime.getTime() + contest.duration * 60000);
  
//   let status = 'Upcoming';
//   let statusColor = 'bg-yellow-500';
//   let timerLabel = 'Starts in';
//   let timerTarget = startTime;
  
//   if (now >= startTime && now < endTime) {
//     status = 'Live';
//     statusColor = 'bg-green-500';
//     timerLabel = 'Ends in';
//     timerTarget = endTime;
//   } else if (now >= endTime) {
//     status = 'Completed';
//     statusColor = 'bg-gray-500';
//   }
  
//   return (
//     <Link to={`/contest/${contest._id}`}>
//       <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
//         <div className={`${statusColor} px-4 py-1 text-xs font-semibold text-white text-center`}>
//           {status}
//         </div>
        
//         <div className="p-6 flex-grow">
//           <div className="flex justify-between items-start mb-4">
//             <h3 className="text-xl font-bold text-white truncate">{contest.title}</h3>
//             <span className="bg-gray-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">
//               {contest.duration} min
//             </span>
//           </div>
          
//           <p className="text-gray-400 text-sm mb-4 line-clamp-2">
//             {contest.description}
//           </p>
          
//           {/* Timer Section */}
//           {status !== 'Completed' && (
//             <div className="mb-4">
//               <div className="text-gray-500 text-sm mb-1">{timerLabel}</div>
//               <CountdownTimer targetDate={timerTarget} />
//             </div>
//           )}
          
//           <div className="flex justify-between items-center text-sm">
//             <div className="text-gray-500">
//               <div className="font-medium">Starts:</div>
//               <div>{format(startTime, 'MMM d, yyyy h:mm a')}</div>
//             </div>
            
//             <div className="text-right">
//               <div className="font-medium text-gray-500">Participants:</div>
//               <div className="font-medium text-white">
//                 {contest.registeredUsers?.length || 0}
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="px-6 pb-4">
//           <div className="h-1 w-full bg-gray-700 rounded-full mb-2">
//             <div 
//               className="h-full bg-cyan-500 rounded-full" 
//               style={{ width: `${Math.min(100, (contest.registeredUsers?.length || 0) / 100 * 100)}%` }}
//             ></div>
//           </div>
//           <div className="text-xs text-gray-500 flex justify-between">
//             <span>{status} • {contest.problems?.length || 0} problems</span>
//             <span>{contest.registeredUsers?.length || 0} registered</span>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }




// // src/pages/ContestsListPage.jsx
// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosClient';
// import ContestCard from '../components/contest/ContestCard';
// // import Loader from '../components/ui/Loader';

// export default function ContestsListPage() {
//     const [contests, setContests] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchContests = async () => {
//             try {
//                 const { data } = await axiosClient.get('/contests');
//                 setContests(data);
//             } catch (err) {
//                 setError('Failed to load contests. Please try again later.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchContests();
//     }, []);

//     const now = new Date();
//     const liveContests = contests.filter(c => new Date(c.startTime) <= now && new Date(c.startTime).getTime() + c.duration * 60000 > now.getTime());
//     const upcomingContests = contests.filter(c => new Date(c.startTime) > now);
//     const pastContests = contests.filter(c => new Date(c.startTime).getTime() + c.duration * 60000 <= now.getTime());

//     if (loading) return <Loader />;
//     if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;

//     return (
//         <div className="min-h-screen text-card-foreground p-4 sm:p-8">
//             <div className="max-w-7xl mx-auto">
//                 <header className="text-center mb-12">
//                     <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary-from to-primary-to text-transparent bg-clip-text mb-2">
//                         CodeVerse Contests
//                     </h1>
//                     <p className="text-lg text-placeholder-text">
//                         Compete every week and see your ranking!
//                     </p>
//                 </header>

//                 {liveContests.length > 0 && (
//                     <ContestSection title="Live Now" contests={liveContests} />
//                 )}
//                 {upcomingContests.length > 0 && (
//                     <ContestSection title="Upcoming Contests" contests={upcomingContests} />
//                 )}
//                 {pastContests.length > 0 && (
//                     <ContestSection title="Past Contests" contests={pastContests} />
//                 )}
//             </div>
//         </div>
//     );
// }

// const ContestSection = ({ title, contests }) => (
//     <section className="mb-12">
//         <h2 className="text-3xl font-semibold mb-6 border-b-2 border-border pb-2">{title}</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {contests.map(contest => (
//                 <ContestCard key={contest._id} contest={contest} />
//             ))}
//         </div>
//     </section>
// );



// import { useEffect, useState } from 'react';
// import { Link } from 'react-router';
// import axiosClient from '../utils/axiosClient';

// export default function ContestList() {
//   const [contests, setContests] = useState([]);
  
//   useEffect(() => {
//     const fetchContests = async () => {
//       const res = await axiosClient.get('/contest/upcoming');
//       const data = res.data ;
//       setContests(data);
//     };
//     fetchContests();
//   }, []);

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-6">Upcoming Contests</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {contests.map(contest => (
//           <div key={contest._id} className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex justify-between items-start">
//               <div>
//                 <Link to={`/contest/${contest._id}`} className="text-xl font-bold text-blue-600 hover:underline">
//                   {contest.title}
//                 </Link>
//                 <p className="text-gray-600 mt-2">{contest.description}</p>
//               </div>
//               <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                 {new Date(contest.startTime).toLocaleDateString()}
//               </span>
//             </div>
            
//             <div className="mt-4 flex justify-between items-center">
//               <div>
//                 <span className="text-gray-500">Duration: </span>
//                 <span>{Math.floor(contest.duration / 60)}h {contest.duration % 60}m</span>
//               </div>
//               <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
//                 Join Contest
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }