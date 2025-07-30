import { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosClient';
import { NavLink } from 'react-router';
import { Upload, Search, Filter} from 'lucide-react';
import PaginationControls from '../../components/PaginationControls';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const problemsPerPage = 10;

  // Available tags and difficulties
  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const tags = ['all', 'array', 'dp', 'linked list', 'graph', 'tree'];

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblems');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter problems based on search and filters
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = searchQuery === '' || 
      problem?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      problem?.description?.toLowerCase()?.includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || 
      problem?.difficulty?.toLowerCase() === difficultyFilter;
    
    const matchesTag = tagFilter === 'all' || 
      problem?.tags?.toLowerCase() === tagFilter;
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  

  // Difficulty badge styling
  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'hard': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Get current problems for pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  // Pagination controls
  // const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  // const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gradient-to-r from-[#402a39] to-[#3b2d45] rounded-xl border border-[#5e5a66] shadow-lg my-4">
        <div className="flex items-center p-4 text-red-400 bg-[#2d2a32] rounded-lg border border-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="ml-2">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text py-3">
          Video Solution Management
        </h1>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="text-[#928da0]" size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#403c46] border border-[#5e5a66] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-[#928da0]"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="text-[#928da0]" size={18} />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-[#403c46] border border-[#5e5a66] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white appearance-none"
              >
                <option value="all">All Difficulties</option>
                {difficulties.slice(1).map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="pl-4 pr-8 py-2.5 bg-[#403c46] border border-[#5e5a66] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white appearance-none"
              >
                <option value="all">All Tags</option>
                {tags.slice(1).map((tag) => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2d2a32] rounded-xl border border-[#5e5a66] shadow-lg overflow-hidden">
        {currentProblems.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-[#928da0] mb-2">No problems found</div>
            <div className="text-sm text-[#928da0]">Try changing your search or filters</div>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#402a39] to-[#3b2d45] border-b border-[#5e5a66]">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-[#f8f4f9]">#</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-[#f8f4f9]">Title</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-[#f8f4f9]">Difficulty</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-[#f8f4f9]">Tags</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-[#f8f4f9]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5e5a66]/50">
                {currentProblems.map((problem, index) => (
                  <tr key={problem._id} className="hover:bg-[#403c46]/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-[#f8f4f9]">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#f8f4f9] font-medium">{problem.title}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm px-2.5 py-1 rounded-full ${getDifficultyBadgeColor(problem.difficulty)}`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm px-2.5 py-1 rounded-full bg-[#57545a] text-white border border-[#5e5a66]">
                        {problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 w-25">
                      <NavLink 
                        to={`/admin/upload/${problem._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-[#f75eb7] to-[#4a1cf2] text-white hover:from-[#fc2ba5] hover:to-[#922dfd] transition-all"
                      >
                        <Upload size={16} />
                        Upload
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProblems.length}
              itemsPerPage={problemsPerPage}
              onPageChange={setCurrentPage}
            ></PaginationControls>

          </>
        )}
      </div>
    </div>
  );
};

export default AdminVideo;





// import { useEffect, useState } from 'react';
// import axiosClient from '../utils/axiosClient'
// import { NavLink } from 'react-router';

// const AdminVideo = () => {
//   const [problems, setProblems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);


//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const fetchProblems = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axiosClient.get('/problem/getAllProblems');
//       setProblems(data);
//     } catch (err) {
//       setError('Failed to fetch problems');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };


//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-error shadow-lg my-4">
//         <div>
//           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>{error.response.data.error}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Video Solution Upload and Delete</h1>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="table table-zebra w-full">
//           <thead>
//             <tr>
//               <th className="w-1/12">#</th>
//               <th className="w-4/12">Title</th>
//               <th className="w-2/12">Difficulty</th>
//               <th className="w-3/12">Tags</th>
//               <th className="w-2/12">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {problems.map((problem, index) => (
//               <tr key={problem._id}>
//                 <th>{index + 1}</th>
//                 <td>{problem.title}</td>
//                 <td>
//                   <span className={`badge ${
//                     problem.difficulty === 'easy' 
//                       ? 'badge-success ' 
//                       : problem.difficulty === 'medium' 
//                         ? 'badge-warning' 
//                         : 'badge-error'
//                   }`}>
//                     {problem.difficulty}
//                   </span>
//                 </td>
//                 <td>
//                   <span className="badge badge-outline">
//                     {problem.tags}
//                   </span>
//                 </td>
//                 <td>
//                   <div className="flex space-x-2">
//                      <NavLink 
//                         to={`/admin/upload/${problem._id}`}
//                         className={`btn bg-blue-300 text-gray-800`}>
//                         Upload
//                       </NavLink>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminVideo;