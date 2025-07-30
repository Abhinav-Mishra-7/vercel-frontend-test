import { Link } from 'react-router';
import { CheckCircleIcon } from 'lucide-react'
import { toast } from 'react-toastify';


export default function ProblemListItem({ problem, index, contestId, isSolved }) {
  return (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${
      isSolved 
        ? 'border-green-500' 
        : 'border-[var(--color-border)] bg-[var(--input-background)]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isSolved ? 'bg-green-500' : 'bg-gray-400'
          }`}>
            {isSolved ? (
              <CheckCircleIcon className="w-5 h-5 text-white" />
            ) : (
              <span className="text-sm">{String.fromCharCode(65 + index)}</span>
            )}
          </div>
          <Link 
            to={`/contest/${contestId}/problem/${problem?._id}`}
            className={`font-medium text-white hover:underline`}
          >
            {problem?.title}  {/* Fixed: Now displays the problem title */}
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          {problem?.difficulty.charAt(0).toUpperCase() + problem?.difficulty.slice(1)}
        </div>
      </div>
    </div>
  );
}




// // export default function ProblemListItem({ problem, index, contestId, isSolved }) {
// //   const difficultyColors = {
// //     Easy: 'text-green-400',
// //     Medium: 'text-yellow-400',
// //     Hard: 'text-red-400'
// //   };

// //   return (
// //     <Link 
// //       to={`/contest/${contestId}/problem/${problem._id}`}
// //       className="block bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition-colors border border-gray-700"
// //     >
// //       <div className="flex items-center justify-between">
// //         <div className="flex items-center gap-4">
// //           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
// //             isSolved ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
// //           }`}>
// //             {/* {String.fromCharCode(65 + index)} */}
// //             <CheckCircle size={20} ></CheckCircle>
// //           </div>
// //           <div>
// //             <h3 className="font-medium text-gray-200">{problem.title}</h3>
// //             <div className="flex items-center gap-3 mt-1">
// //               <span className={`text-sm font-medium ${difficultyColors[problem.difficulty]}`}>
// //                 {problem.difficulty}
// //               </span>
// //               <span className="text-xs text-gray-500">
// //                 {problem.acceptanceRate ? `${problem.acceptanceRate}% Acceptance` : ''}
// //               </span>
// //             </div>
// //           </div>
// //         </div>
        
// //         {isSolved && (
// //           <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
// //             Solved
// //           </div>
// //         )}
// //       </div>
// //     </Link>
// //   );
// // }

// export default function ProblemListItem({ problem, index, contestId, isSolved }) {
//   return (
//     <div className={`p-4 rounded-lg border transition-all duration-300`}>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className={`w-8 h-8 rounded-full flex items-center justify-center`}>
//             {isSolved ? (
//               <CheckCircleIcon className="w-5 h-5 text-green-300 " />
//             ) : (
//               <span className="text-sm">{String.fromCharCode(65 + index)}</span>
//             )}
//           </div>
//           <Link 
//             to={`/contest/${contestId}/problem/${problem._id}`}
//             className={`font-medium ${
//               isSolved ? 'text-green-400' : 'text-[var(--color-foreground)]'
//             } hover:underline`}
//           >
//             {problem.title}
//           </Link>
//         </div>
//         <div className="text-sm text-[var(--muted-foreground)]">
//           {problem.difficulty}
//         </div>
//       </div>
//     </div>
//   );
// }
