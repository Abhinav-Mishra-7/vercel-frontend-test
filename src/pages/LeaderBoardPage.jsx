import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Loader from '../components/loader/Loader';

export default function LeaderboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid contest ID');
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/contest/${id}/leaderboard`);
        
        // If leaderboard is empty, show message
        if (!data?.leaderboard || data.leaderboard.length === 0) {
          setContest({
            ...data,
            leaderboard: []
          });
        } else {
          setContest(data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load leaderboard. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [id]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedLeaderboard = () => {
    if (!contest || !contest.leaderboard || contest.leaderboard.length === 0) return [];
    
    return [...contest.leaderboard].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!contest) return null;

  const sortedLeaderboard = getSortedLeaderboard();
  console.log(sortedLeaderboard) ;
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            {contest.title} Leaderboard
          </h1>
          <p className="text-gray-400">
            Final rankings after the contest ended
          </p>
        </div>

        {sortedLeaderboard.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-2xl text-gray-400 mb-4">No leaderboard data available</div>
            <p className="text-gray-500 mb-6">
              The leaderboard is empty because no participants have submitted solutions yet.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90"
            >
              Back to Contest
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 text-gray-400">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:text-white"
                      onClick={() => requestSort('rank')}
                    >
                      Rank {sortConfig.key === 'rank' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">User</th>
                    <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:text-white"
                      onClick={() => requestSort('score')}
                    >
                      Score {sortConfig.key === 'score' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th>
                    {/* <th 
                      className="px-6 py-4 text-left font-semibold cursor-pointer hover:text-white"
                      onClick={() => requestSort('penalty')}
                    >
                      Time {sortConfig.key === 'penalty' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </th> */}
                    {contest.problems?.map((problem, index) => (
                      <th key={problem._id} className="px-6 py-4 text-center font-semibold">
                        {String.fromCharCode(65 + index)}
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-700">
                  {sortedLeaderboard.map((entry) => (
                    <tr key={entry.user?._id || entry.rank} className={entry.rank % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}>
                      <td className="px-6 py-4 font-medium">
                        {entry.rank}
                        {entry.rank <= 3 && (
                          <span className="ml-2">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {entry.user ? (
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-700 rounded-full px-3 py-3 flex items-center justify-center text-sm font-bold">
                              {entry.user.firstName}                         
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">Unknown User</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold">{entry.score}</td>
                      {/* <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span>{Math.floor(entry.penalty / 60)}</span>
                          <span className="text-gray-500 text-sm">min</span>
                        </div>
                      </td> */}
                      
                      {contest.problems?.map(problem => {
                        const problemStat = entry.problemStats?.find(p => 
                          p.problem && p.problem._id === problem._id
                        );
                        
                        return (
                          <td key={problem._id} className="px-6 py-4 text-center">
                            {problemStat ? (
                              <div className="flex flex-col items-center">
                                <div className={`text-lg font-bold ${
                                  problemStat.isSolved ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {problemStat.isSolved ? '✓' : '✗'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {problemStat.solveTime && `${Math.floor(problemStat.solveTime / 60)}m`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosClient';
// import { useParams } from 'react-router';
// import Loader from '../components/ui/Loader';

// export default function LeaderboardPage() {
//   const { id } = useParams();
//   const [contest, setContest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       try {
//         setLoading(true);
//         const { data } = await axiosClient.get(`/contest/${id}/leaderboard`);
//         console.log(data) ;
//         setContest(data);
//       } catch (err) {
//         setError('Failed to load leaderboard. Please try again later.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaderboard();
//   }, [id]);

//   const requestSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   const getSortedLeaderboard = () => {
//     if (!contest || !contest.leaderboard) return [];
    
//     return [...contest.leaderboard].sort((a, b) => {
//       if (a[sortConfig.key] < b[sortConfig.key]) {
//         return sortConfig.direction === 'ascending' ? -1 : 1;
//       }
//       if (a[sortConfig.key] > b[sortConfig.key]) {
//         return sortConfig.direction === 'ascending' ? 1 : -1;
//       }
//       return 0;
//     });
//   };

//   if (loading) return <Loader />;
//   if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
//   if (!contest) return null;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-10">
//           <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
//             {contest.title} Leaderboard
//           </h1>
//           <p className="text-gray-400">
//             Final rankings after the contest ended
//           </p>
//         </div>

//         <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-700 text-gray-400">
//                 <tr>
//                   <th 
//                     className="px-6 py-4 text-left font-semibold cursor-pointer hover:text-white"
//                     onClick={() => requestSort('rank')}
//                   >
//                     Rank {sortConfig.key === 'rank' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                   </th>
//                   <th className="px-6 py-4 text-left font-semibold">User</th>
//                   <th 
//                     className="px-6 py-4 text-left font-semibold cursor-pointer hover:text-white"
//                     onClick={() => requestSort('score')}
//                   >
//                     Score {sortConfig.key === 'score' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                   </th>
//                   <th 
//                     className="px-6 py-4 text-left font-semibold cursor-pointer hover:text-white"
//                     onClick={() => requestSort('penalty')}
//                   >
//                     Time {sortConfig.key === 'penalty' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                   </th>
//                   {contest.problems?.map((problem, index) => (
//                     <th key={problem._id} className="px-6 py-4 text-center font-semibold">
//                       {String.fromCharCode(65 + index)}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
              
//               <tbody className="divide-y divide-gray-700">
//                 {getSortedLeaderboard().map((entry, idx) => (
//                   <tr key={entry.user._id} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}>
//                     <td className="px-6 py-4 font-medium">
//                       {entry.rank}
//                       {entry.rank <= 3 && (
//                         <span className="ml-2">
//                           {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
//                           {entry.user.username.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <div className="font-medium">{entry.user.username}</div>
//                           <div className="text-sm text-gray-500">{entry.user.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 font-bold">{entry.score}</td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-1">
//                         <span>{Math.floor(entry.penalty / 60)}</span>
//                         <span className="text-gray-500 text-sm">min</span>
//                       </div>
//                     </td>
                    
//                     {contest.problems?.map(problem => {
//                       const problemStat = entry.problemStats?.find(p => p.problem._id === problem._id);
//                       return (
//                         <td key={problem._id} className="px-6 py-4 text-center">
//                           {problemStat ? (
//                             <div className="flex flex-col items-center">
//                               <div className="text-green-500 font-bold">
//                                 {problemStat.isSolved ? '✓' : '✗'}
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 {problemStat.solveTime && `${Math.floor(problemStat.solveTime / 60)}m`}
//                               </div>
//                             </div>
//                           ) : (
//                             <span className="text-gray-500">-</span>
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
        
//         {contest.leaderboard?.length === 0 && (
//           <div className="text-center py-12 text-gray-500">
//             No participants yet
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// // // src/pages/RankingPage.jsx
// // import { useState, useEffect } from 'react';
// // import { useParams } from 'react-router-dom';
// // import axiosClient from '../utils/axiosClient';
// // // import Loader from '../components/ui/Loader';

// // // Mock function to format time
// // const formatTime = (seconds) => {
// //     if (seconds === null || seconds === undefined) return '-';
// //     const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
// //     const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
// //     const s = Math.floor(seconds % 60).toString().padStart(2, '0');
// //     return `${h}:${m}:${s}`;
// // };

// // export default function RankingPage() {
// //     const { id } = useParams();
// //     const [leaderboardData, setLeaderboardData] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState(null);

// //     useEffect(() => {
// //         const fetchLeaderboard = async () => {
// //             try {
// //                 const { data } = await axiosClient.get(`/contests/${id}/leaderboard`);
// //                 setLeaderboardData(data);
// //             } catch (err) {
// //                 setError("Failed to load leaderboard.");
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         fetchLeaderboard();
// //     }, [id]);

// //     if (loading) return <Loader />;
// //     if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;
// //     if (!leaderboardData) return null;

// //     const { title, leaderboard, problems } = leaderboardData;

// //     return (
// //         <div className="min-h-screen text-card-foreground p-4 sm:p-8">
// //             <div className="max-w-7xl mx-auto">
// //                 <header className="mb-8">
// //                     <h1 className="text-4xl font-bold text-center mb-2">{title}</h1>
// //                     <h2 className="text-2xl font-semibold text-center text-placeholder-text">Final Rankings</h2>
// //                 </header>

// //                 <div className="overflow-x-auto bg-card border border-border/50 rounded-lg shadow-2xl">
// //                     <table className="w-full text-left">
// //                         <thead className="bg-input-background/50">
// //                             <tr>
// //                                 <th className="p-4 font-semibold">Rank</th>
// //                                 <th className="p-4 font-semibold">Name</th>
// //                                 <th className="p-4 font-semibold">Score</th>
// //                                 <th className="p-4 font-semibold">Penalty</th>
// //                                 {problems.map((p, i) => (
// //                                     <th key={p._id} className="p-4 font-semibold text-center">Q{i + 1}</th>
// //                                 ))}
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {leaderboard.map((entry, index) => (
// //                                 <tr key={entry.user._id} className="border-t border-border/50 hover:bg-input-background/30 transition-colors">
// //                                     <td className="p-4 font-bold">{entry.rank || index + 1}</td>
// //                                     <td className="p-4 text-primary-from font-semibold">{entry.user.username}</td>
// //                                     <td className="p-4 font-bold">{entry.score}</td>
// //                                     <td className="p-4 text-placeholder-text">{formatTime(entry.penalty)}</td>
// //                                     {/* Map through problem stats to show solve time */}
// //                                     {problems.map(p => {
// //                                         const stat = entry.problemStats.find(s => s.problem.toString() === p._id.toString());
// //                                         return (
// //                                             <td key={p._id} className="p-4 text-center">
// //                                                 {stat && stat.solveTime ? (
// //                                                     <span className="text-green-400">{formatTime(stat.solveTime)}</span>
// //                                                 ) : (
// //                                                     <span className="text-destructive">-</span>
// //                                                 )}
// //                                             </td>
// //                                         );
// //                                     })}
// //                                 </tr>
// //                             ))}
// //                         </tbody>
// //                     </table>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }