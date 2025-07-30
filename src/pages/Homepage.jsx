import { useEffect, useState, useMemo, useRef } from 'react';
import { NavLink } from 'react-router'; // Corrected import from 'react-router' to 'react-router-dom'
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { CheckCircle, Search, ArrowLeft, ArrowRight, Bookmark, Filter, X } from 'lucide-react';
import Navbar from '../components/navbar/Navbar';
import Loader from '../components/loader/Loader';

// --- DATA & CONFIG ---

const getDifficultyClass = (difficulty) => {
  const baseClass = "font-semibold capitalize";
  switch (difficulty?.toLowerCase()) {
    case 'easy': return `${baseClass} text-teal-400`;
    case 'medium': return `${baseClass} text-amber-400`;
    case 'hard': return `${baseClass} text-rose-400`;
    default: return `${baseClass} text-muted-foreground`;
  }
};

const TOPIC_TAGS = ["All Tags", "Array", "String", "Hash Table", "DP", "Math", "Sorting", "Greedy", "Graph", "Two Pointers", "Binary Search"];
const COMPANY_TAGS = [
  { name: 'Amazon', count: 1855, link: '/company/amazon' },
  { name: 'Google', count: 2032, link: '/company/google' },
  { name: 'Meta', count: 1234, link: '/company/meta' },
];

// --- HELPER COMPONENTS ---

const ProgressStat = ({ label, value, total, colorClass }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs font-semibold text-muted-foreground">{value} / {total}</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-2">
      <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div>
    </div>
  </div>
);

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'All Tags',
    status: 'all',
    searchQuery: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const problemsPerPage = 10;
  const filterRef = useRef(null);

  useEffect(() => {
    if (user?.wishlist) {
      setWishlist(user.wishlist);
    }
  }, [user]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          axiosClient.get('/problem/getAllProblems'),
          user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: { problemSolved: [] } })
        ]);
        setProblems(problemsRes.data || []);
        // The API returns the full problem object for solved problems
        setSolvedProblems(solvedRes.data.solvedProblems || []);
      } catch (error) { 
        console.error('Error fetching data:', error);
        setProblems([]);
        setSolvedProblems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterRef]);


  const problemStats = useMemo(() => {
    const total = { easy: 0 , medium: 0, hard: 0 };
    const solved = { easy: 0, medium: 0, hard: 0 };

    problems.forEach(p => {
      if (p.difficulty) total[p.difficulty.toLowerCase()]++;
    });
    solvedProblems.forEach(p => {
       if (p.difficulty) solved[p.difficulty.toLowerCase()]++;
    });
    
    return { total, solved };
  }, [problems, solvedProblems]);

  const solvedProblemIds = useMemo(() => 
    new Set(solvedProblems.map(p => p._id)), 
    [solvedProblems]
  );
  

  const filteredProblems = useMemo(() => problems?.filter(problem => {
    // Search filter (case-insensitive)
    const searchMatch = problem.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    // Difficulty filter
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;

    const problemTags = Array.isArray(problem.tags) ? problem.tags : (problem.tags ? [problem.tags] : []);
    
    // Tag filter - Safely checks if the problem's tags array includes the selected tag
    const tagMatch = filters.tag === 'All Tags' || problemTags.includes(filters.tag.toLowerCase());
    console.log(tagMatch) ;
    // Status filter - Uses the efficient `solvedProblemIds` Set for checking
    const isSolved = solvedProblemIds.has(problem._id);
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && isSolved) ||
      (filters.status === 'unsolved' && !isSolved);
      
    return searchMatch && difficultyMatch && tagMatch && statusMatch;
  }), [problems, filters, solvedProblemIds]); // depends on solvedProblemIds now

  // Pagination logic
  const currentProblems = useMemo(() => {
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    return filteredProblems?.slice(indexOfFirstProblem, indexOfLastProblem);
  }, [filteredProblems, currentPage, problemsPerPage]);

  const totalPages = Math.ceil(filteredProblems?.length / problemsPerPage);


  const handleToggleWishlist = async (e, problemId) => {
    e.preventDefault(); 
    if (!user) return;
    
    const isInWishlist = wishlist.includes(problemId);
    // Optimistic UI update for instant feedback
    setWishlist(current => isInWishlist ? current.filter(id => id !== problemId) : [...current, problemId]);

    try {
      await axiosClient.post('/user/wishlist/toggle', { problemId });
    } catch (error) {
        console.error('Failed to update wishlist:', error);
        // Revert UI on API error
        setWishlist(current => isInWishlist ? [...current, problemId] : current.filter(id => id !== problemId));
    }
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on any filter change
  };
  
  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="bg-card rounded-lg p-4 sticky top-24 border border-white/10 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <ProgressStat label="Easy" value={problemStats.solved.easy} total={problemStats.total.easy} colorClass="bg-teal-400" />
                  <ProgressStat label="Medium" value={problemStats.solved.medium} total={problemStats.total.medium} colorClass="bg-amber-400" />
                  <ProgressStat label="Hard" value={problemStats.solved.hard} total={problemStats.total.hard} colorClass="bg-rose-400" />
                </div>
              </div>

              <NavLink to="/wishlist" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground transition-colors hover:bg-white/10">
                <Bookmark size={16} /> Favorite Problems
              </NavLink>

            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-muted-foreground" /></div>
                <input type="text" placeholder="Search questions..." value={filters.searchQuery} onChange={(e) => handleFilterChange('searchQuery', e.target.value)} className="w-full rounded-lg border bg-[--input-background] py-2 pl-10 pr-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from" />
              </div>
              <div className="relative">
                <button onClick={() => setIsFilterOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5">
                  <Filter size={16} /> Filters
                </button>
                {isFilterOpen && (
                  <div ref={filterRef} className="absolute top-full right-0 mt-2 w-72 bg-card border border-white/10 rounded-lg shadow-2xl p-4 z-20 animate-in fade-in-0 zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-foreground">Filter Problems</h4>
                      <button onClick={() => setIsFilterOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18}/></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                        <select value={filters.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)} className="mt-1 w-full rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover:cursor-pointer">
                          <option value="all">All</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="mt-1 w-full rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover:cursor-pointer">
                          <option value="all">All</option><option value="solved">Solved</option><option value="unsolved">Unsolved</option>
                        </select>
                      </div>
                       <div>
                        <label className="text-sm font-medium text-muted-foreground">Tag</label>
                        <select value={filters.tag} onChange={(e) => handleFilterChange('tag', e.target.value)} className="mt-1 w-full rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover:cursor-pointer">
                          {TOPIC_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-white/5 min-h-[580px]">
             {currentProblems.length > 0 ? (
                currentProblems.map((problem, index) => {
                  const isSolved = solvedProblemIds.has(problem._id);
                  const isInWishlist = wishlist.includes(problem._id);

                  return (
                    <NavLink to={`/problem/${problem._id}`} key={problem._id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/10 ${index > 0 ? 'border-t border-white/5' : ''}`}>
                      <div className="w-[18px] flex-shrink-0">
                        {isSolved ? <CheckCircle size={18} className="text-green-500" /> : <div className="w-[18px]"></div>}
                      </div>
                      <div className="flex-1 min-w-0 font-medium text-foreground truncate">
                        {problem.title}
                      </div>
                      <div className="flex items-center gap-x-6 flex-shrink-0">
                        <span className={`${getDifficultyClass(problem.difficulty)} w-16 text-center`}>{problem.difficulty}</span>
                        <button onClick={(e) => handleToggleWishlist(e, problem._id)} className="text-muted-foreground hover:text-amber-400 transition-colors">
                            <Bookmark size={18} className={`${isInWishlist ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </NavLink>
                  )
                })
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center py-24 px-6 min-h-[480px]"><h3 className="text-xl font-semibold text-foreground">No Problems Found</h3><p className="text-muted-foreground mt-2">Your search and filters did not match any problems.</p></div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"><ArrowLeft size={16} /> Previous</button>
                <span className="text-sm font-medium text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none">Next <ArrowRight size={16} /></button>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="bg-card rounded-lg p-4 sticky top-24 border border-white/10">
              <h3 className="font-semibold text-foreground mb-4">Trending Companies</h3>
              <div className="flex flex-wrap gap-3">
                {COMPANY_TAGS.map(company => (<NavLink to={company.link} key={company.name} className="flex items-center gap-2 rounded-full bg-[var(--input-background)] py-1.5 px-3 transition-colors hover:bg-white/10"><span className="text-sm font-medium text-foreground">{company.name}</span><span className="text-xs font-semibold text-black bg-[var(--accent-gold)] rounded-full px-1.5 py-0.5">{company.count}</span></NavLink>))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Homepage;




// import { useEffect, useState, useMemo } from 'react';
// import { NavLink } from 'react-router';
// import { useSelector } from 'react-redux';
// import axiosClient from '../utils/axiosClient';
// import { CheckCircle, Search, ArrowLeft, ArrowRight, Bookmark, Award, Star } from 'lucide-react';
// import Navbar from '../components/navbar/Navbar';
// import Loader from '../components/loader/Loader';

// // Theme-aware helper function for difficulty text color
// const getDifficultyClass = (difficulty) => {
//   const baseClass = "font-semibold capitalize";
//   switch (difficulty?.toLowerCase()) {
//     case 'easy': return `${baseClass} text-teal-400`;
//     case 'medium': return `${baseClass} text-amber-400`;
//     case 'hard': return `${baseClass} text-rose-400`;
//     default: return `${baseClass} text-muted-foreground`;
//   }
// };

// // Expanded mock data for UI elements
// const TOPIC_TAGS = ["All Tags", "Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search"];
// const COMPANY_TAGS = [
//   { name: 'Amazon', count: 1855, link: '/company/amazon' },
//   { name: 'Google', count: 2032, link: '/company/google' },
//   { name: 'Meta', count: 1234, link: '/company/meta' },
//   { name: 'Microsoft', count: 1578, link: '/company/microsoft' },
//   // ... more companies
// ];

// // Helper component for progress bars
// const ProgressStat = ({ label, value, total, colorClass }) => (
//   <div>
//     <div className="flex justify-between items-baseline mb-1">
//       <span className="text-sm font-medium text-foreground">{label}</span>
//       <span className="text-xs font-semibold text-muted-foreground">{value} / {total}</span>
//     </div>
//     <div className="w-full bg-white/10 rounded-full h-2">
//       <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div>
//     </div>
//   </div>
// );

// function Homepage() {
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [wishlist, setWishlist] = useState([]); // State for wishlist
  
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'All Tags', // Changed to match the new filter
//     status: 'all',
//     searchQuery: ''
//   });

//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const problemsPerPage = 10;

//   useEffect(() => {
//     // Initialize wishlist from user object if it exists
//     if (user?.wishlist) {
//       setWishlist(user.wishlist);
//     }
//   }, [user]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const [problemsRes, solvedRes] = await Promise.all([
//           axiosClient.get('/problem/getAllProblems'),
//           user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: { problemSolved: [] } })
//         ]);
//         setProblems(problemsRes.data || []);
//         setSolvedProblems(solvedRes.data.problemSolved || []);
//       } catch (error) { 
//         console.error('Error fetching data:', error);
//         setProblems([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [user]);

//   // Function to handle toggling wishlist status
//   const handleToggleWishlist = async (e, problemId) => {
//     e.preventDefault(); 
//     if (!user) {
//         console.log("Please log in to add to wishlist");
//         return;
//     }
    
//     // Optimistic UI update
//     const isInWishlist = wishlist.includes(problemId);
//     if (isInWishlist) {
//         setWishlist(current => current.filter(id => id !== problemId));
//     } else {
//         setWishlist(current => [...current, problemId]);
//     }

//     try {
//       await axiosClient.post('/user/wishlist/toggle', {problemId: problemId});
//     } catch (error) {
//         console.error('Failed to update wishlist:', error);
//         // Revert UI on error
//         if (isInWishlist) {
//             setWishlist(current => [...current, problemId]);
//         } else {
//             setWishlist(current => current.filter(id => id !== problemId));
//         }
//     }
//   };

//   const filteredProblems = useMemo(() => problems?.filter(problem => {
//     const searchMatch = problem.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
//     const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
//     const tagMatch = filters.tag === 'All Tags' || problem.tags.includes(filters.tag);
//     const isSolved = solvedProblems?.some(sp => sp._id === problem._id);
//     const statusMatch =
//       filters.status === 'all' ||
//       (filters.status === 'solved' && isSolved) ||
//       (filters.status === 'unsolved' && !isSolved);
//     return searchMatch && difficultyMatch && tagMatch && statusMatch;
//   }), [problems, filters, solvedProblems]);

//   const problemStats = useMemo(() => {
//     const total = { easy: 0, medium: 0, hard: 0 };
//     const solved = { easy: 0, medium: 0, hard: 0 };

//     problems.forEach(p => {
//         total[p.difficulty?.toLowerCase()]++;
//     });
//     solvedProblems.forEach(p => {
//         solved[p.difficulty?.toLowerCase()]++;
//     });
//     return { total, solved };
//   }, [problems, solvedProblems]);

//   const indexOfLastProblem = currentPage * problemsPerPage;
//   const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
//   const currentProblems = filteredProblems?.slice(indexOfFirstProblem, indexOfLastProblem);
//   const totalPages = Math.ceil(filteredProblems?.length / problemsPerPage);

//   const paginate = (pageNumber) => {
//     if (pageNumber < 1 || pageNumber > totalPages) return;
//     setCurrentPage(pageNumber);
//   };

//   if (isLoading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen">
//       <Navbar />
//       <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
//           {/* LEFT SIDEBAR */}
//           <aside className="lg:col-span-3">
//             <div className="bg-card rounded-lg p-4 sticky top-24 border border-white/10">
//               <h3 className="font-semibold text-foreground mb-4">Your Progress</h3>
//               <div className="space-y-4">
//                 <ProgressStat label="Easy" value={problemStats.solved.easy} total={problemStats.total.easy} colorClass="bg-teal-400" />
//                 <ProgressStat label="Medium" value={problemStats.solved.medium} total={problemStats.total.medium} colorClass="bg-amber-400" />
//                 <ProgressStat label="Hard" value={problemStats.solved.hard} total={problemStats.total.hard} colorClass="bg-rose-400" />
//               </div>

//               <NavLink to="/wishlist" className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground transition-colors hover:bg-white/10">
//                 <Star size={16} /> My Wishlist
//               </NavLink>

//               <div className="my-4 border-t border-white/10"></div>
              
//               <h3 className="font-semibold text-foreground mb-4">Achievements</h3>
//               <div className="flex flex-wrap gap-3">
//                 <div className="flex flex-col items-center text-center p-2 rounded-md bg-white/5 w-20">
//                   <Award size={24} className="text-amber-400" />
//                   <span className="text-xs mt-1 text-muted-foreground">Initiate</span>
//                 </div>
//                 {/* Add more placeholder badges */}
//                 <div className="flex flex-col items-center text-center p-2 rounded-md bg-white/5 w-20 opacity-40">
//                   <Award size={24} className="text-slate-400" />
//                   <span className="text-xs mt-1 text-muted-foreground">Array Pro</span>
//                 </div>
//                  <div className="flex flex-col items-center text-center p-2 rounded-md bg-white/5 w-20 opacity-40">
//                   <Award size={24} className="text-slate-400" />
//                   <span className="text-xs mt-1 text-muted-foreground">10 Day Streak</span>
//                 </div>
//               </div>
//             </div>
//           </aside>

//           {/* MAIN CONTENT */}
//           <div className="lg:col-span-6">
//             <div className="flex flex-col md:flex-row gap-2 mb-4">
//               <div className="relative flex-grow">
//                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-muted-foreground" /></div>
//                 <input type="text" placeholder="Search questions" value={filters.searchQuery} onChange={(e) => setFilters({...filters, searchQuery: e.target.value, currentPage: 1})} className="w-full rounded-lg border bg-[--input-background] py-2 pl-10 pr-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from" />
//               </div>
//               <select className="w-full md:w-auto rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover:cursor-pointer" value={filters.difficulty} onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setCurrentPage(1); }}><option value="all">All Difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
//               <select className="w-full md:w-auto rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover:cursor-pointer" value={filters.tag} onChange={(e) => { setFilters({ ...filters, tag: e.target.value }); setCurrentPage(1); }}>
//                 {TOPIC_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
//               </select>
//               <select className="w-full md:w-auto rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover:cursor-pointer" value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}><option value="all">All Status</option><option value="solved">Solved</option><option value="unsolved">Unsolved</option></select>
//             </div>
            
//             <div className="bg-card rounded-lg border border-white/5 min-h-[500px]">
//              {currentProblems.length > 0 ? (
//                 currentProblems.map((problem, index) => {
//                   const isSolved = solvedProblems?.some(sp => sp._id === problem._id);
//                   const isInWishlist = wishlist.includes(problem._id);

//                   return (
//                     <NavLink to={`/problem/${problem._id}`} key={problem._id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/10 ${index > 0 ? 'border-t border-white/5' : ''}`}>
//                       <div className="w-[18px] flex-shrink-0">
//                         {isSolved ? <CheckCircle size={18} className="text-primary-to" /> : <div className="w-[18px]"></div>}
//                       </div>
//                       <div className="flex-1 min-w-0 font-medium text-foreground truncate">
//                         {indexOfFirstProblem + index + 1}. {problem.title}
//                       </div>
//                       <div className="flex items-center gap-x-6 flex-shrink-0">
//                         <span className={`${getDifficultyClass(problem.difficulty)} w-16 text-center`}>{problem.difficulty}</span>
//                         <button onClick={(e) => handleToggleWishlist(e, problem._id)} className="text-muted-foreground hover:text-amber-400 transition-colors">
//                             <Bookmark size={18} className={`${isInWishlist ? 'fill-amber-400 text-amber-400' : ''}`} />
//                         </button>
//                       </div>
//                     </NavLink>
//                   )
//                 })
//               ) : (
//                 <div className="flex flex-col justify-center items-center h-full text-center py-24 px-6 min-h-[480px]"><h3 className="text-xl font-semibold text-foreground">No Problems Found</h3><p className="text-muted-foreground mt-2">Your search and filters did not match any problems.</p></div>
//               )}
//             </div>

//             {totalPages > 1 && !isLoading && (
//               <div className="mt-6 flex items-center justify-between">
//                 <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"><ArrowLeft size={16} /> Previous</button>
//                 <span className="text-sm font-medium text-muted-foreground">Page {currentPage} of {totalPages}</span>
//                 <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none">Next <ArrowRight size={16} /></button>
//               </div>
//             )}
//           </div>

//           {/* RIGHT SIDEBAR */}
//           <aside className="lg:col-span-3">
//             <div className="bg-card rounded-lg p-4 sticky top-24 border border-white/10">
//               <h3 className="font-semibold text-foreground mb-4">Trending Companies</h3>
//               <div className="flex flex-wrap gap-3">
//                 {COMPANY_TAGS.map(company => (<NavLink to={company.link} key={company.name} className="flex items-center gap-2 rounded-full bg-[var(--input-background)] py-1.5 px-3 transition-colors hover:bg-white/10"><span className="text-sm font-medium text-foreground">{company.name}</span><span className="text-xs font-semibold text-black bg-[var(--accent-gold)] rounded-full px-1.5 py-0.5">{company.count}</span></NavLink>))}
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Homepage;




// import { useEffect, useState, useRef } from 'react';
// import { NavLink, useNavigate } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import axiosClient from '../utils/axiosClient';
// import { logoutUser } from '../authSlice';
// import { CheckCircle, ChevronDown, LogOut, Settings, User as UserIcon, ArrowLeft, ArrowRight, Search } from 'lucide-react';
// import Navbar from '../components/navbar/Navbar';
// import Loader from '../components/loader/Loader';

// // Theme-aware helper function for difficulty text color
// const getDifficultyClass = (difficulty) => {
//   const baseClass = "font-semibold capitalize";
//   switch (difficulty?.toLowerCase()) {
//     case 'easy': return `${baseClass} text-teal-400`;
//     case 'medium': return `${baseClass} text-amber-400`;
//     case 'hard': return `${baseClass} text-rose-400`;
//     default: return `${baseClass} text-muted-foreground`;
//   }
// };

// // Expanded mock data for UI elements
// const TOPIC_TAGS = ["Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search"];
// const COMPANY_TAGS = [
//   { name: 'Amazon', count: 1855, link: '/company/amazon' },
//   { name: 'Google', count: 2032, link: '/company/google' },
//   { name: 'Meta', count: 1234, link: '/company/meta' },
//   { name: 'Microsoft', count: 1578, link: '/company/microsoft' },
//   { name: 'Apple', count: 987, link: '/company/apple' },
//   { name: 'Uber', count: 535, link: '/company/uber' },
//   { name: 'Bloomberg', count: 812, link: '/company/bloomberg' },
//   { name: 'Adobe', count: 456, link: '/company/adobe' },
//   { name: 'Netflix', count: 321, link: '/company/netflix' },
//   { name: 'Oracle', count: 678, link: '/company/oracle' },
// ];


// function Homepage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all',
//     searchQuery: ''
//   });

//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const problemsPerPage = 10;
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const fetchProblems = async () => {
//       setIsLoading(true);
//       try {
//         const { data } = await axiosClient.get('/problem/getAllProblems');
//         setProblems(data);
//       } catch (error) { 
//         console.error('Error fetching problems:', error);
//         setProblems([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     const fetchSolvedProblems = async () => {
//       if (!user) return;
//       try {
//         const { data } = await axiosClient.get('/problem/problemSolvedByUser');
//         setSolvedProblems(data.problemSolved);
//       } catch (error) { console.error('Error fetching solved problems:', error); }
//     };
//     fetchProblems();
//     fetchSolvedProblems();
//   }, [user]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [dropdownRef]);

//   const handleTopicClick = (clickedTag) => {
//     setFilters(prevFilters => ({
//       ...prevFilters,
//       tag: prevFilters.tag === clickedTag ? 'all' : clickedTag
//     }));
//     setCurrentPage(1);
//   };



//   const filteredProblems = problems?.filter(problem => {
//     const searchMatch = problem.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
//     const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
//     const tagMatch = filters.tag === 'all' || problem.tags.includes(filters.tag);
//     const isSolved = solvedProblems?.some(sp => sp._id === problem._id);
//     const statusMatch =
//       filters.status === 'all' ||
//       (filters.status === 'solved' && isSolved) ||
//       (filters.status === 'unsolved' && !isSolved);
//     return searchMatch && difficultyMatch && tagMatch && statusMatch;
//   });

//   const indexOfLastProblem = currentPage * problemsPerPage;
//   const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
//   const currentProblems = filteredProblems?.slice(indexOfFirstProblem, indexOfLastProblem);
//   const totalPages = Math.ceil(filteredProblems?.length / problemsPerPage);

//   const paginate = (pageNumber) => {
//     if (pageNumber < 1 || pageNumber > totalPages) return;
//     setCurrentPage(pageNumber);
//   };

//   if(isLoading)
//   {
//     return <Loader></Loader>
//   }

//   return (
//     <div className="min-h-screen">
//       {/* NAVBAR */}
//       {/* <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
//           <NavLink to="/" className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">CodeVerse</NavLink>
//           <NavLink to="/contest/ContestListPage" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">Contest</NavLink>
//           <div className="relative" ref={dropdownRef}>
//             <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 rounded-full transition-colors hover:bg-white/10 p-1 pr-3 hover: cursor-pointer">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-from to-primary-to flex items-center justify-center"><UserIcon className="w-5 h-5 text-white" /></div>
//               <span className="font-semibold text-foreground hidden sm:block">{user?.firstName || 'Guest'}</span>
//               <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//             </button>
//             {isDropdownOpen && (
//               <ul className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-2xl py-1 transition-all duration-300 animate-in fade-in-0 zoom-in-95">
//                 <li><NavLink to="/profilePage" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5"><UserIcon size={14} /> Profile</NavLink></li>
//                 {user?.role === 'admin' && (<li><NavLink to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5"><Settings size={14} /> Admin Panel</NavLink></li>)}
//                 <div className="my-1 border-t border-white/10"></div>
//                 <li><button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"><LogOut size={14} /> Logout</button></li>
//               </ul>
//             )}
//           </div>
//         </div>
//       </nav> */}

//       <Navbar></Navbar>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
//             {TOPIC_TAGS.map(tag => (<button key={tag} onClick={() => handleTopicClick(tag)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.tag === tag ? 'bg-white/30 text-foreground' : 'bg-[var(--input-background)] text-muted-foreground hover:bg-white/10 hover: cursor-pointer '}`}>{tag}</button>))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
//           <div className="lg:col-span-4">
//             <div className="flex flex-col md:flex-row gap-2 mb-4">
//               <div className="relative flex-grow">
//                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-muted-foreground" /></div>
//                 <input type="text" placeholder="Search questions" value={filters.searchQuery} onChange={(e) => setFilters({...filters, searchQuery: e.target.value})} className="w-full rounded-lg border bg-[--input-background] py-2 pl-10 pr-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from" />
//               </div>
//               <select className="w-full md:w-auto rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover: cursor-pointer" value={filters.difficulty} onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setCurrentPage(1); }}><option value="all">All Difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
//               <select className="w-full md:w-auto rounded-lg border bg-[var(--input-background)] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from hover: cursor-pointer" value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}><option value="all">All Status</option><option value="solved">Solved</option><option value="unsolved">Unsolved</option></select>
//             </div>
            
//             <div className="bg-card rounded-lg border border-white/5 min-h-[480px]">
//              {currentProblems.length > 0 ? (
//                 currentProblems.map((problem, index) => {
//                   const problemNumber = indexOfFirstProblem + index + 1;
//                   const isSolved = solvedProblems?.some(sp => sp._id === problem._id);
//                   return (
//                     // **FIX:** Fully responsive row using mobile-first approach
//                     <NavLink to={`/problem/${problem._id}`} key={problem._id} className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 px-4 py-3.5 transition-colors hover:bg-white/10 ${index > 0 ? 'border-t border-white/5' : ''} ${index % 2 !== 0 ? 'bg-white/5' : ''}`}>
//                       {/* Top Part (Mobile) / Left Part (Desktop) */}
//                       <div className="flex items-center gap-4 flex-1 min-w-0">
//                         <div className="w-[18px] flex-shrink-0">
//                           {isSolved && <CheckCircle size={18} className="text-primary-to" />}
//                         </div>
//                         <span className="font-medium text-foreground truncate">{problemNumber}. {problem.title}</span>
//                       </div>
//                       {/* Bottom Part (Mobile) / Right Part (Desktop) */}
//                       <div className="flex items-center gap-x-6 flex-shrink-0 mt-2 md:mt-0 pl-10 md:pl-0">
//                         <span className="text-sm text-muted-foreground w-16 text-center">42.3%</span>
//                         <span className={`${getDifficultyClass(problem.difficulty)} w-16 text-center`}>{problem.difficulty}</span>
//                       </div>
//                     </NavLink>
//                   )
//                 })
//               ) : (
//                 <div className="flex flex-col justify-center items-center h-full text-center py-24 px-6 min-h-[480px]"><h3 className="text-xl font-semibold text-foreground">No Problems Found</h3><p className="text-muted-foreground mt-2">Your search and filters did not match any problems.</p></div>
//               )}
//             </div>

//             {totalPages > 1 && !isLoading && (
//               <div className="mt-6 flex items-center justify-between">
//                 <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none"><ArrowLeft size={16} /> Previous</button>
//                 <span className="text-sm font-medium text-muted-foreground">Page {currentPage} of {totalPages}</span>
//                 <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none">Next <ArrowRight size={16} /></button>
//               </div>
//             )}
//           </div>

//           <aside className="lg:col-span-2 lg:col-start-5">
//             <div className="bg-card rounded-lg p-4 sticky top-24">
//               <h3 className="font-semibold text-foreground mb-4">Trending Companies</h3>
//               <div className="flex flex-wrap gap-3">
//                 {COMPANY_TAGS.map(company => (<NavLink to={company.link} key={company.name} className="flex items-center gap-2 rounded-full bg-[var(--input-background)] py-1.5 px-3 transition-colors hover:bg-white/10"><span className="text-sm font-medium text-foreground">{company.name}</span><span className="text-xs font-semibold text-black bg-[var(--accent-gold)] rounded-full px-1.5 py-0.5">{company.count}</span></NavLink>))}
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Homepage;



// import { useEffect, useState, useRef } from 'react';
// import { NavLink, useNavigate } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';
// import axiosClient from '../utils/axiosClient';
// import { logoutUser } from '../authSlice';
// import { CheckCircle, ChevronDown, LogOut, Settings, User as UserIcon, ArrowLeft, ArrowRight } from 'lucide-react';

// // A new, theme-aware helper function for difficulty badges
// const getDifficultyBadgeClass = (difficulty) => {
//   const baseClass = "px-3 py-1 rounded-full text-xs font-semibold capitalize";
//   switch (difficulty?.toLowerCase()) {
//     case 'easy':
//       return `${baseClass} bg-teal-500/10 text-teal-400`;
//     case 'medium':
//       return `${baseClass} bg-amber-500/10 text-amber-400`;
//     case 'hard':
//       return `${baseClass} bg-rose-500/10 text-rose-400`;
//     default:
//       return `${baseClass} bg-white/5 text-muted-foreground`;
//   }
// };

// function Homepage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all'
//   });

//   // NEW: State for pagination and dropdown
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const problemsPerPage = 5;
//   const dropdownRef = useRef(null);

//   // Effect to fetch data
//   useEffect(() => {
//     const fetchProblems = async () => {
//       try {
//         const { data } = await axiosClient.get('/problem/getAllProblems');
//         setProblems(data);
//       } catch (error) { console.error('Error fetching problems:', error); }
//     };
//     const fetchSolvedProblems = async () => {
//       if (!user) return;
//       try {
//         const { data } = await axiosClient.get('/problem/problemSolvedByUser');
//         setSolvedProblems(data.solvedProblems);
//       } catch (error) { console.error('Error fetching solved problems:', error); }
//     };
//     fetchProblems();
//     fetchSolvedProblems();
//   }, [user]);

//   // Effect to handle closing dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [dropdownRef]);


//   const handleLogout = () => {
//     dispatch(logoutUser());
//     setSolvedProblems([]);
//     navigate('/login');
//   };

//   // FIXED & IMPROVED: Filtering logic
//   const filteredProblems = problems.filter(problem => {
//     const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
//     const tagMatch = filters.tag === 'all' || problem.tags.includes(filters.tag);
//     const isSolved = solvedProblems.some(sp => sp._id === problem._id);
//     const statusMatch =
//       filters.status === 'all' ||
//       (filters.status === 'solved' && isSolved) ||
//       (filters.status === 'unsolved' && !isSolved);
//     return difficultyMatch && tagMatch && statusMatch;
//   });

//   // NEW: Pagination Logic
//   const indexOfLastProblem = currentPage * problemsPerPage;
//   const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
//   const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
//   const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="min-h-screen">
//       {/* NAVBAR with click-to-open dropdown and avatar */}
//       <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-white/10">
//         <div className="container mx-auto flex items-center justify-between p-4">
//           <NavLink to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">
//             CodeVerse
//           </NavLink>
          
//           <div className="relative" ref={dropdownRef}>
//             <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 rounded-full transition-colors hover:bg-white/10 p-1 pr-3">
//               {user?.avatar ? (
//                 <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
//               ) : (
//                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-from to-primary-to flex items-center justify-center">
//                   <UserIcon className="w-5 h-5 text-white" />
//                 </div>
//               )}
//               <span className="font-semibold text-foreground">{user?.firstName || 'Guest'}</span>
//               <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//             </button>
//             {isDropdownOpen && (
//               <ul className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-2xl py-1
//                              transition-all duration-300 animate-in fade-in-0 zoom-in-95">
//                 <li><NavLink to="/profilePage" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5"><UserIcon size={14} /> Profile</NavLink></li>
//                 {user?.role === 'admin' && (
//                   <li><NavLink to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5"><Settings size={14} /> Admin Panel</NavLink></li>
//                 )}
//                 <div className="my-1 border-t border-white/10"></div>
//                 <li><button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"><LogOut size={14} /> Logout</button></li>
//               </ul>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* NEW TWO-COLUMN LAYOUT */}
//       <main className="container mx-auto p-4 sm:p-6 lg:p-8">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
//           {/* Left Column: Filters */}
//           <aside className="lg:col-span-3 space-y-6">
//             <div className="bg-card border border-white/5 rounded-lg p-4">
//               <h3 className="font-semibold text-foreground mb-4">Filters</h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Status</label>
//                   <select className="mt-1 w-full rounded-lg border bg-[--input-background] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from" value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}>
//                     <option value="all">All Status</option>
//                     <option value="solved">Solved</option>
//                     <option value="unsolved">Unsolved</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
//                   <select className="mt-1 w-full rounded-lg border bg-[--input-background] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from" value={filters.difficulty} onChange={(e) => { setFilters({ ...filters, difficulty: e.target.value }); setCurrentPage(1); }}>
//                     <option value="all">All Difficulties</option>
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="hard">Hard</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Tag</label>
//                   <select className="mt-1 w-full rounded-lg border bg-[--input-background] py-2 px-3 text-foreground border-[--border] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from" value={filters.tag} onChange={(e) => { setFilters({ ...filters, tag: e.target.value }); setCurrentPage(1); }}>
//                     <option value="all">All Tags</option>
//                     <option value="Array">Array</option>
//                     <option value="LinkedList">Linked List</option>
//                     <option value="Graph">Graph</option>
//                     <option value="DP">DP</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </aside>

//           {/* Right Column: Problem List & Pagination */}
//           <div className="lg:col-span-9">
//             <div className="bg-card border border-white/5 rounded-lg">
//               {currentProblems.length > 0 ? (
//                 currentProblems.map((problem, index) => (
//                   <div key={problem._id} className={`p-4 ${index > 0 ? 'border-t border-white/10' : ''}`}>
//                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                       <NavLink to={`/problem/${problem._id}`} className="flex-1 group">
//                         <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary-from">
//                           {problem.title}
//                         </h2>
//                       </NavLink>
//                       <div className="flex items-center gap-3 flex-shrink-0">
//                         {solvedProblems.some(sp => sp._id === problem._id) && (
//                           <div className="flex items-center gap-1.5 text-sm font-medium text-primary-to">
//                             <CheckCircle size={16} />
//                             Solved
//                           </div>
//                         )}
//                         <div className={getDifficultyBadgeClass(problem.difficulty)}>
//                           {problem.difficulty}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-24 px-6">
//                   <h3 className="text-xl font-semibold text-foreground">No Problems Found</h3>
//                   <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
//                 </div>
//               )}
//             </div>
//             {/* PAGINATION CONTROLS */}
//             {totalPages > 1 && (
//               <div className="mt-6 flex items-center justify-between">
//                 <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none">
//                   <ArrowLeft size={16} /> Previous
//                 </button>
//                 <span className="text-sm font-medium text-muted-foreground">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground transition-colors hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none">
//                   Next <ArrowRight size={16} />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Homepage;



// import { useEffect, useState } from 'react';
// import { NavLink } from 'react-router'; // Fixed import
// import { useDispatch, useSelector } from 'react-redux';
// import axiosClient from '../utils/axiosClient';
// import { logoutUser } from '../authSlice';


// // NEW: A custom styled select component to replace the default one
// const ThemedSelect = ({ value, onChange, children }) => (
//   <div className="relative">
//     <select
//       value={value}
//       onChange={onChange}
//       className="
//         w-full sm:w-auto appearance-none cursor-pointer
//         bg-dark-surface border border-dark-border text-text-primary text-sm rounded-lg
//         focus:ring-brand-purple focus:border-brand-purple 
//         block py-2.5 px-4 pr-10
//         transition-all duration-200
//       "
//     >
//       {children}
//     </select>
//     {/* NEW: Custom dropdown arrow for a modern look */}
//     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
//       <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//         <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
//       </svg>
//     </div>
//   </div>
// );

// // NEW: A component for the styled badges
// const Badge = ({ children, className }) => (
//   <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
//     {children}
//   </span>
// );


// function Homepage() {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all' 
//   });

//   useEffect(() => {
//     const fetchProblems = async () => {
//       try {
//         const { data } = await axiosClient.get('/problem/getAllProblems');
//         setProblems(data);
//       } catch (error) {
//         console.error('Error fetching problems:', error);
//       }
//     };

//     const fetchSolvedProblems = async () => {
//       try {
//         const { data } = await axiosClient.get('/problem/problemSolvedByUser');
//         setSolvedProblems(data.solvedProblems);
//       } catch (error) {
//         console.error('Error fetching solved problems:', error);
//       }
//     };

//     fetchProblems();
//     if (user) fetchSolvedProblems();
//   }, [user]);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     setSolvedProblems([]); // Clear solved problems on logout
//   };

//   const filteredProblems = problems.filter(problem => {
//     const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
//     const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
//     const statusMatch = filters.status === 'all' || solvedProblems.some(sp => sp._id === problem._id);
//     return difficultyMatch && tagMatch && statusMatch;
//   });

//   return (
//     // Set the data-theme attribute here to apply "aurora" to the entire page
//     <div data-theme="aurora" className="min-h-screen">
//       {/* 
//         REFACTORED: Navbar using DaisyUI classes. 
//         `bg-base-200` is our slightly lighter dark color from the theme.
//         The /80 gives it a semi-transparent "glass" effect.
//       */}
//       <nav className="navbar bg-base-200/80 backdrop-blur-lg border-b border-neutral sticky top-0 z-50">
//         <div className="flex-1">
//           <NavLink to="/" className="btn btn-ghost text-2xl font-bold hover:bg-transparent hover:text-primary">
//             CodeVerse
//           </NavLink>
//         </div>
//         <div className="flex-none gap-2">
//           {/* REFACTORED: User menu using the DaisyUI dropdown component */}
//           <div className="dropdown dropdown-end">
//             <div tabIndex={0} role="button" className="btn btn-ghost">
//               <span className="font-semibold">{user?.firstName || 'Guest'}</span>
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
//             </div>
//             <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-300 rounded-box w-52">
//               <li>
//                 <NavLink to="/profilePage">Profile</NavLink>
//               </li>
//               {user?.role === 'admin' && (
//                 <li>
//                   <NavLink to="/admin">Admin Dashboard</NavLink>
//                 </li>
//               )}
//               <div className="divider my-1"></div>
//               <li>
//                 <button onClick={handleLogout} className="text-error">
//                   Logout
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="container mx-auto p-4 sm:p-6 lg:p-8">
//         {/* REFACTORED: Filters using DaisyUI `select` classes */}
//         <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-8">
//           <select className="select select-bordered w-full sm:w-auto" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
//             <option value="all">All Status</option>
//             <option value="solved">Solved</option>
//             <option value="unsolved">Unsolved</option>
//           </select>

//           <select className="select select-bordered w-full sm:w-auto" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
//             <option value="all">All Difficulties</option>
//             <option value="easy">Easy</option>
//             <option value="medium">Medium</option>
//             <option value="hard">Hard</option>
//           </select>

//           <select className="select select-bordered w-full sm:w-auto" value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}>
//             <option value="all">All Tags</option>
//             <option value="array">Array</option>
//             <option value="linkedList">Linked List</option>
//             <option value="graph">Graph</option>
//             <option value="dp">DP</option>
//           </select>
//         </div>

//         {/* REFACTORED: Problems list using DaisyUI `card` and `badge` */}
//         <div className="space-y-4">
//           {filteredProblems.length > 0 ? (
//             filteredProblems.map(problem => (
//               // Using `card` for the container. `bg-base-200` for a subtle lift.
//               <div key={problem._id} className="card card-compact bg-base-200 shadow-md transition-all duration-300 hover:shadow-primary/20 hover:border-primary border-transparent border">
//                 <div className="card-body flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                   {/* Problem Title */}
//                   <NavLink to={`/problem/${problem._id}`} className="flex-1">
//                     <h2 className="card-title text-xl transition-colors hover:text-primary">
//                       {problem.title}
//                     </h2>
//                   </NavLink>
                  
//                   {/* Status and Badges */}
//                   <div className="flex items-center gap-3 flex-shrink-0">
//                     {solvedProblems.some(sp => sp._id === problem._id) && (
//                       // `badge-info` uses a nice blue/cyan from our theme. `badge-outline` makes it subtle.
//                       <div className="badge badge-info badge-outline gap-1.5 py-3">
//                         <FaCheckCircle />
//                         Solved
//                       </div>
//                     )}
//                     {/* Using the updated function to get DaisyUI badge classes */}
//                     <div className={getDifficultyBadgeClass(problem.difficulty)}>
//                       {problem.difficulty}
//                     </div>
//                     {/* `badge-neutral` is a great choice for secondary info */}
//                     <div className="badge badge-neutral badge-outline py-3">
//                       {problem.tags}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//              // REFACTORED: Empty state message using theme colors
//              <div className="text-center py-16 px-6 bg-base-200 rounded-box border border-dashed border-neutral">
//                 <h3 className="text-xl font-semibold">No Problems Found</h3>
//                 <p className="text-base-content/70 mt-2">Try adjusting your filters to find what you're looking for.</p>
//              </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// const getDifficultyBadgeClass = (difficulty) => {
//   switch (difficulty?.toLowerCase()) {
//     case 'easy':
//       return 'bg-green-500/20 text-green-400';
//     case 'medium':
//       return 'bg-yellow-500/20 text-yellow-400';
//     case 'hard':
//       return 'bg-red-500/20 text-red-400';
//     default:
//       return 'bg-dark-border text-text-secondary';
//   }
// };

// export default Homepage;

// REFACTORED: This function now returns DaisyUI badge classes
// const getDifficultyBadgeClass = (difficulty) => {
//   const baseClass = "badge badge-outline py-3"; // Common classes for all badges
//   switch (difficulty?.toLowerCase()) {
//     case 'easy':
//       // `badge-success` will be green in our theme
//       return `${baseClass} badge-success`;
//     case 'medium':
//       // `badge-warning` will be yellow
//       return `${baseClass} badge-warning`;
//     case 'hard':
//       // `badge-error` will be red
//       return `${baseClass} badge-error`;
//     default:
//       // `badge-ghost` is a very subtle default
//       return `${baseClass} badge-ghost`;
//   }
// }

// const getDifficultyBadgeColor = (difficulty) => {
//   switch (difficulty.toLowerCase()) {
//     case 'easy': return 'badge-success';
//     case 'medium': return 'badge-warning';
//     case 'hard': return 'badge-error';
//     default: return 'badge-neutral';
//   }
// };

// return (
//     <div className="min-h-screen bg-base-200">
//       {/* Navigation Bar */}
//       <nav className="navbar bg-base-100 shadow-lg px-4">
//         <div className="flex-1">
//           <NavLink to="/" className="btn btn-ghost text-xl">CodeVerse</NavLink>
//         </div>
//         <div className="flex-none gap-4">
//           <div className="dropdown dropdown-end">
//             <div tabIndex={0} className="btn btn-ghost">
//               {user?.firstName}

//             </div>
//             <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              
//               {/* Profile Link - This is the new addition */}
//               <li><NavLink to="/profilePage">Profile</NavLink></li>
              
//               {/* Admin Link (Conditional) */}
//               {user?.role === 'admin' && (
//                 <li><NavLink to="/admin">Admin Dashboard</NavLink></li>
//               )}
              
//               <div className="divider my-1"></div> {/* Optional: Adds a visual separator */}
              
//               {/* Logout Button */}
//               <li><button onClick={handleLogout}>Logout</button></li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="container mx-auto p-4">
//         {/* Filters */}
//         <div className="flex flex-wrap gap-4 mb-6">
//           {/* New Status Filter */}
//           <select 
//             className="select select-bordered"
//             value={filters.status}
//             onChange={(e) => setFilters({...filters, status: e.target.value})}
//           >
//             <option value="all">All Problems</option>
//             <option value="solved">Solved Problems</option>
//           </select>

//           <select 
//             className="select select-bordered"
//             value={filters.difficulty}
//             onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
//           >
//             <option value="all">All Difficulties</option>
//             <option value="easy">Easy</option>
//             <option value="medium">Medium</option>
//             <option value="hard">Hard</option>
//           </select>

//           <select 
//             className="select select-bordered"
//             value={filters.tag}
//             onChange={(e) => setFilters({...filters, tag: e.target.value})}
//           >
//             <option value="all">All Tags</option>
//             <option value="array">Array</option>
//             <option value="linkedList">Linked List</option>
//             <option value="graph">Graph</option>
//             <option value="dp">DP</option>
//           </select>
//         </div>

//         {/* Problems List */}
//         <div className="grid gap-4">
//           {filteredProblems.map(problem => (
//             <div key={problem._id} className="card bg-base-100 shadow-xl">
//               <div className="card-body">
//                 <div className="flex items-center justify-between">
//                   <h2 className="card-title">
//                     <NavLink to={`/problem/${problem._id}`} className="hover:text-primary">
//                       {problem.title}
//                     </NavLink>
//                   </h2>
//                   {solvedProblems.some(sp => sp._id === problem._id) && (
//                     <div className="badge badge-success gap-2">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                       Solved
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="flex gap-2">
//                   <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
//                     {problem.difficulty}
//                   </div>
//                   <div className="badge badge-info">
//                     {problem.tags}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );