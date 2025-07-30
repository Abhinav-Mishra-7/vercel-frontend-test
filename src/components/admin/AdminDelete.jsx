import { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosClient';
import { Search, Filter, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify'; // Make sure to import toast

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 10;
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Available tags and difficulties
  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const tags = ['all', 'array', 'dp', 'linked list', 'graph', 'tree'];

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchQuery, difficultyFilter, tagFilter]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblems');
      setProblems(data);
      setFilteredProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${deleteModal.id}`);
      setProblems(problems.filter(problem => problem._id !== deleteModal.id));
      toast.success('Problem deleted successfully!');
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const filterProblems = () => {
    let result = [...problems];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(problem => 
        problem?.title?.toLowerCase()?.includes(query) ||
        problem?.description?.toLowerCase()?.includes(query)
      );
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(problem => 
        problem?.difficulty?.toLowerCase() === difficultyFilter
      );
    }
    
    // Apply tag filter
    if (tagFilter !== 'all') {
      result = result.filter(problem => 
        problem?.tags?.toLowerCase() === tagFilter
      );
    }
    
    setFilteredProblems(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get current problems for pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Difficulty badge styling
  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'hard': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-gradient-to-r from-[#402a39] to-[#3b2d45] rounded-xl border border-[#5e5a66] shadow-lg my-4">
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
        <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">
          Delete Problems
        </h1>

        {/* Custom Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-0 flex items-center justify-center z-2 p-4">
          <div className="bg-card rounded-xl border border-[#5e5a66] shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">Confirm Deletion</h3>
            <p className="text-[#f8f4f9] mb-6">
              Are you sure you want to delete this problem?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="px-4 py-2 rounded-lg bg-[#403c46] text-[#f8f4f9] border border-[#5e5a66] hover:bg-[#4a4550] transition-colors hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        
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
        {filteredProblems.length === 0 ? (
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
                        {(currentPage - 1) * problemsPerPage + index + 1}
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
                      <td className="py-3 px-4">
                        {/* Change the delete button in table to use openDeleteModal */}
                        <button 
                          onClick={() => openDeleteModal(problem._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r hover:cursor-pointer from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-all"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
    
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#5e5a66]">
              <div className="text-sm text-[#928da0] mb-4 sm:mb-0">
                Showing {Math.min(filteredProblems.length, indexOfFirstProblem + 1)}-
                {Math.min(indexOfLastProblem, filteredProblems.length)} of {filteredProblems.length} problems
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${
                    currentPage === 1 
                      ? 'border-[#5e5a66]/30 text-[#5e5a66] cursor-not-allowed' 
                      : 'border-[#5e5a66] text-[#f8f4f9] hover:bg-[#403c46]'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Calculate page number based on current position
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                          : 'text-[#f8f4f9] hover:bg-[#403c46]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages 
                      ? 'border-[#5e5a66]/30 text-[#5e5a66] cursor-not-allowed' 
                      : 'border-[#5e5a66] text-[#f8f4f9] hover:bg-[#403c46]'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDelete;





// import { useEffect, useState } from 'react';
// import axiosClient from '../utils/axiosClient'

// const AdminDelete = () => {
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

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
//     try {
//       await axiosClient.delete(`/problem/delete/${id}`);
//       setProblems(problems.filter(problem => problem._id !== id));
//     } catch (err) {
//       setError('Failed to delete problem');
//       console.error(err);
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
//           <span>{error}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Delete Problems</h1>
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
//                       ? 'badge-success' 
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
//                     <button 
//                       onClick={() => handleDelete(problem._id)}
//                       className="btn btn-sm btn-error"
//                     >
//                       Delete
//                     </button>
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

// export default AdminDelete;