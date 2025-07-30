import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';
import { logoutUser } from '../../authSlice';
import { Edit , CheckCircle , RefreshCwIcon } from 'lucide-react';

// Utility function for difficulty badge colors
const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-600 text-white';
    case 'medium': return 'bg-yellow-600 text-white';
    case 'hard': return 'bg-red-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
};

function AdminUpdate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const problemPromise = axiosClient.get('/problem/getAllProblems');
        const solvedPromise = user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] });

        const [problemRes, solvedRes] = await Promise.all([problemPromise, solvedPromise]);
        setProblems(problemRes.data);
        setSolvedProblems(solvedRes.data || []); // Ensure it's always an array
      } catch (error) {
        console.error('Error fetching data:', error);
        setSolvedProblems([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate('/');
  };

  // FIXED: Use Array.some() instead of filter() for boolean check
  const getProblemStatus = (problemId) => {
    return Array.isArray(solvedProblems.solvedProblems) && solvedProblems.solvedProblems.some(sp => sp._id === problemId);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || (filters.status === 'solved' && getProblemStatus(problem._id));
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen text-[var(--card-foreground)]">
      {/* Navigation Bar with Theme */}
     <nav className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-5 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <NavLink to="/" className="text-4xl font-bold bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text border-none ">CodeVerse</NavLink>
      </div>
  
  <div className="flex items-center space-x-4">
    {/* Create Problem Button - Desktop */}
    {user?.role === 'admin' && (
      <NavLink 
        to="/admin/create" 
        className="hidden md:flex bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] hover:opacity-90 text-[var(--button-text)] px-4 py-2 rounded-lg transition-opacity items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Problem
      </NavLink>
    )}
  </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-start items-center sm:items-center mb-6 gap-4">
          <Edit className='text-pink-300' size={31} ></Edit>
          <h1 className="text-4xl font-bold py-4 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">           
            Manage Problems
          </h1>          
        </div>

        {/* Filters Card */}
        <div className="bg-[var(--card)] rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-[var(--border)]">
          <h3 className="font-semibold text-2xl mb-4 text-[var(--card-foreground)]">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-md font-medium text-[var(--muted-foreground)] mb-1">Status</label>
              <select 
                className="w-full bg-[var(--input-background)] border border-[var(--border)] text-[var(--card-foreground)] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-from)] hover:cursor-pointer"
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-md font-medium text-[var(--muted-foreground)] mb-1">Difficulty</label>
              <select 
                className="w-full bg-[var(--input-background)] border border-[var(--border)] text-[var(--card-foreground)] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-from)] hover:cursor-pointer"
                value={filters.difficulty} 
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-md font-medium text-[var(--muted-foreground)] mb-1">Tag</label>
              <select 
                className="w-full bg-[var(--input-background)] border border-[var(--border)] text-[var(--card-foreground)] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-from)] hover:cursor-pointer "
                value={filters.tag} 
                onChange={(e) => setFilters({...filters, tag: e.target.value})}
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button 
                onClick={() => setFilters({difficulty: 'all', tag: 'all', status: 'all'})}
                className="w-full bg-[var(--input-background)] hover:opacity-90 text-[var(--card-foreground)] px-4 py-2 rounded-lg transition-opacity flex items-center justify-center gap-1 hover:cursor-pointer"
              >
                <RefreshCwIcon size={17} ></RefreshCwIcon>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-[var(--card)] rounded-xl shadow-lg overflow-hidden border border-[var(--border)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-from)]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--input-background)]">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider w-16 text-center">Status</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider w-32">Difficulty</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider w-40">Tag</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider w-24 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredProblems.map(problem => (
                    <tr key={problem._id} className="hover:bg-[var(--input-background)] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {getProblemStatus(problem._id) && (
                          
                          <CheckCircle className='text-green-400' size={30} ></CheckCircle>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <NavLink 
                          to={`/problem/${problem._id}`} 
                          className="hover:text-gray-300 font-medium transition-colors">
                          {problem.title}
                        </NavLink>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1) }
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-gray-500 text-white">
                          {problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <NavLink 
                          to={`/admin/update-problem/${problem._id}`} 
                          className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary-from)] hover:bg-[var(--input-background)] transition-colors"
                          title="Edit Problem"
                        >
                          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg> */}
                          <Edit className='text-white' size={25} ></Edit>
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoading && filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[var(--muted-foreground)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-[var(--muted-foreground)]">No problems found</h3>
              <p className="mt-1 text-[var(--muted-foreground)]">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUpdate;





// import { useEffect, useState } from 'react';
// import { NavLink, useNavigate } from 'react-router'; // Use useNavigate
// import { useDispatch, useSelector } from 'react-redux';
// import axiosClient from '../utils/axiosClient';
// import { logoutUser } from '../authSlice';
// // import { getDifficultyBadgeColor } from '../utils/getDifficultyBadgeColor'; // Let's move this to a utility file

// function AdminUpdate() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate(); // Hook for navigation
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all',
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const problemPromise = axiosClient.get('/problem/getAllProblems');
//         const solvedPromise = user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] });

//         const [problemRes, solvedRes] = await Promise.all([problemPromise, solvedPromise]);
        
//         setProblems(problemRes.data);
//         setSolvedProblems(solvedRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [user]);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     setSolvedProblems([]);
//     navigate('/');
//   };

//   const getProblemStatus = (problemId) => {
//     return solvedProblems.some(sp => sp._id === problemId);
//   };

//   const filteredProblems = problems.filter(problem => {
//     const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
//     const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
//     const statusMatch = filters.status === 'all' || (filters.status === 'solved' && getProblemStatus(problem._id));
//     return difficultyMatch && tagMatch && statusMatch;
//   });

//   // SVG Icon for the Edit button
//   const EditIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
//     </svg>
//   );

//   return (
//     <div className="min-h-screen bg-base-200">
//       {/* Navigation Bar (same as before) */}
//       <nav className="navbar bg-base-100 shadow-lg px-4">
//         <div className="flex-1">
//           <NavLink to="/" className="btn btn-ghost text-xl">LeetCode</NavLink>
//         </div>
//         <div className="flex-none gap-4">
//           <div className="dropdown dropdown-end">
//             <div tabIndex={0} role="button" className="btn btn-ghost">
//               {user?.firstName}
//             </div>
//             <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
//               <li><button onClick={handleLogout}>Logout</button></li>
//               {user?.role === 'admin' && <li><NavLink to="/admin">Admin Problem List</NavLink></li>}
//               {user?.role === 'admin' && <li><NavLink to="/admin/create">Create Problem</NavLink></li>}
//             </ul>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="container mx-auto p-4 lg:p-8">
//         <h1 className="text-3xl font-bold mb-6 text-base-content">Manage Problems</h1>

//         {/* Filters Card */}
//         <div className="card bg-base-100 shadow-md mb-6">
//           <div className="card-body p-4 flex-col lg:flex-row lg:items-center gap-4">
//             <h3 className="font-semibold text-lg flex-shrink-0">Filters:</h3>
//             <select className="select select-bordered w-full lg:w-auto" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
//               <option value="all">All Status</option>
//               <option value="solved">Solved</option>
//             </select>
//             <select className="select select-bordered w-full lg:w-auto" value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
//               <option value="all">All Difficulties</option>
//               <option value="easy">Easy</option>
//               <option value="medium">Medium</option>
//               <option value="hard">Hard</option>
//             </select>
//             <select className="select select-bordered w-full lg:w-auto" value={filters.tag} onChange={(e) => setFilters({...filters, tag: e.target.value})}>
//               <option value="all">All Tags</option>
//               <option value="array">Array</option>
//               <option value="linkedList">Linked List</option>
//               <option value="graph">Graph</option>
//               <option value="dp">DP</option>
//             </select>
//           </div>
//         </div>

//         {/* Problems Table */}
//         <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md">
//           {isLoading ? (
//             <div className="flex justify-center items-center h-64">
//               <span className="loading loading-lg loading-spinner text-primary"></span>
//             </div>
//           ) : (
//             <table className="table table-zebra w-full">
//               {/* head */}
//               <thead className="text-base">
//                 <tr>
//                   <th className="w-1/12 text-center">Status</th>
//                   <th>Title</th>
//                   <th className="w-1/6">Difficulty</th>
//                   <th className="w-1/6">Tag</th>
//                   <th className="w-1/12 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredProblems.map(problem => (
//                   <tr key={problem._id} className="hover">
//                     <td className="text-center">
//                       {getProblemStatus(problem._id) && (
//                         <div className="tooltip" data-tip="Solved">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                           </svg>
//                         </div>
//                       )}
//                     </td>
//                     <td>
//                       <NavLink to={`/problem/${problem._id}`} className="link link-hover link-primary font-semibold">
//                         {problem.title}
//                       </NavLink>
//                     </td>
//                     <td>
//                       <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
//                         {problem.difficulty}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="badge badge-info">{problem.tags}</span>
//                     </td>
//                     <td className="text-center">
//                       <NavLink to={`/admin/update-problem/${problem._id}`} className="btn btn-ghost btn-sm btn-square" aria-label="Edit Problem">
//                          <div className="tooltip" data-tip="Edit">
//                            <EditIcon />
//                          </div>
//                       </NavLink>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminUpdate;


// import { useEffect, useState } from 'react';
// import { NavLink } from 'react-router'; // Fixed import
// import { useDispatch, useSelector } from 'react-redux';
// import axiosClient from '../utils/axiosClient';
// import { logoutUser } from '../authSlice';

// function AdminUpdate() {
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
//         setSolvedProblems(data);
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
//     const statusMatch = filters.status === 'all' || 
//                       solvedProblems.some(sp => sp._id === problem._id);
//     return difficultyMatch && tagMatch && statusMatch;
//   });

//   return (
//     <div className="min-h-screen bg-base-200">
//       {/* Navigation Bar */}
//       <nav className="navbar bg-base-100 shadow-lg px-4">
//         <div className="flex-1">
//           <NavLink to="/" className="btn btn-ghost text-xl">LeetCode</NavLink>
//         </div>
//         <div className="flex-none gap-4">
//           <div className="dropdown dropdown-end">
//             <div tabIndex={0} className="btn btn-ghost">
//               {user?.firstName}
//             </div>
//             <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
//               <li><button onClick={handleLogout}>Logout</button></li>
//               {user.role=='admin'&&<li><NavLink to="/admin">Admin</NavLink></li>}
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
//             <div key={problem._id} className="flex-row card bg-base-100 shadow-xl">
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

//                <div>
//                 Hello
//                </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// const getDifficultyBadgeColor = (difficulty) => {
//   switch (difficulty.toLowerCase()) {
//     case 'easy': return 'badge-success';
//     case 'medium': return 'badge-warning';
//     case 'hard': return 'badge-error';
//     default: return 'badge-neutral';
//   }
// };

// export default AdminUpdate;