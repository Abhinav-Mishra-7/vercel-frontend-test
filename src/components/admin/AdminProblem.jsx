import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../utils/axiosClient';
import { useNavigate, useParams } from 'react-router';
import { Settings, BrainCircuit, ClipboardList, FileCode2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  functionName: z.string().min(1, 'Function name is required'),
  description: z.string().min(1, 'Description is required'),
  constraints: z.string().min(1, 'Constraints are required'), // ADDED
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array' , 'dp' , 'linked list' , 'graph' , 'tree']),
  visibleTestCases: z.array(z.object({
    input: z.string().min(1, 'Input is required'), 
    output: z.string().min(1, 'Output is required'), 
    explaination: z.string().min(1, 'Explanation is required')
  })).min(1, "At least one visible test case is required."),
  hiddenTestCases: z.array(z.object({
    input: z.string().min(1, 'Input is required'), 
    output: z.string().min(1, 'Output is required')
  })),
  startCode: z.object({
    cpp: z.string().min(1, 'C++ starter code is required'),
    java: z.string().min(1, 'Java starter code is required'),
    javascript: z.string().min(1, 'JavaScript starter code is required')
  }),
  referenceSolution: z.object({
    cpp: z.string().min(1, 'C++ solution is required'),
    java: z.string().min(1, 'Java solution is required'),
    javascript: z.string().min(1, 'JavaScript solution is required')
  })
});

  const languages = [
    { id: 'cpp', name: 'C++'},
    { id: 'java', name: 'Java'},
    { id: 'javascript', name: 'JavaScript'},
  ];

function AdminPanel() {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const isEditMode = Boolean(problemId);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState('problem');
  const [starterActiveLang, setStarterActiveLang] = useState('cpp');
  const [solutionActiveLang, setSolutionActiveLang] = useState('cpp');
  const [testCaseView, setTestCaseView] = useState('visible');
  const [codeView, setCodeView] = useState('boilerplate'); 

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: { title: '',description: '',constraints: '', difficulty: 'easy',tags: 'array',visibleTestCases: [{ input: '', output: '', explaination: '' }],hiddenTestCases: [{ input: '', output: '' }], functionName: '' ,
      startCode: {cpp: '',java: '', javascript: ''},
      referenceSolution: {cpp: '',java: '',javascript: ''}
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  useEffect(() => {
    if (isEditMode) {
      const fetchProblemData = async () => {
        setIsLoading(true);
        try {
          const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
          
          // Helper function to transform DB array format back to UI object format
          const arrayToObject = (arr, codeKey) => {
            return arr.reduce((acc, item) => {
              acc[item.language] = item[codeKey];
              return acc;
            }, { cpp: '', java: '', javascript: '' });
          };

          const sanitizedData = {
            ...data,
            visibleTestCases: data.visibleTestCases?.length > 0 ? data.visibleTestCases : [{ input: '', output: '', explaination: '' }],
            hiddenTestCases: data.hiddenTestCases || [],
            // Transform the array from the DB to the object format the form uses
            startCode: arrayToObject(data.startCode, 'initialCode'),
            referenceSolution: arrayToObject(data.referenceSolution, 'completeCode'),
          };
          reset(sanitizedData);
        } catch (error) {
          console.error("Failed to fetch problem data:", error);
          toast.error('Failed to load problem data for editing.');
          navigate('/admin');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProblemData();
    }
  }, [problemId, isEditMode, reset, navigate]);

  const onSubmit = async (data) => {
    
    // Transform the 'startCode' object into the required array format
    const startCodeArray = Object.entries(data.startCode).map(([lang, code]) => ({
      language: lang,
      initialCode: code,
    }));

    // Transform the 'referenceSolution' object into the required array format
    const referenceSolutionArray = Object.entries(data.referenceSolution).map(([lang, code]) => ({
      language: lang,
      completeCode: code,
    }));
    
    // Construct the final payload that matches the Mongoose schema
    const payload = {
      ...data,
      startCode: startCodeArray,
      referenceSolution: referenceSolutionArray,
    };

    console.log("Submitting payload to backend:", payload);

    try {
      if (isEditMode) {        
        await axiosClient.put(`/problem/update/${problemId}`, payload);
        toast.success('Problem updated successfully!');
      } else {
        await axiosClient.post('/problem/create', payload);
        toast.success('Problem created successfully!');
      }
      navigate('/admin');
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  const navItems = [
    { id: 'problem', label: 'Problem Definition', icon: <BrainCircuit size={20} /> },
    { id: 'config', label: 'Configuration', icon: <Settings size={20} /> },
    { id: 'tests', label: 'Test Cases', icon: <ClipboardList size={20} /> },
    { id: 'solution', label: 'Solution & Boilerplate', icon: <FileCode2 size={20} /> }
  ];

  const onInvalid = (errors) => {
      // (This error handling logic remains the same and is still very useful)
      console.log("Validation Errors:", errors);
      toast.error('Please fix the errors before submitting.');
      if (errors.title || errors.description) setActiveTab('problem');
      else if (errors.difficulty || errors.tags) setActiveTab('config');
      else if (errors.visibleTestCases || errors.hiddenTestCases) setActiveTab('tests');
      else if (errors.startCode || errors.referenceSolution) setActiveTab('solution');
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-foreground font-sans">
      <form onSubmit={handleSubmit(onSubmit , onInvalid)}>
        <header className="sticky top-0 z-30 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700 shadow-lg">
          {/* Header JSX remains the same */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <h1 className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text text-3xl font-bold">
                  {isEditMode ? 'Problem Editor' : 'Create New Problem'}
                </h1>
                {isEditMode && (
                  <span className="ml-4 px-2 py-1 text-sm bg-purple-900/30 text-purple-300 rounded-md font-mono">
                    ID: {problemId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={() => navigate('/admin')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all hover:shadow-purple-500/20 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Saving...' : 'Creating...'}
                    </span>
                  ) : isEditMode ? 'Save Changes' : 'Create & Publish'}
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex max-w-screen-2xl mx-auto">
          {/* Sidebar & Main Content... */}
          <aside className="w-81 flex-shrink-0 hidden md:block bg-gray-800/50 border-r border-gray-700 min-h-[calc(100vh-5rem)]">
            <nav className="py-6">
              <ul className="space-y-1 px-4">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id 
                          ? 'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] border-l-4 border-purple-300' 
                          : 'text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      <span className={`${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* The other tabs (problem, config, tests) remain the same */}
            {activeTab === 'problem' && (
              //... your existing problem definition JSX
               <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <BrainCircuit className="text-purple-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Problem Definition</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-md font-medium text-gray-300 mb-2">Title</label>
                      <input
                        {...register('title')}
                        className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none font-mono focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-md "
                        placeholder="e.g., Validate Binary Search Tree"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-md font-medium text-gray-300 mb-2">
                        Description (Markdown)
                      </label>
                      <textarea
                        {...register('description')}
                        className="w-full h-64 text-md font-mono px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                        placeholder="Describe the problem, constraints, and examples..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-300 mb-2">
                        Constraints (Markdown)
                      </label>
                      <textarea
                        {...register('constraints')}
                        className="w-full h-40 text-md font-mono px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                        placeholder="e.g.,1 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9"/>
                      {errors.constraints && (
                        <p className="mt-1 text-sm text-red-400">{errors.constraints.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-300 mb-2">
                        Function Call
                      </label>
                      <textarea
                        {...register('functionName')}
                        className="w-full h-40 text-md font-mono px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                        placeholder="function sum(){
                    }"/>
                      {errors.functionName && (
                        <p className="mt-1 text-sm text-red-400">{errors.functionName.message}</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}
            {activeTab === 'config' && (
                //... your existing config JSX
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="text-purple-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Configuration</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                      <select
                        {...register('difficulty')}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tag</label>
                      <select
                        {...register('tags')}
                        className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      >
                        <option value="array">Array</option>
                        <option value="dp">Dynamic Programming</option>
                        <option value="linked list">Linked List</option>
                        <option value="graph">Graph</option>
                        <option value="tree">Tree</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
             {activeTab === 'tests' && (
                // ... your existing test cases JSX
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <ClipboardList className="text-purple-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Test Cases</h2>
                  </div>
        
                <div className="flex gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setTestCaseView('visible')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      testCaseView === 'visible'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Visible Test Cases
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestCaseView('hidden')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      testCaseView === 'hidden'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Hidden Test Cases
                  </button>
                </div>
                {testCaseView === 'visible' && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Visible Test Cases</h3>
                      <button
                        type="button"
                        onClick={() => appendVisible({ input: '', output: '', explaination: '' })}
                        className="px-4 py-2 flex items-center gap-2 text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
                      >
                        <Plus size={18} />
                        Add Case
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">
                      These cases are shown to the user as examples.
                    </p>
                    <div className="space-y-4">
                      {visibleFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-medium text-gray-300">Case #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeVisible(index)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Remove test case"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Input</label>
                              <textarea
                                {...register(`visibleTestCases.${index}.input`)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
                                rows={2}
                                placeholder="Input"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Output</label>
                              <textarea
                                {...register(`visibleTestCases.${index}.output`)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
                                rows={2}
                                placeholder="Output"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Explanation</label>
                              <textarea
                                {...register(`visibleTestCases.${index}.explaination`)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white text-sm"
                                rows={2}
                                placeholder="Explanation"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            {testCaseView === 'hidden' && (
              <div className="border-t border-gray-700 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Hidden Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendHidden({ input: '', output: '' })}
                    className="px-4 py-2 flex items-center gap-2 text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
                  >
                    <Plus size={18} />
                    Add Case
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  These cases are used for judging submissions and are not shown to the user.
                </p>
                <div className="space-y-4">
                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-gray-300">Case #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeHidden(index)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Remove test case"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Input</label>
                          <textarea
                            {...register(`hiddenTestCases.${index}.input`)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
                            rows={2}
                            placeholder="Input"
                          />
                        </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Output</label>
                            <textarea
                              {...register(`hiddenTestCases.${index}.output`)}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
                              rows={2}
                              placeholder="Output"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
            )}
            
            {/* Solution & Boilerplate Section */}
            {activeTab === 'solution' && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FileCode2 className="text-purple-500" size={24} />
                    <h2 className="text-xl font-bold text-white">Solution & Boilerplate</h2>
                  </div>
                  
                  {/* Boilerplate/Solution Toggle Buttons */}
                  <div className="flex gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setCodeView('boilerplate')}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        codeView === 'boilerplate'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Boilerplate Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeView('solution')}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        codeView === 'solution'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Reference Solution
                    </button>
                  </div>

                  {/* Language Tabs */}
                  <div className="flex mb-6 border-b border-gray-700">
                    {['cpp', 'java', 'javascript'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                          codeView === 'boilerplate'
                            ? starterActiveLang === lang
                              ? 'text-purple-400 border-b-2 border-purple-500'
                              : 'text-gray-400 hover:text-gray-300'
                            : solutionActiveLang === lang
                              ? 'text-purple-400 border-b-2 border-purple-500'
                              : 'text-gray-400 hover:text-gray-300'
                        }`}
                        // FIX 3: Simplified onClick handler, removed redundant state
                        onClick={() => {
                          if (codeView === 'boilerplate') {
                            setStarterActiveLang(lang);
                          } else {
                            setSolutionActiveLang(lang);
                          }
                        }}
                      >
                        {{ cpp: 'C++', java: 'Java', javascript: 'JavaScript' }[lang]}
                        {/* {lang.charAt(0).toUpperCase() + lang.slice(1)} */}
                      </button>
                    ))}
                  </div>

                  {/* Boilerplate Editor */}
                  {codeView === 'boilerplate' && (
                    <div>
                      <label className="block text-md font-medium text-gray-300 mb-3">
                        Starter Code
                      </label>
                      <div className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
                        <textarea
                          key={`starter-${starterActiveLang}`}
                          // This will now correctly register `startCode.c++`, `startCode.java`, etc.
                          {...register(`startCode.${starterActiveLang}`)}
                          className="w-full h-80 p-4 font-mono text-md bg-gray-750 text-white focus:outline-none resize-none"
                          placeholder={`// ${starterActiveLang.toUpperCase()} boilerplate...`}
                        />
                      </div>
                      {/* Displaying potential error messages for the specific language field */}
                      {errors.startCode?.[starterActiveLang] && (
                          <p className="mt-1 text-sm text-red-400">{errors.startCode[starterActiveLang].message}</p>
                      )}
                    </div>
                  )}

                  {/* Solution Editor */}
                  {codeView === 'solution' && (
                    <div>
                      <label className="block text-md font-medium text-gray-300 mb-3">
                        Reference Solution
                      </label>
                      <div className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
                        <textarea
                          key={`solution-${solutionActiveLang}`}
                          // This will now correctly register `referenceSolution.c++`, etc.
                          {...register(`referenceSolution.${solutionActiveLang}`)}
                          className="w-full h-80 p-4 font-mono text-sm bg-gray-750 text-white focus:outline-none resize-none"
                          placeholder={`// ${solutionActiveLang.toUpperCase()} solution...`}
                        />
                      </div>
                      {/* Displaying potential error messages for the specific language field */}
                      {errors.referenceSolution?.[solutionActiveLang] && (
                          <p className="mt-1 text-sm text-red-400">{errors.referenceSolution[solutionActiveLang].message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </form>
    </div>
  );
}

export default AdminPanel;


// import React, { useEffect, useState } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import axiosClient from '../utils/axiosClient';
// import { useNavigate, useParams } from 'react-router';
// import { Settings, BrainCircuit, ClipboardList, FileCode2, Plus, Trash2 } from 'lucide-react';
// import { toast } from 'react-toastify';

// const problemSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().min(1, 'Description is required'),
//   difficulty: z.enum(['easy', 'medium', 'hard']),
//   tags: z.enum(['array' , 'dp' , 'linked list' , 'graph' , 'tree']),
//   visibleTestCases: z.array(z.object({input: z.string().min(1, 'Input is required'), output: z.string().min(1, 'Output is required'), explaination: z.string().min(1, 'Explanation is required')})).min(1),
//   hiddenTestCases: z.array(z.object({input: z.string().min(1, 'Input is required'), output: z.string().min(1, 'Output is required')})),
//   // Update schema for new structure
//   startCode: z.object({
//     'c++': z.string().min(1, 'C++ starter code is required'),
//     java: z.string().min(1, 'Java starter code is required'),
//     javascript: z.string().min(1, 'JavaScript starter code is required')
//   }),
//   referenceSolution: z.object({
//     'c++': z.string().min(1, 'C++ solution is required'),
//     java: z.string().min(1, 'Java solution is required'),
//     javascript: z.string().min(1, 'JavaScript solution is required')
//   })
// });

// function AdminPanel() {
//   const navigate = useNavigate();
//   const { problemId } = useParams();
//   const isEditMode = Boolean(problemId);
//   const [isLoading, setIsLoading] = useState(isEditMode);
//   const [activeTab, setActiveTab] = useState('problem');
//   const [starterActiveLang, setStarterActiveLang] = useState('c++');
//   const [solutionActiveLang, setSolutionActiveLang] = useState('c++');
//   // const [activeLang , setActiveLang] = useState('c++') ;
//   const [testCaseView, setTestCaseView] = useState('visible');
//   const [codeView, setCodeView] = useState('boilerplate'); 

//   const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset , watch , setValue } = useForm({
//     resolver: zodResolver(problemSchema),
//     defaultValues: {
//       difficulty: 'easy',
//       tags: 'array',
//       visibleTestCases: [{ input: '', output: '', explaination: '' }],
//       hiddenTestCases: [{ input: '', output: '' }],
//       startCode: [{ language: 'c++', initialCode: '' }, { language: 'java', initialCode: '' }, { language: 'javascript', initialCode: '' }],
//       referenceSolution: [{ language: 'c++', completeCode: '' }, { language: 'java', completeCode: '' }, { language: 'javascript', completeCode: '' }]
//     },
//   });
//   // const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
//   //   resolver: zodResolver(problemSchema),
//   //   defaultValues: {
//   //     difficulty: 'easy',
//   //     tags: 'array',
//   //     visibleTestCases: [{ input: '', output: '', explaination: '' }],
//   //     hiddenTestCases: [{ input: '', output: '' }],
//   //     // Change startCode and referenceSolution to object format
//   //     startCode: {
//   //       'c++': '',
//   //       java: '',
//   //       javascript: ''
//   //     },
//   //     referenceSolution: {
//   //       'c++': '',
//   //       java: '',
//   //       javascript: ''
//   //     }
//   //   },
//   // })

//   const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
//   const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

//   // useEffect(() => {
//   //   if (isEditMode) {
//   //     const fetchProblemData = async () => {
//   //       setIsLoading(true);
//   //       try {
//   //         const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);

//   //         const sanitizedData = {
//   //           ...data,
//   //           visibleTestCases: data.visibleTestCases || [],
//   //           hiddenTestCases: data.hiddenTestCases || [],
//   //           // startCode: data.startCode || [],
//   //           startCode: data.startCode?.reduce((acc, item) => {
//   //             acc[item.language] = item.initialCode;
//   //             return acc;
//   //           }, { 'c++': '', java: '', javascript: '' }) || { 'c++': '', java: '', javascript: '' },
//   //           // referenceSolution: data.referenceSolution || [],
//   //           referenceSolution: data.referenceSolution?.reduce((acc, item) => {
//   //             acc[item.language] = item.completeCode;
//   //             return acc;
//   //           }, { 'c++': '', java: '', javascript: '' }) || { 'c++': '', java: '', javascript: '' }

//   //         };
//   //         reset(sanitizedData);
//   //       } catch (error) {
//   //         console.error("Failed to fetch problem data:", error);
//   //         toast.error('Failed to load problem data for editing.');
//   //         navigate('/admin');
//   //       } finally {
//   //         setIsLoading(false);
//   //       }
//   //     };
//   //     fetchProblemData();
//   //   }
//   // }, [problemId, isEditMode, reset, navigate]);

//   useEffect(() => {
//     if (isEditMode) {
//       const fetchProblemData = async () => {
//         setIsLoading(true);
//         try {
//           const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
          
//           // Convert array format to object format
//           const convertCodeArrayToObject = (codeArray) => {
//             if (!codeArray) return { 'c++': '', java: '', javascript: '' };
            
//             return codeArray.reduce((acc, item) => {
//               acc[item.language] = item.initialCode || item.completeCode || '';
//               return acc;
//             }, { 'c++': '', java: '', javascript: '' });
//           };

//           const sanitizedData = {
//             ...data,
//             visibleTestCases: data.visibleTestCases || [],
//             hiddenTestCases: data.hiddenTestCases || [],
//             startCode: convertCodeArrayToObject(data.startCode),
//             referenceSolution: convertCodeArrayToObject(data.referenceSolution)
//           };
          
//           reset(sanitizedData);
//         } catch (error) {
//           console.error("Failed to fetch problem data:", error);
//           toast.error('Failed to load problem data for editing.');
//           navigate('/admin');
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchProblemData();
//     }
//   }, [problemId, isEditMode, reset, navigate]);

//   // const onSubmit = async (data) => {
//   //   try {
      
//   //     if (isEditMode) {        
//   //       await axiosClient.put(`/problem/update/${problemId}`, data);
//   //       toast.success('Problem updated successfully!');
//   //     } else {
//   //       const created = await axiosClient.post('/problem/create', data);
//   //       toast.success('Problem created successfully!');
//   //     }
//   //     navigate('/admin');
//   //   } catch (error) {
//   //     toast.error(`Error: ${error.response?.data?.message || error.message}`);
//   //   }
//   // };

//   // const onSubmit = async (formData) => {
//   //   try {
//   //     // Create a properly formatted payload
//   //     const payload = {
//   //       ...formData,
//   //       // Ensure test cases are properly formatted
//   //       visibleTestCases: formData.visibleTestCases.map(tc => ({
//   //         input: tc.input,
//   //         output: tc.output,
//   //         explaination: tc.explaination
//   //       })),
//   //       hiddenTestCases: formData.hiddenTestCases.map(tc => ({
//   //         input: tc.input,
//   //         output: tc.output
//   //       }))
//   //     };

//   //     if (isEditMode) {
//   //       await axiosClient.put(`/problem/update/${problemId}`, payload);
//   //       toast.success('Problem updated successfully!');
//   //     } else {
//   //       await axiosClient.post('/problem/create', payload);
//   //       toast.success('Problem created successfully!');
//   //     }
//   //     navigate('/admin');
//   //   } catch (error) {
//   //     toast.error(`Error: ${error.response?.data?.message || error.message}`);
//   //   }
//   // };

//   const onSubmit = async (data) => {
//     try {
//       // Prepare the payload
//       const payload = {
//         ...data,
//         visibleTestCases: data.visibleTestCases,
//         hiddenTestCases: data.hiddenTestCases,
//         // Convert code objects to arrays for the backend
//         startCode: Object.entries(data.startCode).map(([language, initialCode]) => ({
//           language,
//           initialCode
//         })),
//         referenceSolution: Object.entries(data.referenceSolution).map(([language, completeCode]) => ({
//           language,
//           completeCode
//         }))
//       };

//       if (isEditMode) {
//         await axiosClient.put(`/problem/update/${problemId}`, payload);
//         toast.success('Problem updated successfully!');
//       } else {
//         await axiosClient.post('/problem/create', payload);
//         toast.success('Problem created successfully!');
//       }
//       navigate('/admin');
//     } catch (error) {
//       toast.error(`Error: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
//       </div>
//     );
//   }

//   const navItems = [
//     { id: 'problem', label: 'Problem Definition', icon: <BrainCircuit size={20} /> },
//     { id: 'config', label: 'Configuration', icon: <Settings size={20} /> },
//     { id: 'tests', label: 'Test Cases', icon: <ClipboardList size={20} /> },
//     { id: 'solution', label: 'Solution & Boilerplate', icon: <FileCode2 size={20} /> }
//   ];

//   return (
//     <div className="min-h-screen w-full bg-transparent text-foreground font-sans">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <header className="sticky top-0 z-30 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700 shadow-lg">
//           <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between h-20">
//               <div className="flex items-center">
//                 <h1 className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text text-3xl font-bold">
//                   {isEditMode ? 'Problem Editor' : 'Create New Problem'}
//                 </h1>
//                 {isEditMode && (
//                   <span className="ml-4 px-2 py-1 text-sm bg-purple-900/30 text-purple-300 rounded-md font-mono">
//                     ID: {problemId}
//                   </span>
//                 )}
//               </div>
//               <div className="flex items-center gap-3">
//                 <button 
//                   type="button" 
//                   className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
//                   onClick={() => navigate('/admin')}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="px-6 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all hover:shadow-purple-500/20 disabled:opacity-70"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? (
//                     <span className="flex items-center">
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       {isEditMode ? 'Saving...' : 'Creating...'}
//                       {console.log("clicked")}
//                     </span>
//                   ) : isEditMode ? 'Save Changes' : 'Create & Publish'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>
        
//         <div className="flex max-w-screen-2xl mx-auto">
//           {/* Sidebar Navigation */}
//           <aside className="w-81 flex-shrink-0 hidden md:block bg-gray-800/50 border-r border-gray-700 min-h-[calc(100vh-5rem)]">
//             <nav className="py-6">
//               <ul className="space-y-1 px-4">
//                 {navItems.map((item) => (
//                   <li key={item.id}>
//                     <button
//                       type="button"
//                       onClick={() => setActiveTab(item.id)}
//                       className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                         activeTab === item.id 
//                           ? 'bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] border-l-4 border-purple-300' 
//                           : 'text-gray-400 hover:bg-gray-700/50'
//                       }`}
//                     >
//                       <span className={`${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}>
//                         {item.icon}
//                       </span>
//                       <span className="font-medium">{item.label}</span>
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </aside>

//           {/* Mobile Tabs */}
//           <div className="md:hidden w-full border-b border-gray-700">
//             <div className="flex overflow-x-auto py-2 px-2">
//               {navItems.map((item) => (
//                 <button
//                   key={item.id}
//                   type="button"
//                   onClick={() => setActiveTab(item.id)}
//                   className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg mx-1 ${
//                     activeTab === item.id 
//                       ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
//                       : 'text-gray-400 bg-gray-800'
//                   }`}
//                 >
//                   <span className="text-sm">
//                     {item.icon}
//                   </span>
//                   <span className="text-sm font-medium">{item.label.split(' ')[0]}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Main Content */}
//           <main className="flex-1 p-4 sm:p-6 lg:p-8">
//             {/* Problem Definition Section */}
//             {activeTab === 'problem' && (
//               <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
//                 <div className="p-6 sm:p-8">
//                   <div className="flex items-center gap-3 mb-6">
//                     <BrainCircuit className="text-purple-500" size={24} />
//                     <h2 className="text-2xl font-bold text-white">Problem Definition</h2>
//                   </div>
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-md font-medium text-gray-300 mb-2">Title</label>
//                       <input
//                         {...register('title')}
//                         className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none font-mono focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 text-md "
//                         placeholder="e.g., Validate Binary Search Tree"
//                       />
//                       {errors.title && (
//                         <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-md font-medium text-gray-300 mb-2">
//                         Description (Markdown)
//                       </label>
//                       <textarea
//                         {...register('description')}
//                         className="w-full h-64 text-md font-mono px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
//                         placeholder="Describe the problem, constraints, and examples..."
//                       />
//                       {errors.description && (
//                         <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Configuration Section */}
//             {activeTab === 'config' && (
//               <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
//                 <div className="p-6 sm:p-8">
//                   <div className="flex items-center gap-3 mb-6">
//                     <Settings className="text-purple-500" size={24} />
//                     <h2 className="text-2xl font-bold text-white">Configuration</h2>
//                   </div>
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
//                       <select
//                         {...register('difficulty')}
//                         className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
//                       >
//                         <option value="easy">Easy</option>
//                         <option value="medium">Medium</option>
//                         <option value="hard">Hard</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-2">Tag</label>
//                       <select
//                         {...register('tags')}
//                         className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
//                       >
//                         <option value="array">Array</option>
//                         <option value="dp">Dynamic Programming</option>
//                         <option value="linked list">Linked List</option>
//                         <option value="graph">Graph</option>
//                         <option value="tree">Tree</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Test Cases Section */}
//             {activeTab === 'tests' && (
//               <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
//                 <div className="p-6 sm:p-8">
//                   <div className="flex items-center gap-3 mb-6">
//                     <ClipboardList className="text-purple-500" size={24} />
//                     <h2 className="text-2xl font-bold text-white">Test Cases</h2>
//                   </div>
        
//                 {/* Test Case Type Toggle Buttons */}
//                 <div className="flex gap-4 mb-8">
//                   <button
//                     type="button"
//                     onClick={() => setTestCaseView('visible')}
//                     className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                       testCaseView === 'visible'
//                         ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
//                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                     }`}
//                   >
//                     Visible Test Cases
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setTestCaseView('hidden')}
//                     className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                       testCaseView === 'hidden'
//                         ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
//                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                     }`}
//                   >
//                     Hidden Test Cases
//                   </button>
//                 </div>

//                 {/* Visible Test Cases Section */}
//                 {testCaseView === 'visible' && (
//                   <div className="mb-8">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-lg font-semibold text-white">Visible Test Cases</h3>
//                       <button
//                         type="button"
//                         onClick={() => appendVisible({ input: '', output: '', explaination: '' })}
//                         className="px-4 py-2 flex items-center gap-2 text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
//                       >
//                         <Plus size={18} />
//                         Add Case
//                       </button>
//                     </div>
//                     <p className="text-sm text-gray-400 mb-6">
//                       These cases are shown to the user as examples.
//                     </p>
//                     <div className="space-y-4">
//                       {visibleFields.map((field, index) => (
//                         <div key={field.id} className="bg-gray-750 p-4 rounded-lg border border-gray-700">
//                           <div className="flex justify-between items-center mb-4">
//                             <span className="font-medium text-gray-300">Case #{index + 1}</span>
//                             <button
//                               type="button"
//                               onClick={() => removeVisible(index)}
//                               className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
//                               title="Remove test case"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </div>
//                           <div className="space-y-4">
//                             <div>
//                               <label className="block text-sm text-gray-400 mb-1">Input</label>
//                               <textarea
//                                 {...register(`visibleTestCases.${index}.input`)}
//                                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
//                                 rows={2}
//                                 placeholder="Input"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm text-gray-400 mb-1">Output</label>
//                               <textarea
//                                 {...register(`visibleTestCases.${index}.output`)}
//                                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
//                                 rows={2}
//                                 placeholder="Output"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm text-gray-400 mb-1">Explanation</label>
//                               <textarea
//                                 {...register(`visibleTestCases.${index}.explaination`)}
//                                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white text-sm"
//                                 rows={2}
//                                 placeholder="Explanation"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//             {/* Hidden Test Cases Section */}
//             {testCaseView === 'hidden' && (
//               <div className="border-t border-gray-700 pt-8">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-white">Hidden Test Cases</h3>
//                   <button
//                     type="button"
//                     onClick={() => appendHidden({ input: '', output: '' })}
//                     className="px-4 py-2 flex items-center gap-2 text-purple-400 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
//                   >
//                     <Plus size={18} />
//                     Add Case
//                   </button>
//                 </div>
//                 <p className="text-sm text-gray-400 mb-6">
//                   These cases are used for judging submissions and are not shown to the user.
//                 </p>
//                 <div className="space-y-4">
//                   {hiddenFields.map((field, index) => (
//                     <div key={field.id} className="bg-gray-750 p-4 rounded-lg border border-gray-700">
//                       <div className="flex justify-between items-center mb-4">
//                         <span className="font-medium text-gray-300">Case #{index + 1}</span>
//                         <button
//                           type="button"
//                           onClick={() => removeHidden(index)}
//                           className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
//                           title="Remove test case"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm text-gray-400 mb-1">Input</label>
//                           <textarea
//                             {...register(`hiddenTestCases.${index}.input`)}
//                             className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
//                             rows={2}
//                             placeholder="Input"
//                           />
//                         </div>
//                           <div>
//                             <label className="block text-sm text-gray-400 mb-1">Output</label>
//                             <textarea
//                               {...register(`hiddenTestCases.${index}.output`)}
//                               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-white font-mono text-sm"
//                               rows={2}
//                               placeholder="Output"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 )}
//               </div>
//             </div>
//             )}
           

//             {/* Solution & Boilerplate Section */}
//             {activeTab === 'solution' && (
//               <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
//                 <div className="p-6 sm:p-8">
//                   <div className="flex items-center gap-3 mb-6">
//                     <FileCode2 className="text-purple-500" size={24} />
//                     <h2 className="text-xl font-bold text-white">Solution & Boilerplate</h2>
//                   </div>
                  
//                   {/* Boilerplate/Solution Toggle Buttons */}
//                   <div className="flex gap-4 mb-6">
//                     <button
//                       type="button"
//                       onClick={() => setCodeView('boilerplate')}
//                       className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                         codeView === 'boilerplate'
//                           ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
//                           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                       }`}
//                     >
//                       Boilerplate Code
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setCodeView('solution')}
//                       className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                         codeView === 'solution'
//                           ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
//                           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                       }`}
//                     >
//                       Reference Solution
//                     </button>
//                   </div>

//                   {/* Language Tabs */}
//                   <div className="flex mb-6 border-b border-gray-700">
//                     {['c++', 'java', 'javascript'].map((lang) => (
//                       <button
//                         key={lang}
//                         type="button"
//                         className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
//                           codeView === 'boilerplate'
//                             ? starterActiveLang === lang
//                               ? 'text-purple-400 border-b-2 border-purple-500'
//                               : 'text-gray-400 hover:text-gray-300'
//                             : solutionActiveLang === lang
//                               ? 'text-purple-400 border-b-2 border-purple-500'
//                               : 'text-gray-400 hover:text-gray-300'
//                         }`}
//                         onClick={() => {
//                           if (codeView === 'boilerplate') {
//                             setStarterActiveLang(lang);
                            
                            
//                             // {console.log(activeLang)}
//                           } else {
//                             setSolutionActiveLang(lang);
//                             // setActiveLang(lang) ;
//                             // {console.log(activeLang)}
//                           }
//                         }}
//                       >
//                         {lang.charAt(0).toUpperCase() + lang.slice(1)}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Boilerplate Editor */}
//                   {codeView === 'boilerplate' && (
//                     <div>
//                       <label className="block text-md font-medium text-gray-300 mb-3">
//                         Starter Code
                        
//                       </label>
//                       <div className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
//                         {/* <textarea
//                           // Bind to specific language field
//                           {...register(`startCode.${starterActiveLang}`)}
//                           className="w-full h-80 p-4 font-mono text-md bg-gray-750 text-white focus:outline-none resize-none"
//                           placeholder={`// ${starterActiveLang.toUpperCase()} boilerplate...`}                          
//                         />
//                         {console.log(starterActiveLang)} */}
//                         <textarea
//                           value={watch(`startCode.${starterActiveLang}`) || ''}
//                           onChange={(e) => setValue(`startCode.${starterActiveLang}`, e.target.value)}
//                           className="w-full h-80 p-4 font-mono text-md bg-gray-750 text-white focus:outline-none resize-none"
//                           placeholder={`// ${starterActiveLang.toUpperCase()} boilerplate...`}
//                         />
                        
//                       </div>
//                       {errors.startCode?.[starterActiveLang] && (
//                         <p className="mt-2 text-sm text-red-400">
//                           {errors.startCode[starterActiveLang].message}
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {/* Solution Editor */}
//                   {codeView === 'solution' && (
//                     <div>
//                       <label className="block text-md font-medium text-gray-300 mb-3">
//                         Reference Solution
//                       </label>
//                       <div className="bg-gray-750 rounded-lg border border-gray-700 overflow-hidden">
//                         {/* <textarea
//                           // Bind to specific language field
//                           {...register(`referenceSolution.${solutionActiveLang}`)}
//                           className="w-full h-80 p-4 font-mono text-sm bg-gray-750 text-white focus:outline-none resize-none"
//                           placeholder={`// ${solutionActiveLang.toUpperCase()} solution...`}
//                         /> */}
//                         <textarea
//                           value={watch(`referenceSolution.${solutionActiveLang}`) || ''}
//                           onChange={(e) => setValue(`referenceSolution.${solutionActiveLang}`, e.target.value)}
//                           className="w-full h-80 p-4 font-mono text-sm bg-gray-750 text-white focus:outline-none resize-none"
//                           placeholder={`// ${solutionActiveLang.toUpperCase()} solution...`}
//                         />
                        
//                       </div>
//                       {errors.referenceSolution?.[solutionActiveLang] && (
//                         <p className="mt-2 text-sm text-red-400">
//                           {errors.referenceSolution[solutionActiveLang].message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}


//             {/* Navigation Footer for Mobile */}
//             <div className="md:hidden mt-8 bg-gray-800/50 rounded-xl border border-gray-700 p-4">
//               <div className="grid grid-cols-4 gap-2">
//                 {navItems.map((item) => (
//                   <button
//                     key={item.id}
//                     type="button"
//                     onClick={() => setActiveTab(item.id)}
//                     className={`flex flex-col items-center justify-center py-2 rounded-lg ${
//                       activeTab === item.id 
//                         ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300' 
//                         : 'text-gray-400 hover:bg-gray-700/50'
//                     }`}
//                   >
//                     <span className={`${activeTab === item.id ? 'text-purple-400' : 'text-gray-500'}`}>
//                       {item.icon}
//                     </span>
//                     <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </main>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default AdminPanel;




// import React, { useEffect, useState } from 'react';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import axiosClient from '../utils/axiosClient';
// import { useNavigate, useParams } from 'react-router';
// // --- NEW: Import icons for a richer UI ---
// import { Info, ClipboardList, FileCode2, PlusCircle, Trash2 } from 'lucide-react';
// import { toast } from 'react-toastify';

// // Zod schema remains the same, it's perfect.
// const problemSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().min(1, 'Description is required'),
//   difficulty: z.enum(['easy', 'medium', 'hard']),
//   tags: z.enum(['array' , 'dp' , 'linked list' , 'graph' , 'tree']),
//   visibleTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required'),
//       explaination: z.string().min(1, 'Explaination is required') // Corrected typo from explaination -> explanation
//     })
//   ).min(1, 'At least one visible test case required'),
//   hiddenTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required')
//     })
//   ).min(1, 'At least one hidden test case required'),
//   startCode: z.array(
//     z.object({
//       language: z.string() ,
//       initialCode: z.string().min(1, 'Initial code is required')
//     })
//   ).length(3, 'All three languages required'),
//   referenceSolution: z.array(
//     z.object({
//       language: z.string() ,
//       completeCode: z.string().min(1, 'Complete code is required')
//     })
//   ).length(3, 'All three languages required')
// });


// // --- NEW: A reusable component for form sections for consistency ---
// const FormSection = ({ title, icon, children }) => (
//   <div className="card bg-base-100 shadow-xl w-full">
//     <div className="card-body p-6">
//       <h2 className="card-title text-xl mb-4 flex items-center gap-2">
//         {icon}
//         {title}
//       </h2>
//       <div className="space-y-4">{children}</div>
//     </div>
//   </div>
// );


// function AdminPanel() {
//   const navigate = useNavigate();
//   const { problemId } = useParams();
//   const isEditMode = Boolean(problemId);
//   const [isLoading, setIsLoading] = useState(isEditMode);

//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm({
//     resolver: zodResolver(problemSchema),
//     defaultValues: {
//       difficulty: 'easy',
//       tags: 'array',
//       visibleTestCases: [{ input: '', output: '', explaination: '' }],
//       hiddenTestCases: [{ input: '', output: '' }],
//       startCode: [
//         { language: 'c++', initialCode: '' },
//         { language: 'java', initialCode: '' },
//         { language: 'javascript', initialCode: '' }
//       ],
//       referenceSolution: [
//         { language: 'c++', completeCode: '' },
//         { language: 'java', completeCode: '' },
//         { language: 'javascript', completeCode: '' }
//       ]
//     },
//   });

//   useEffect(() => {
//     if (isEditMode) {
//       const fetchProblemData = async () => {
//         setIsLoading(true);
//         try {
//           const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
//           // Ensure nested fields are not null/undefined to prevent uncontrolled component errors
//           const sanitizedData = {
//             ...data,
//             visibleTestCases: data.visibleTestCases || [],
//             hiddenTestCases: data.hiddenTestCases || [],
//             startCode: data.startCode || [],
//             referenceSolution: data.referenceSolution || [],
//           };
//           reset(sanitizedData);
//         } catch (error) {
//           console.error("Failed to fetch problem data:", error);
//           toast.error('Failed to load problem data for editing.');
//           navigate('/admin');
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchProblemData();
//     }
//   }, [problemId, isEditMode, reset, navigate]);

//   const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
//   const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

//   const onSubmit = async (data) => {
//     try {
//       if (isEditMode) {
//         await axiosClient.put(`/problem/update/${problemId}`, data);
//         toast.success('Problem updated successfully!');
//       } else {
//         await axiosClient.post('/problem/create', data);
//         toast.success('Problem created successfully!');
//       }
//       navigate('/admin');
//     } catch (error) {
//       toast.error(`Error: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-base-200">
//         <span className="loading loading-lg loading-spinner text-primary"></span>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-base-200 min-h-screen">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         {/* --- NEW: Sticky Header for Title and Main Actions --- */}
//         <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-base-content">
//                   {isEditMode ? 'Update Problem' : 'Create New Problem'}
//                 </h1>
//                 <p className="text-sm text-base-content/70">Fill in the details below to configure the challenge.</p>
//               </div>
//               <div className="flex items-center gap-4">
//                  <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin')}>Cancel</button>
//                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
//                     {isSubmitting ? <span className="loading loading-spinner"></span> : (isEditMode ? 'Update Problem' : 'Create Problem')}
//                  </button>
//               </div>
//             </div>
//           </div>
//         </header>
        
//         {/* --- Main Content Area --- */}
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="space-y-8">
            
//             {/* --- Section 1: Basic Information --- */}
//             <FormSection title="1. Basic Information" icon={<Info className="text-info" />}>
//               <div className="form-control">
//                 <label className="label"><span className="label-text">Title</span></label>
//                 <input {...register('title')} className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`} placeholder="e.g., Two Sum" />
//                 {errors.title && <span className="text-error text-xs mt-1">{errors.title.message}</span>}
//               </div>
//               <div className="form-control">
//                 <label className="label"><span className="label-text">Problem Description</span></label>
//                 <textarea {...register('description')} className={`textarea textarea-bordered h-48 ${errors.description ? 'textarea-error' : ''}`} placeholder="Describe the problem. Markdown is supported." />
//                 <label className="label"><span className="label-text-alt">You can use Markdown for code blocks, lists, and formatting.</span></label>
//                 {errors.description && <span className="text-error text-xs mt-1">{errors.description.message}</span>}
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="form-control">
//                   <label className="label"><span className="label-text">Difficulty</span></label>
//                   <select {...register('difficulty')} className={`select select-bordered ${errors.difficulty ? 'select-error' : ''}`}>
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="hard">Hard</option>
//                   </select>
//                 </div>
//                 <div className="form-control">
//                   <label className="label"><span className="label-text">Tag</span></label>
//                   <select {...register('tags')} className={`select select-bordered ${errors.tags ? 'select-error' : ''}`}>
//                     <option value="array">Array</option>
//                     <option value="dp">Dynamic Programming</option>
//                     <option value="linked list">Linked List</option>
//                     <option value="graph">Graph</option>
//                     <option value="tree">Tree</option>
//                   </select>
//                 </div>
//               </div>
//             </FormSection>

//             {/* --- Section 2: Test Cases (Completely Revamped) --- */}
//             <FormSection title="2. Test Cases" icon={<ClipboardList className="text-success" />}>
//                 {/* Visible Test Cases */}
//                 <div>
//                     <h3 className="text-lg font-semibold text-base-content mb-2">Visible Test Cases</h3>
//                     <p className="text-sm text-base-content/70 mb-4">These cases are shown to the user as examples.</p>
//                     <div className="space-y-4">
//                         {visibleFields.map((field, index) => (
//                             <div key={field.id} className="bg-base-200/50 p-4 rounded-lg border border-base-300">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <label className="font-medium text-base-content">Case #{index + 1}</label>
//                                     <button type="button" onClick={() => removeVisible(index)} className="btn btn-ghost btn-sm btn-circle">
//                                         <Trash2 className="h-4 w-4 text-error" />
//                                     </button>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <textarea {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="textarea textarea-bordered w-full font-mono text-sm" rows={2}/>
//                                     <textarea {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="textarea textarea-bordered w-full font-mono text-sm" rows={2}/>
//                                     <textarea {...register(`visibleTestCases.${index}.explaination`)} placeholder="Explaination" className="textarea textarea-bordered w-full text-sm" rows={3}/>
//                                 </div>
//                             </div>
//                         ))}
//                         <button type="button" onClick={() => appendVisible({ input: '', output: '', explaination: '' })} className="btn btn-primary btn-outline btn-sm w-full flex items-center gap-2">
//                             <PlusCircle className="h-4 w-4" /> Add Visible Case
//                         </button>
//                     </div>
//                 </div>

//                 <div className="divider"></div>

//                 {/* Hidden Test Cases */}
//                 <div>
//                     <h3 className="text-lg font-semibold text-base-content mb-2">Hidden Test Cases</h3>
//                     <p className="text-sm text-base-content/70 mb-4">These cases are used for judging the submission and are not shown to the user.</p>
//                     <div className="space-y-4">
//                         {hiddenFields.map((field, index) => (
//                             <div key={field.id} className="bg-base-200/50 p-4 rounded-lg border border-base-300">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <label className="font-medium text-base-content">Case #{index + 1}</label>
//                                     <button type="button" onClick={() => removeHidden(index)} className="btn btn-ghost btn-sm btn-circle">
//                                         <Trash2 className="h-4 w-4 text-error" />
//                                     </button>
//                                 </div>
//                                 <div className="space-y-2">
//                                     <textarea {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="textarea textarea-bordered w-full font-mono text-sm" rows={2}/>
//                                     <textarea {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="textarea textarea-bordered w-full font-mono text-sm" rows={2}/>
//                                 </div>
//                             </div>
//                         ))}
//                         <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-primary btn-outline btn-sm w-full flex items-center gap-2">
//                             <PlusCircle className="h-4 w-4" /> Add Hidden Case
//                         </button>
//                     </div>
//                 </div>
//             </FormSection>

//             {/* --- Section 3: Code Templates --- */}
//             <FormSection title="3. Code Templates & Solution" icon={<FileCode2 className="text-warning" />}>
//               <div role="tablist" className="tabs tabs-lifted">
//                 {['C++', 'Java', 'JavaScript'].map((lang, index) => (
//                   <React.Fragment key={lang}>
//                     <input type="radio" name="code_tabs" role="tab" className="tab [--tab-bg:theme(colors.base-200)]" aria-label={lang} defaultChecked={index === 0} />
//                     <div role="tabpanel" className="tab-content bg-base-200 border-base-300 rounded-b-box p-6">
//                       <div className="space-y-6">
//                          <div className="form-control">
//                             <label className="label"><span className="label-text font-semibold">Initial Starter Code</span></label>
//                             <div className="mockup-code text-sm">
//                               <textarea {...register(`startCode.${index}.initialCode`)} className="bg-transparent w-full h-48 font-mono outline-none" placeholder={`// ${lang} boilerplate code for the user...`} />
//                             </div>
//                          </div>
//                          <div className="form-control">
//                             <label className="label"><span className="label-text font-semibold">Official Reference Solution</span></label>
//                             <div className="mockup-code text-sm">
//                               <textarea {...register(`referenceSolution.${index}.completeCode`)} className="bg-transparent w-full h-48 font-mono outline-none" placeholder={`// ${lang} complete solution for reference...`} />
//                             </div>
//                          </div>
//                       </div>
//                     </div>
//                   </React.Fragment>
//                 ))}
//               </div>
//             </FormSection>

//             {/* --- Final Action Button (Optional, as it's in the sticky header) --- */}
//             <div className="flex justify-end pt-4">
//               <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
//                  {isSubmitting ? <span className="loading loading-spinner"></span> : (isEditMode ? 'Update Problem' : 'Create Problem')}
//               </button>
//             </div>
//           </div>
//         </main>
//       </form>
//     </div>
//   );
// }

// export default AdminPanel;


// import React, { useEffect, useState } from 'react'; // Make sure React is imported
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import axiosClient from '../utils/axiosClient';
// import { useNavigate, useParams } from 'react-router'; // Import useParams
// import { AlertCircle } from 'lucide-react';
// import { toast } from 'react-toastify';

// // Zod schema remains the same, it's perfect for both create and update.
// const problemSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().min(1, 'Description is required'),
//   difficulty: z.enum(['easy', 'medium', 'hard']),
//   tags: z.enum(['array' , 'dp' , 'linked list' , 'graph' , 'tree']),
//   visibleTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required'),
//       explaination: z.string().min(1, 'Explaination is required')
//     })
//   ).min(1, 'At least one visible test case required'),
//   hiddenTestCases: z.array(
//     z.object({
//       input: z.string().min(1, 'Input is required'),
//       output: z.string().min(1, 'Output is required')
//     })
//   ).min(1, 'At least one hidden test case required'),
//   startCode: z.array(
//     z.object({
//       language: z.string() ,
//       initialCode: z.string().min(1, 'Initial code is required')
//     })
//   ).length(3, 'All three languages required'),
//   referenceSolution: z.array(
//     z.object({
//       language: z.string() ,
//       completeCode: z.string().min(1, 'Complete code is required')
//     })
//   ).length(3, 'All three languages required')
// });

// function AdminPanel() {
//   const navigate = useNavigate();
//   // --- NEW: DETECT MODE ---
//   const { problemId } = useParams(); // Get the ID from the URL, e.g., "68557d4ff54c1ccc373f81ba"
//   const isEditMode = Boolean(problemId); // This will be `true` if problemId exists, `false` otherwise

//   // --- NEW: LOADING STATE ---
//   // Start in a loading state only if we are editing (because we need to fetch data)
//   const [isLoading, setIsLoading] = useState(isEditMode);

//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset // We need `reset` to populate the form with fetched data
//   } = useForm({
//     resolver: zodResolver(problemSchema),
//     // We can keep defaultValues, they are used for the "create" mode
//     defaultValues: {
//       difficulty: 'easy',
//       tags: 'array',
//       visibleTestCases: [{ input: '', output: '', explaination: '' }],
//       hiddenTestCases: [{ input: '', output: '' }],
//       startCode: [
//         { language: 'c++', initialCode: '' }, // A space prevents zod validation error on empty string
//         { language: 'cava', initialCode: '' },
//         { language: 'javascript', initialCode: '' }
//       ],
//       referenceSolution: [
//         { language: 'c++', completeCode: '' },
//         { language: 'java', completeCode: '' },
//         { language: 'javascript', completeCode: '' }
//       ]
//     }
//   });

   

//   // --- NEW: FETCH DATA FOR EDITING ---
//   useEffect(() => {
//     // Only run this effect if we are in edit mode
//     if (isEditMode) {
//       const fetchProblemData = async () => {
//         try {
//           // IMPORTANT: Ensure your backend has this route: GET /problem/:id
//           const { data } = await axiosClient.get(`/problem/problemById/${problemId}`);
          
//           // `reset` is the magic function from react-hook-form to populate all fields
//           // It matches the keys in the `data` object to your `register` names
//           reset(data); 

//         } catch (error) {
//           console.error("Failed to fetch problem data:", error);
//           alert('Failed to load problem data for editing.');
//           navigate('/admin'); // Redirect if the problem can't be found
//         } finally {
//           setIsLoading(false); // Stop loading spinner
//         }
//       };
//       fetchProblemData();
//     }
//   }, [problemId, isEditMode, reset, navigate]);


//   const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
//   const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

//   // --- NEW: UPDATED SUBMISSION LOGIC ---
//   const onSubmit = async (data) => {
  
//     try {
//       if (isEditMode) {
//         // In edit mode, send a PUT request to the update endpoint
//         // IMPORTANT: Ensure your backend has this route: PUT /problem/update/:id
//         await axiosClient.put(`/problem/update/${problemId}`, data);
        
//       toast.success('Problem updated successfully!');
//       } else {
//         // In create mode, send a POST request as before
//         await axiosClient.post('/problem/create', data);
//         alert('Problem created successfully!');
//       }
//       navigate('/admin'); // Navigate back to the admin list after success
//     } catch (error) {
//       alert(`Error: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // --- NEW: LOADING SPINNER ---
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-base-200">
//         <span className="loading loading-lg loading-spinner text-primary"></span>
//       </div>
//     );
//   }

//   // --- THE REST OF THE JSX IS MOSTLY THE SAME, WITH MINOR TEXT CHANGES ---
//   return (
//     <div className="bg-base-200 min-h-screen p-4 sm:p-6 lg:p-8">
//       <div className="container mx-auto">
//         <h1 className="text-4xl font-bold mb-8 text-base-content">
//           {isEditMode ? 'Update Problem' : 'Create New Problem'}
//         </h1>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//           {/* Basic Information Card */}
//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <h2 className="card-title text-2xl mb-4">1. Basic Information</h2>
//               <div className="form-control">
//                 <label className="label"><span className="label-text">Title</span></label>
//                 <input {...register('title')} className={`input input-bordered ${errors.title && 'input-error'}`} />
//                 {errors.title && <span className="text-error mt-1">{errors.title.message}</span>}
//               </div>
//               <div className="form-control">
//                 <label className="label"><span className="label-text">Description (Markdown supported)</span></label>
//                 <textarea {...register('description')} className={`textarea textarea-bordered h-40 ${errors.description && 'textarea-error'}`} />
//                 {errors.description && <span className="text-error mt-1">{errors.description.message}</span>}
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                 <div className="form-control">
//                   <label className="label"><span className="label-text">Difficulty</span></label>
//                   <select {...register('difficulty')} className={`select select-bordered ${errors.difficulty && 'select-error'}`}>
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="hard">Hard</option>
//                   </select>
//                 </div>
//                 <div className="form-control">
//                   <label className="label"><span className="label-text">Tag</span></label>
//                   <select {...register('tags')} className={`select select-bordered ${errors.tags && 'select-error'}`}>
//                     <option value="array">Array</option>
//                     <option value="linked list">Linked List</option>
//                     <option value="graph">Graph</option>
//                     <option value="tree">Tree</option>
//                     <option value="dp">DP</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Test Cases Card (This part works perfectly for both create and edit thanks to react-hook-form) */}
//           <div className="card bg-base-100 shadow-xl">
//              <div className="card-body">
//                 <h2 className="card-title text-2xl mb-4">2. Test Cases</h2>
//                 {/* Visible Test Cases */}
//                 <div className="collapse collapse-plus bg-base-200">
//                   <input type="radio" name="my-accordion-3" defaultChecked /> 
//                   <div className="collapse-title text-xl font-medium">Visible Test Cases</div>
//                   <div className="collapse-content">
//                     {visibleFields.map((field, index) => (
//                       <div key={field.id} className="border-t border-base-300 p-4 space-y-2 relative">
//                         <span className="absolute top-4 left-0 font-bold text-base-content/50">Case #{index + 1}</span>
//                         <button type="button" onClick={() => removeVisible(index)} className="btn btn-xs btn-circle btn-error absolute top-4 right-4">✕</button>
//                         <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
//                         <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
//                         <textarea {...register(`visibleTestCases.${index}.explaination`)} placeholder="Explaination" className="textarea textarea-bordered w-full" />
//                       </div>
//                     ))}
//                     <button type="button" onClick={() => appendVisible({ input: '', output: '', explaination: '' })} className="btn btn-sm btn-primary mt-4">Add Visible Case</button>
//                   </div>
//                 </div>
//                 {/* Hidden Test Cases */}
//                 <div className="collapse collapse-plus bg-base-200 mt-4">
//                   <input type="radio" name="my-accordion-3" /> 
//                   <div className="collapse-title text-xl font-medium">Hidden Test Cases</div>
//                   <div className="collapse-content">
//                     {hiddenFields.map((field, index) => (
//                       <div key={field.id} className="border-t border-base-300 p-4 space-y-2 relative">
//                         <span className="absolute top-4 left-0 font-bold text-base-content/50">Case #{index + 1}</span>
//                         <button type="button" onClick={() => removeHidden(index)} className="btn btn-xs btn-circle btn-error absolute top-4 right-4">✕</button>
//                         <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className="input input-bordered w-full" />
//                         <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className="input input-bordered w-full" />
//                       </div>
//                     ))}
//                     <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-sm btn-primary mt-4">Add Hidden Case</button>
//                   </div>
//                 </div>
//              </div>
//           </div>
          
//           {/* Code Templates (Also works perfectly for both modes) */}
//           <div className="card bg-base-100 shadow-xl">
//              <div className="card-body">
//                 <h2 className="card-title text-2xl mb-4">3. Code Templates</h2>
//                 <div role="tablist" className="tabs tabs-lifted">
//                   {['C++', 'Java', 'JavaScript'].map((lang, index) => (
//                     <React.Fragment key={lang}>
//                       <input type="radio" name="code_tabs" role="tab" className="tab" aria-label={lang} defaultChecked={index === 0} />
//                       <div role="tabpanel" className="tab-content bg-base-200 border-base-300 rounded-b-box p-6">
//                         <div className="form-control mb-4">
//                           <label className="label"><span className="label-text font-semibold">Initial Code (Boilerplate)</span></label>
//                           <div className="mockup-code text-sm">
//                             <textarea {...register(`startCode.${index}.initialCode`)} className="bg-transparent w-full h-48 font-mono" />
//                           </div>
//                         </div>
//                         <div className="form-control">
//                           <label className="label"><span className="label-text font-semibold">Reference Solution</span></label>
//                           <div className="mockup-code text-sm">
//                             <textarea {...register(`referenceSolution.${index}.completeCode`)} className="bg-transparent w-full h-48 font-mono" />
//                           </div>
//                         </div>
//                       </div>
//                     </React.Fragment>
//                   ))}
//                 </div>
//              </div>
//           </div>

//           <button type="submit"  className="btn btn-primary btn-lg w-full">
//             {isSubmitting ? <span className="loading loading-spinner"></span> : (isEditMode ? 'Update Problem' : 'Create Problem')}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AdminPanel;