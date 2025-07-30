// components/SubmissionHistory.js (Completely Refactored)

import { useState } from 'react';
import { Loader2, Code, ServerCrash, Inbox } from 'lucide-react';

const SubmissionHistory = ({ submissions, loading, error }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Helper function to get status colors based on your theme
  const getStatusClasses = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'wrong':
      case 'error':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  const formatMemory = (memory) => {
    if (!memory || memory < 1024) return `${memory || 0} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
  };
  
  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-muted-foreground/80 p-6">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--primary-from)] mb-4" />
        <p className="text-lg font-semibold">Fetching Submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-red-400 p-6 bg-red-500/5 rounded-lg border border-red-500/20">
        <ServerCrash className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">{error}</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0 || submissions === "No Submission") {
    return (
        <div className="flex flex-col justify-center items-center h-full text-muted-foreground/80 p-6 bg-[var(--input-background)] rounded-lg border border-[var(--border)]">
          <Inbox className="h-16 w-16 mb-4" />
          <p className="text-xl font-semibold">No Submissions Found</p>
          <p className="text-sm text-muted-foreground">Submit your code to see your history here.</p>
        </div>
    );
  }

  return (
    <div className="h-full w-full text-foreground flex flex-col">
      <h2 className="text-2xl font-bold mb-6 flex-shrink-0">Submission History</h2>
      
      <div className="flex-grow overflow-x-auto overflow-y-auto hide-scrollbar rounded-lg border border-[var(--border)] bg-[var(--input-background)]/50">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--input-background)] sticky top-0">
            <tr>
              {['Status', 'Language', 'Runtime', 'Memory', 'Submitted', ' '].map((header) => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {submissions.map((sub) => (
              <tr key={sub._id} className="hover:bg-[var(--input-background)] transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(sub.status)}`}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-muted-foreground"><span className='bg-white/10 px-3 py-0.5 pb-1.5 rounded-full items-center ' >
                {sub.language}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-muted-foreground">{sub.runtime || 'N/A'} s</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-normal text-muted-foreground">{formatMemory(sub.memory)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatDate(sub.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setSelectedSubmission(sub)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-foreground/80 bg-transparent border border-[var(--border)] hover:border-primary-from hover:cursor-pointer hover:bg-primary-from/10 hover:text-primary-from transition-all duration-200"
                  >
                    <Code size={16} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-11/12 max-w-4xl max-h-[90vh] flex flex-col bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-2xl">
            <div className="p-6 border-b border-[var(--border)] flex-shrink-0">
                <h3 className="font-bold text-xl text-foreground">
                  Submission Details
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClasses(selectedSubmission.status)}`}>
                        {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                        Runtime: {selectedSubmission.runtime || 'N/A'}s
                    </span>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                        Memory: {formatMemory(selectedSubmission.memory)}
                    </span>
                </div>
                {selectedSubmission.errorMessage && (
                    <div className="mt-4 p-3 rounded-md bg-red-900/50 text-red-300 text-xs font-mono border border-red-500/30">
                        <p className="font-bold mb-1">Error:</p>
                        <p>{selectedSubmission.errorMessage}</p>
                    </div>
                )}
            </div>
            
            <div className="flex-grow p-1 bg-[#1e1e1e] overflow-y-auto">
                 <pre className="p-4 text-sm text-gray-200">
                    <code>{selectedSubmission.code}</code>
                 </pre>
            </div>
            
            <div className="p-4 border-t border-[var(--border)] flex justify-end flex-shrink-0">
              <button 
                className="px-4 py-2 rounded-lg text-sm hover:cursor-pointer font-semibold bg-[var(--input-background)] hover:bg-[var(--border)] transition-colors"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;



// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosClient';
// import { Loader } from 'lucide-react';

// const SubmissionHistory = ({ problemId }) => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);

//   console.log(submissions) ;

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         setLoading(true);
//         const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//         setSubmissions(response.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch submission history');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, [problemId]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'accepted': return 'badge-success';
//       case 'wrong': return 'badge-error';
//       case 'error': return 'badge-warning';
//       case 'pending': return 'badge-info';
//       default: return 'badge-neutral';
//     }
//   };

//   const formatMemory = (memory) => {
//     if (memory < 1024) return `${memory} kB`;
//     return `${(memory / 1024).toFixed(2)} MB`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
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
//       <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>
      
//       {submissions === "No Submission" ? (
//         <div className="alert alert-info shadow-lg h-50 flex justify-center items-center">
//           <div className='h-full w-full'>
//             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex h-20 w-20 " fill="none" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <span>No submissions found for this problem</span>
//           </div>
//         </div>
       
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="table table-zebra w-full">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Language</th>
//                   <th>Status</th>
//                   <th>Runtime</th>
//                   <th>Memory</th>
//                   <th>Test Cases</th>
//                   <th>Submitted</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissions.map((sub, index) => (
//                   <tr key={sub._id}>
//                     <td>{index + 1}</td>
//                     <td className="font-mono">{sub.language}</td>
//                     <td>
//                       <span className={`badge ${getStatusColor(sub.status)}`}>
//                         {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
//                       </span>
//                     </td>
                    
//                     <td className="font-mono">{sub.runtime}sec</td>
//                     <td className="font-mono">{formatMemory(sub.memory)}</td>
//                     <td className="font-mono">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
//                     <td>{formatDate(sub.createdAt)}</td>
//                     <td>
//                       <button 
//                         className="btn btn-s btn-outline"
//                         onClick={() => setSelectedSubmission(sub)}
//                       >
//                         Code
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <p className="mt-4 text-sm text-gray-500">
//             Showing {submissions.length} submissions
//           </p>
//         </>
//       )}

//       {/* Code View Modal */}
//       {selectedSubmission && (
//         <div className="modal modal-open">
//           <div className="modal-box w-11/12 max-w-5xl">
//             <h3 className="font-bold text-lg mb-4">
//               Submission Details: {selectedSubmission.language}
//             </h3>
            
//             <div className="mb-4">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
//                   {selectedSubmission.status}
//                 </span>
//                 <span className="badge badge-outline">
//                   Runtime: {selectedSubmission.runtime}s
//                 </span>
//                 <span className="badge badge-outline">
//                   Memory: {formatMemory(selectedSubmission.memory)}
//                 </span>
//                 <span className="badge badge-outline">
//                   Passed: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
//                 </span>
//               </div>
              
//               {selectedSubmission.errorMessage && (
//                 <div className="alert alert-error mt-2">
//                   <div>
//                     <span>{selectedSubmission.errorMessage}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
//               <code>{selectedSubmission.code}</code>
//             </pre>
            
//             <div className="modal-action">
//               <button 
//                 className="btn"
//                 onClick={() => setSelectedSubmission(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubmissionHistory;