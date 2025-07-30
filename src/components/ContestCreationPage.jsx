import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function ContestCreationPage() {
  const [problems, setProblems] = useState([]);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      startTime: new Date(),
      duration: 120
    }
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/getAllProblems');
        setAvailableProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
        toast.error('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleToggleProblem = (problem) => {
    setProblems(prev => {
      const isSelected = prev.some(p => p._id === problem._id);
      if (isSelected) {
        return prev.filter(p => p._id !== problem._id);
      }
      return [...prev, problem];
    });
  };

  const onSubmit = async (formData) => {
    if (problems.length === 0) {
      toast.error('Please select at least one problem');
      return;
    }
    
    try {
      const contestData = {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        duration: Number(formData.duration),
        problems: problems.map(p => p._id),
      };
      
      const { data } = await axiosClient.post('/contest/create', contestData);
      toast.success('Contest created successfully!');
      navigate(`/contest/${data.contest._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create contest.');
      console.error('Contest creation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Create New Contest
        </h1>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 space-y-8 border border-gray-700"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Contest Title
            </label>
            <input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter contest title"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white placeholder-gray-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe your contest..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white placeholder-gray-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Start Time and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Start Time
              </label>
              <Controller
                control={control}
                name="startTime"
                rules={{ required: 'Start time is required' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={date => field.onChange(date)}
                    showTimeSelect
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white"
                  />
                )}
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register('duration', { 
                  required: 'Duration is required',
                  min: { 
                    value: 30, 
                    message: 'Minimum duration is 30 minutes' 
                  },
                  valueAsNumber: true
                })}
                placeholder="e.g. 120"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white placeholder-gray-500"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>
          
          {/* Problem Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Select Problems ({problems.length} selected)
              </label>
              <span className="text-xs text-gray-500">
                Click to select/deselect
              </span>
            </div>
            
            <div className="border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-700/50 space-y-3">
              {availableProblems.map(problem => {
                const isSelected = problems.some(p => p._id === problem._id);
                const difficultyColors = {
                  Easy: 'text-green-400',
                  Medium: 'text-yellow-400',
                  Hard: 'text-red-400'
                };
                
                return (
                  <div 
                    key={problem._id} 
                    onClick={() => handleToggleProblem(problem)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/10 border border-cyan-500/50' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected 
                            ? 'bg-cyan-500 text-white' 
                            : 'bg-gray-600 text-gray-400'
                        }`}>
                          {isSelected ? '✓' : '+'}
                        </div>
                        <span className="font-medium">{problem.title}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        difficultyColors[problem.difficulty]
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg text-lg"
          >
            {isSubmitting ? 'Creating Contest...' : 'Create Contest'}
          </button>
        </form>
      </div>
    </div>
  );
}









// import { useState, useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import axiosClient from '../utils/axiosClient';
// import { useNavigate } from 'react-router';
// import {toast} from 'react-toastify' //Recommended for notifications

// // Custom CSS for react-datepicker to match theme
// import './DatePicker.css'; 

// export default function ContestCreationPage() {
//     const [problems, setProblems] = useState([]);
//     const [availableProblems, setAvailableProblems] = useState([]);
//     const navigate = useNavigate();
//     const { 
//       register, 
//       handleSubmit, 
//       control,
//       formState: { errors, isSubmitting } 
//     } = useForm({
//       defaultValues: {
//         title: '',
//         description: '',
//         startTime: new Date(),
//         duration: 120
//       }
//     });

//     useEffect(() => {
//       const fetchProblems = async () => {
//         try {
//           const { data } = await axiosClient.get('/problem/getAllProblems');
//           setAvailableProblems(data);
//         } catch (error) {
//           console.error('Error fetching problems:', error);
//         }
//       };
//       fetchProblems();
//     }, []);

//     const handleToggleProblem = (problem) => {
//       setProblems(prev => {
//         const isSelected = prev.some(p => p._id === problem._id);
//         if (isSelected) {
//           return prev.filter(p => p._id !== problem._id);
//         }
//         return [...prev, problem];
//       });
//     };

//     const onSubmit = async (formData) => {
//         if (problems.length === 0) {
//           alert('Please select at least one problem');
//           return;
//         }
//         try {
//             const contestData = {
//               title: formData.title,
//               description: formData.description,
//               startTime: formData.startTime,
//               duration: Number(formData.duration),
//               problems: problems.map(p => p._id),
//             };
//             console.log("Hello") ;
//             const { data } = await axiosClient.post('/contest/create', contestData);
//             console.log("Hii") ;
//             toast.success('Contest created successfully!');
//             navigate(`/contestpage/${data.contest._id}`);
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to create contest.');
//             console.error('Contest creation failed:', error);
//         }
//     };

//     return (
//         <div className="min-h-screen p-4 sm:p-8 text-card-foreground text-white ">
//             <div className="max-w-4xl mx-auto">
//                 <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary-from to-primary-to text-transparent bg-clip-text">
//                     Create New Contest
//                 </h1>

//                 <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 border border-border/50">
//                     {/* Title */}
//                     <div>
//                         <label htmlFor="title" className="block text-sm font-medium text-placeholder-text mb-2">Contest Title</label>
//                         <input
//                             id="title"
//                             {...register('title', { required: 'Title is required' })}
//                             className={`w-full bg-input-background border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all ${errors.title ? 'border-destructive' : ''}`}
//                         />
//                         {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
//                     </div>

//                     {/* Description */}
//                     <div>
//                         <label htmlFor="description" className="block text-sm font-medium text-placeholder-text mb-2">Description</label>
//                         <textarea
//                             id="description"
//                             rows="5"
//                             {...register('description', { required: 'Description is required' })}
//                             className={`w-full bg-input-background border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all ${errors.description ? 'border-destructive' : ''}`}
//                         />
//                         {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
//                     </div>

//                     {/* Start Time and Duration */}
//                     <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
//                       <Controller
//                           control={control}
//                           name="startTime"
//                           rules={{ required: 'Start time is required' }}
//                           render={({ field }) => (
//                             <DatePicker
//                               selected={field.value}
//                               onChange={date => field.onChange(date)}
//                               showTimeSelect
//                               dateFormat="Pp"
//                               className={`w-full px-3 py-2 border rounded-md ${
//                                 errors.startTime ? 'border-red-500' : ''
//                               }`}
//                             />
//                           )}
//                         />
//                         {errors.startTime && (
//                           <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
//                         )}

//                       <div>
//                         <label className="block text-gray-700 mb-2">Duration (minutes)</label>
//                         <input
//                           type="number"
//                           {...register('duration', { 
//                             required: 'Duration is required',
//                             min: { 
//                               value: 30, 
//                               message: 'Minimum duration is 30 minutes' 
//                             },
//                             valueAsNumber: true
//                           })}
//                           className={`w-full px-3 py-2 border rounded-md ${
//                             errors.duration ? 'border-red-500' : ''
//                           }`}/>
//                         {errors.duration && (
//                           <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Problem Selection */}
//                     <div>
//                         <label className="block text-sm font-medium text-placeholder-text mb-2">Select Problems</label>
//                         <div className="border border-border rounded-md p-4 max-h-72 overflow-y-auto bg-input-background/50 space-y-3">
//                             {availableProblems.map(problem => (
//                               <div key={problem._id} className="flex items-center mb-2">
//                                 <input
//                                   type="checkbox"
//                                   checked={problems.some(p => p._id === problem._id)}
//                                   onChange={() => handleToggleProblem(problem)}
//                                   className="mr-2"
//                                 />
//                                 <span>{problem.title}</span>
//                                 <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
//                                   problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
//                                   problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
//                                   'bg-red-100 text-red-800'
//                                 }`}>
//                                   {problem.difficulty}
//                                 </span>
//                               </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full bg-gradient-to-r from-primary-from to-primary-to text-button-text font-bold px-6 py-3 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
//                     >
//                         {isSubmitting ? 'Creating...' : 'Create Contest'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }




// import { useState, useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import './DatePicker.css'; 
// import axiosClient from '../utils/axiosClient';
// import { useNavigate } from 'react-router';
// import toast from 'react-toast';

// export default function ContestCreationForm() {
//   const [problems, setProblems] = useState([]);
//   const [availableProblems, setAvailableProblems] = useState([]);
//   const navigate = useNavigate();
//   const { 
//     register, 
//     handleSubmit, 
//     control,
//     formState: { errors, isSubmitting } 
//   } = useForm({
//     defaultValues: {
//       title: '',
//       description: '',
//       startTime: new Date(),
//       duration: 120
//     }
//   });

//   useEffect(() => {
//     const fetchProblems = async () => {
//       try {
//         const { data } = await axiosClient.get('/problem/getAllProblems');
//         setAvailableProblems(data);
//       } catch (error) {
//         console.error('Error fetching problems:', error);
//       }
//     };
//     fetchProblems();
//   }, []);

//   const handleToggleProblem = (problem) => {
//     setProblems(prev => {
//       const isSelected = prev.some(p => p._id === problem._id);
//       if (isSelected) {
//         return prev.filter(p => p._id !== problem._id);
//       }
//       return [...prev, problem];
//     });
//   };

//   const onSubmit = async (formData) => {
//     if (problems.length === 0) {
//       alert('Please select at least one problem');
//       return;
//     }
    
//     try {
//       const contestData = {
//         title: formData.title,
//         description: formData.description,
//         startTime: formData.startTime,
//         duration: Number(formData.duration),
//         problems: problems.map(p => p._id),
//       };

//       const res = await axiosClient.post('/contest/create', { contest: contestData });
//       toast.success('Contest created successfully!');
//       navigate(`/contests/${data.contest._id}`);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to create contest.');
//       console.error('Contest creation failed:', error);
//     }
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-6">Create New Contest</h1>
      
//       <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2">Contest Title</label>
//           <input
//             {...register('title', { required: 'Title is required' })}
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.title ? 'border-red-500' : ''
//             }`}
//           />
//           {errors.title && (
//             <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//           )}
//         </div>
        
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2">Description</label>
//           <textarea
//             {...register('description', { required: 'Description is required' })}
//             className={`w-full px-3 py-2 border rounded-md ${
//               errors.description ? 'border-red-500' : ''
//             }`}
//             rows="4"
//           />
//           {errors.description && (
//             <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//           )}
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-gray-700 mb-2">Start Time</label>
//             <Controller
//               control={control}
//               name="startTime"
//               rules={{ required: 'Start time is required' }}
//               render={({ field }) => (
//                 <DatePicker
//                   selected={field.value}
//                   onChange={date => field.onChange(date)}
//                   showTimeSelect
//                   dateFormat="Pp"
//                   className={`w-full px-3 py-2 border rounded-md ${
//                     errors.startTime ? 'border-red-500' : ''
//                   }`}
//                 />
//               )}
//             />
//             {errors.startTime && (
//               <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-gray-700 mb-2">Duration (minutes)</label>
//             <input
//               type="number"
//               {...register('duration', { 
//                 required: 'Duration is required',
//                 min: { 
//                   value: 30, 
//                   message: 'Minimum duration is 30 minutes' 
//                 },
//                 valueAsNumber: true
//               })}
//               className={`w-full px-3 py-2 border rounded-md ${
//                 errors.duration ? 'border-red-500' : ''
//               }`}
//             />
//             {errors.duration && (
//               <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
//             )}
//           </div>
//         </div>
        
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2">Select Problems</label>
//           <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
//             {availableProblems.map(problem => (
//               <div key={problem._id} className="flex items-center mb-2">
//                 <input
//                   type="checkbox"
//                   checked={problems.some(p => p._id === problem._id)}
//                   onChange={() => handleToggleProblem(problem)}
//                   className="mr-2"
//                 />
//                 <span>{problem.title}</span>
//                 <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
//                   problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
//                   problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
//                   'bg-red-100 text-red-800'
//                 }`}>
//                   {problem.difficulty}
//                 </span>
//               </div>
//             ))}
//           </div>
//           {problems.length === 0 && (
//             <p className="text-red-500 text-sm mt-1">Please select at least one problem</p>
//           )}
//         </div>
        
//         <button 
//           type="submit" 
//           disabled={isSubmitting}
//           className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
//         >
//           {isSubmitting ? 'Creating...' : 'Create Contest'}
//         </button>
//       </form>
//     </div>
//   );
// }