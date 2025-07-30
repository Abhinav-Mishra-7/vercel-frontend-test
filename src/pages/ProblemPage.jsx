import { useState, useEffect , useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import Editor from '@monaco-editor/react';
import { Allotment } from "allotment";
import "allotment/dist/style.css"; 
import { FileText, BookOpen, FlaskConical, History, Bot, Code2, TerminalSquare, 
    CheckCircle2, Loader2, AlertTriangle, Timer, MemoryStick, CheckCircle, XCircle 
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import EditorialPage from './EditorialPage';
import Solutions from '../components/Solutions';
import { fetchEditorialData} from '../editorialSlice';
import CountdownTimer from '../components/contest/CountDownTimer';
import Loader from "../components/loader/Loader"
import Navbar2 from '../components/navbar/Navbar2';

// Custom hook to check screen size for responsiveness (No changes needed here)
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [matches, query]);
    return matches;
};

const langMap = { cpp: 'cpp', java: 'java', javascript: 'javascript' };

const LeftPanel = ({ problem, activeLeftTab, setActiveLeftTab, videoMetaData, problemId, chatMsg, setChatMsg, isDesktop ,  submissions,submissionsLoading,submissionsError }) => {

    // Adding this at the top of ProblemPage component
    const { contestId } = useParams();
    const isContestMode = !!contestId;

    // Then modify the tabs to conditionally disable some
    const leftTabs = [
    { id: 'description', label: 'Description', Icon: FileText, color: 'text-blue-400' },
    ...(isContestMode ? [] : [
        { id: 'editorial', label: 'Editorial', Icon: BookOpen, color: 'text-amber-400' },
        { id: 'solutions', label: 'Solutions', Icon: FlaskConical, color: 'text-blue-400' },
        { id: 'chatai', label: 'ChatAI', Icon: Bot, color: 'text-teal-400' }
    ]),
    { id: 'submissions', label: 'Submissions', Icon: History, color: 'text-purple-400' }
    ];

    const [hoveredTab, setHoveredTab] = useState(null);

    const getDifficultyClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-teal-400';
            case 'medium': return 'text-amber-400';
            case 'hard': return 'text-rose-400';
            default: return 'text-muted-foreground';
        }
    };
    
    return (
        <div className={`flex flex-col bg-[#3b3b3b] ${isDesktop ? 'h-full' : 'rounded-lg overflow-hidden'} `}>
            <div className="flex-shrink-0 border-b border-white/10">
                <div className="flex p-0.5 items-center rounded-s-lg rounded-e-lg overflow-x-auto whitespace-nowrap hide-scrollbar" onMouseLeave={() => setHoveredTab(null)}>
                    {leftTabs.map(({ id, label, Icon, color }, index) => (
                        <div key={id} className="flex items-center hover:bg-white/10 hover:rounded-lg">
                            <button  onMouseEnter={() => setHoveredTab(id)}
                                onClick={() => setActiveLeftTab(id)}
                                className={`flex hover:cursor-pointer rounded-lg  items-center gap-2 px-3.5 py-2 text-sm font-medium transition-colors ${
                                    activeLeftTab === id ? 'text-foreground' : 'text-muted-foreground '
                                }`}
                            >
                                <Icon
                                    size={18}
                                    className={`${activeLeftTab === id ? color : 'text-muted-foreground/80'}`}
                                />
                                <span>{label}</span>
                            </button>
                            {index < leftTabs.length - 1 && 
                             hoveredTab !== id && 
                             hoveredTab !== leftTabs[index + 1]?.id ? (
                                <div className="h-5 w-px bg-white/20 transition-opacity duration-200"></div>
                            ) : ( <div className="h-5 w-px bg-white/1 transition-opacity duration-200"></div>)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-card/80 overflow-y-scroll p-4 hide-scrollbar">
                 {problem && (
                    <>
                        {activeLeftTab === 'description' && (
                             <div>
                                <h1 className="text-2xl font-bold text-foreground mb-3">{problem.title}</h1>
                                <div className="flex items-center flex-wrap gap-4 mb-6">
                                    <span className='bg-white/10 px-2 py-0.5 rounded-2xl box-border capitalize text-white/70 ' > {problem.tags} </span>
                                    <span className={` bg-white/10 px-2 py-0.5 rounded-2xl box-border capitalize ${getDifficultyClass(problem.difficulty)}`}>{problem.difficulty}</span>
                                </div>
                                <div className="space-y-4 text-foreground/80 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: problem.description }} />
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-foreground">Examples:</h3>
                                    <div className="space-y-4">
                                        {/* --- STYLE UPDATE: Example Boxes --- */}
                                        {problem.visibleTestCases.map((example, index) => (
                                            <div key={index} className=" bg-[var(--input-background)] p-4 rounded-lg border-none">
                                                <h4 className="font-semibold mb-3 text-foreground">Example {index + 1}:</h4>
                                                <div className="space-y-3 text-s font-mono text-muted-foreground">
                                                    <div className="flex items-start gap-2">
                                                        <div><strong className="text-foreground/80 mr-2">Input:</strong>{example.input}</div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div><strong className="text-foreground/80 mr-2">Output:</strong>{example.output}</div>
                                                    </div>
                                                    {example.explanation && 
                                                        <div className="pt-2 border-t border-slate-700/60">
                                                            <strong className="text-foreground/80">Explanation:</strong> 
                                                            <span className="text-muted-foreground/80 ml-2">{example.explanation}</span>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeLeftTab === 'editorial' && !isContestMode && (videoMetaData ? <EditorialPage problemId={problemId} /> : <p className="text-muted-foreground">No editorial has been uploaded yet.</p>)}

                        {activeLeftTab === 'submissions' && (
                            <SubmissionHistory 
                                submissions={submissions}
                                loading={submissionsLoading}
                                error={submissionsError}
                            />
                        )}

                        {activeLeftTab === 'solutions' && !isContestMode && <Solutions problem={problem} ></Solutions> }

                        {activeLeftTab === 'chatai' && !isContestMode && <ChatAi problem={problem} chatMsg={chatMsg} setChatMsg={setChatMsg} />}
                    </>
                )}
            </div>
        </div>
    );
};

const TestCasePanel = ({ result, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="animate-spin h-8 w-8 mb-4" />
                <p className="text-lg">Running against test cases...</p>
            </div>
        );
    }
    
    if (!result) {
        return <div className="p-5 text-md text-muted-foreground font-bold">Click 'Run' to execute your code against the example test cases.</div>;
    }
    
    // Handle a general failure (e.g., server error, timeout)
    if (result.error) {
        return (
            <div className="p-5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-700 border-none text-white">
                    <XCircle size={24} />
                    <h3 className="text-2xl font-bold">Execution Failed</h3>
                </div>
                <p className="mt-4 p-4 bg-[var(--input-background)] rounded-lg text-red-400 font-mono">{result.error}</p>
            </div>
        );
    }

    // Main display logic for test case results
    return (
        <div className="p-4 overflow-y-auto">
            <div className={`flex items-center gap-3 p-3 rounded-lg mb-6 border ${result.success ? 'bg-green-600 border-none text-white' : 'bg-red-700 border-none text-white'}`}>
                {result.success ? <CheckCircle size={24} /> : <XCircle size={24} />}
                <h3 className="text-2xl font-bold">{result.success ? "All Test Cases Passed!" : "One or more test cases failed."}</h3>
            </div>
            
            <div className="space-y-4">
                {result.testCases.map((tc, index) => (
                     <div key={index} className="bg-[var(--input-background)] p-4 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="font-semibold text-foreground">Test Case {index + 1}</h4>
                           <span className={`flex items-center gap-2 font-bold text-m ${tc.status.id === 3 ? 'text-green-400' : 'text-red-500'}`}>
                                {tc.status.id === 3 ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                {tc.status.description}
                           </span>
                        </div>
                         <div className="space-y-2 text-s break-words text-muted-foreground font-mono " >
                             <p><strong className="text-foreground/50 w-20 me-3 ">Input :</strong>{tc.stdin}</p>
                             <p><strong className="text-foreground/50 w-20 me-3 ">Expected :</strong> {tc.expected_output}</p>
                             <p><strong className="text-foreground/50 w-20 me-3 ">Your Output :</strong> {tc.stdout || 'No output'}</p>
                             {(tc.compile_output || tc.stderr) && (
                                <div className="pt-2 border-t border-slate-700/60 mt-2 text-red-400">
                                    <strong className="text-red-300">Error Details:</strong>
                                    <pre className="whitespace-pre-wrap mt-1">{tc.compile_output || tc.stderr}</pre>
                                </div>
                             )}
                         </div>
                     </div>
                ))}
            </div>
        </div>
    );
};

const ResultPanel = ({ result, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="animate-spin h-8 w-8 mb-4" />
                <p className="text-lg">Submitting & Evaluating...</p>
            </div>
        );
    }
    if (!result) {
        return <div className="p-5 text-muted-foreground font-sans font-bold">Submit your code to see the evaluation result.</div>;
    }
    
    const isAccepted = result.status === 'accepted';

    return (
        <div className="p-4 overflow-y-auto">
            {/* Main Status Banner */}
            <div className={`flex items-center gap-4 p-4 rounded-lg mb-6 border ${isAccepted ? 'bg-green-600 border-none text-white' : 'bg-red-700 border-none text-white'}`}>
                {isAccepted ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                <div>
                    <h2 className="text-3xl font-bold">
                        {isAccepted ? 'Accepted' : (result.error?.status || 'Rejected')}
                    </h2>
                    <p className="text-sm opacity-90">{result.passedTestCases} / {result.totalTestCases} Test Cases Passed</p>
                </div>
            </div>

            {/* Stats Boxes */}
            <div className="flex flex-wrap gap-4 text-sm mb-6">
                <div className="flex-1 bg-slate-700 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
                    <Timer size={24} className="text-slate-400"/>
                    <div>
                        <p className="text-muted-foreground mb-1">Execution Time</p>
                        <p className="text-foreground text-lg font-semibold">{result.runtime || 0} sec</p>
                    </div>
                </div>
                <div className="flex-1 bg-slate-700 p-4 rounded-lg flex items-center gap-4 border border-slate-700">
                    <MemoryStick size={24} className="text-slate-400"/>
                    <div>
                        <p className="text-muted-foreground mb-1">Memory</p>
                        <p className="text-foreground text-lg font-semibold">{result.memory || 0} KB</p>
                    </div>
                </div>
            </div>

            {/* Error Details Panel (only shows if there's an error) */}
            {!isAccepted && result.error?.details && (
                 <div className="bg-[var(--input-background)] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Failure Details</h3>
                    <pre className="text-red-400 bg-black/20 p-3 rounded-md font-mono text-sm whitespace-pre-wrap">
                        {result.error.details}
                    </pre>
                </div>
            )}
        </div>
    );
};


const RightPanel = ({ code, selectedLanguage, handleLanguageChange, handleEditorChange, handleRun, handleSubmitCode, activeRightTab, setActiveRightTab, loading, runResult, submitResult, isDesktop , isContestMode , contestEndTime, onContestEnd }) => {

    const [hoveredTab, setHoveredTab] = useState(null);
    const rightTabs = [
        { id: 'code', label: 'Code', Icon: Code2, color: 'text-teal-400' },
        { id: 'testcase', label: 'Testcase', Icon: TerminalSquare, color: 'text-amber-400' },
        { id: 'result', label: 'Result', Icon: CheckCircle2, color: 'text-blue-400' }
    ];

    return (
        <div className={`flex flex-col ml-1 bg-[#3b3b3b] ${isDesktop ? 'h-full' : 'rounded-lg overflow-hidden'} rounded-xl`}>
             <div className="flex-shrink-0  border-b border-white/10">
                <div onMouseLeave={() => setHoveredTab(null)} className="flex p-0.5 items-center rounded-s-lg rounded-e-lg overflow-x-auto whitespace-nowrap hide-scrollbar  px-2 ">
                    {rightTabs.map(({ id, label, Icon, color } , index) => (
                        <div key={id} className="flex items-center hover:bg-white/10 hover:rounded-lg">

                            <button onMouseEnter={() => setHoveredTab(id)}
                            key={id}
                            onClick={() => setActiveRightTab(id)}
                            className={`flex hover:cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                activeRightTab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon
                                size={16}
                                className={`${activeRightTab === id ? color : 'text-muted-foreground/80'}`}
                            />
                            <span>{label}</span>
                        </button>

                        {index < rightTabs.length-1 && 
                             hoveredTab !== id && 
                             hoveredTab !== rightTabs[index+1]?.id ? (
                                <div className="h-5 w-px bg-white/20 transition-opacity duration-200"></div>
                            ) : ( <div className="h-5 w-px bg-white/1 transition-opacity duration-200"></div>)}

                        </div>  
                    ))}    
                    {isContestMode && contestEndTime && (<CountdownTimer from={'problemPage'} targetDate={contestEndTime} onEnd={onContestEnd}/>)}
                </div>
            </div>
            <div className="flex-1 bg-card flex  flex-col min-h-0 rounded-b-xl">
                 {activeRightTab === 'code' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-shrink-0 flex gap-2 items-center p-2 border-b border-white/10 ">
                            {['cpp' , 'java' , 'javascript'].map((lang) => (
                                <button key={lang} onClick={() => handleLanguageChange(lang)} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors hover:cursor-pointer ${selectedLanguage === lang ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/7'}`}>
                                    {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                                </button>
                            ))}
                        </div>
                        <div className="flex-grow">
                            <Editor 
                                height="100%" 
                                language={selectedLanguage} 
                                value={code} 
                                onChange={handleEditorChange} 
                                theme="vs-dark" 
                                options={{ 
                                    fontSize: 15.6, 
                                    minimap: { enabled: false },
                                    fontFamily: " 'Roboto Mono', 'Courier New', monospace ",
                                    fontLigatures: true,
                                    padding: { top: 15 } ,
                                    fontWeight: 16
                                }} 
                            />
                        </div>
                    </div>
                )}
                 {activeRightTab === 'testcase' && <TestCasePanel result={runResult} isLoading={loading} />}
                 {activeRightTab === 'result' && <ResultPanel result={submitResult} isLoading={loading} />}

                 <div className="flex-shrink-0 p-3 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={handleRun} disabled={loading} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-white/10 hover:cursor-pointer text-foreground hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {loading && activeRightTab === 'testcase' && <Loader2 className="animate-spin" size={16} />}
                        {loading && activeRightTab === 'testcase' ? 'Running...' : 'Run'}
                    </button>
                    <button onClick={handleSubmitCode} disabled={loading} className="px-4 py-1.5 hover:cursor-pointer rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                         {loading && activeRightTab === 'result' && <Loader2 className="animate-spin" size={16} />}
                         {loading && activeRightTab === 'result' ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const stripWrapper = (code, language) => {
    // This function only applies to C++ and Java, which use class wrappers.
    if (language === 'cpp' || language === 'java') {
        const classRegex = /class\s+Solution\s*\{([\s\S]*)\}/s;
        
        const match = code.match(classRegex);

        // If a match is found, 'match[1]' will contain the captured group (the code inside the braces).
        if (match && match[1]) {
            // .trim() removes any leading/trailing whitespace from the extracted code.
            return match[1].trim();
        }
    }
    
    // For JavaScript or if no wrapper is found, return the code as-is.
    return code;
};

const ProblemPage = () => {
    const dispatch = useDispatch() ;
    const navigate = useNavigate() ;
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const { problemId } = useParams();
    const {contestId} = useParams() ;
    const [contestEndTime, setContestEndTime] = useState(null);
    const [chatMsg, setChatMsg] = useState([]);
    const [videoMetaData, setVideoMetaData] = useState({});

    const [submissions, setSubmissions] = useState(null); 
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [submissionsError, setSubmissionsError] = useState(null);

    const isContestMode = !!contestId ; 
    const [contest, setContest] = useState(null);


    useEffect(() => {
        if (!isContestMode) return;
        const fetchContestDetails = async () => {
            try {
                // IMPORTANT: Use your actual API endpoint here
                const {data} = await axiosClient.get(`/contest/${contestId}`);
                // IMPORTANT: Ensure your API returns an 'endTime' in a format Date() can parse (like ISO 8601 string)
                console.log(data) ;
                setContest(data.contest);
                const startTime = new Date(data.contest.startTime) ;
                const endTime = startTime.getTime() + data.contest.duration * 60000 ;
                setContestEndTime(endTime); 
            } catch (error) {
                console.error("Failed to fetch contest details:", error);
                navigate(`/contest/${contestId}`); // Redirect if contest is invalid
            }
        };
        fetchContestDetails();
    }, [contestId, isContestMode, navigate]);

    // 6. Define the function to run when the contest ends
    const handleContestEnd = useCallback(() => {
        navigate(`/contest/${contestId}`, { 
            state: { contestEnded: true },
            replace: true 
        });
    }, [navigate, contestId]);

    useEffect(() => {
        if (problemId && !isContestMode) {
            dispatch(fetchEditorialData(problemId));
        }
    }, [problemId, dispatch , isContestMode]);

    const isDesktop = useMediaQuery('(min-width: 1024px)');  

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;
            setIsPageLoading(true);
            try {
                const response = await axiosClient.get(`/problem/problemById/${problemId}`);
                const initialCode = response.data?.startCode.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
                setProblem(response.data);
                setCode(initialCode);
            } catch (error) {
                console.error('Error fetching problem:', error);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]);

    useEffect(() => {
        if (problem) {
            const newCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
            setCode(newCode);
        }
    }, [selectedLanguage, problem]);

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
    };

    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);
        setActiveRightTab('testcase');
        
        try {
            // This POST request now hits the corrected backend controller
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language: selectedLanguage
            });

            // The backend correctly returns { message: '...', results: [...] }
            const rawResults = response.data.results;

            // Determine overall success by checking if every result was "Accepted"
            const allPassed = rawResults.every(res => res.status.id === 3);

            // Combine the raw Judge0 results with our original test case data
            // so the UI has everything it needs to display.
            const processedTestCases = rawResults.map((result, index) => {
                const originalTestCase = problem.visibleTestCases[index];
                return {
                    ...result, // Contains status, stdout, stderr, compile_output, etc.
                    // We add these from our own data for display purposes
                    stdin: originalTestCase.input,
                    expected_output: originalTestCase.output,
                };
            });

            // Set the final, clean state for the UI to consume
            setRunResult({
                success: allPassed,
                testCases: processedTestCases,
            });

        } catch (error) {
            console.error('Error running code:', error);
            setRunResult({
                success: false,
                // Display the specific error message from the backend if it exists
                error: error.response?.data?.message || 'An error occurred while running your code.',
                testCases: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = useCallback(async () => {
        // Only fetch if data is not already loaded
        if (submissions !== null) return; 

        setSubmissionsLoading(true);
        setSubmissionsError(null);
        try {
            const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
            setSubmissions(response.data);
        } catch (err) {
            setSubmissionsError('Failed to fetch submission history');
            console.error(err);
        } finally {
            setSubmissionsLoading(false);
        }
    }, [problemId, submissions]); 

    useEffect(() => {
        if (activeLeftTab === 'submissions') {
            fetchSubmissions();
        }
    }, [activeLeftTab, fetchSubmissions]);

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);
        setActiveRightTab('result');

        // --- FIX: Strip the class wrapper before sending ---
        const codeToSend = stripWrapper(code, selectedLanguage);

        console.log(problemId) ;

        try {
            // The backend now expects the 'code' field to be just the function
            const response = await axiosClient.post(`/submission/submit/${problemId}`, {
                code: codeToSend, 
                language: selectedLanguage,
                contestId: contestId,
            });

            // The backend sends a clean, processed result
            setSubmitResult(response.data);
            
            // Invalidate the submissions history so it refetches with the new result
            setSubmissions(null); 
        } catch (error) {
            console.error('Error submitting code:', error);
            setSubmitResult({
                status: 'rejected',
                error: { status: "Submission Error", details: error.response?.data?.message || "Could not connect to the server." },
                passedTestCases: 0,
                totalTestCases: problem?.hiddenTestCases?.length || 'N/A'
            });
        } finally {
            setLoading(false);
        }
    };

    // const startTime = new Date(contest.startTime);
    

    if (isPageLoading) {
        return (
            <Loader></Loader>
        );
    }

    const leftPanelProps = { problem, activeLeftTab, setActiveLeftTab, videoMetaData, problemId, chatMsg, setChatMsg, isDesktop , submissions , submissionsLoading , submissionsError , isContestMode};

    const rightPanelProps = { code, selectedLanguage, handleLanguageChange, handleEditorChange, activeRightTab,setActiveRightTab, isDesktop,handleRun, handleSubmitCode, loading, runResult, submitResult ,  isContestMode, 
        contestEndTime, onContestEnd: handleContestEnd };

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-black/75 ">
            <Navbar2/>
            <div className="flex-grow min-h-0 px-2.5 pb-2">
                {isDesktop ? (
                    <Allotment>
                        <Allotment.Pane minSize={400} className='bg-black/75 rounded-xl'>
                            <LeftPanel {...leftPanelProps} />
                        </Allotment.Pane>
                        <Allotment.Pane minSize={400} className='bg-black/75 rounded-xl'>
                            <RightPanel {...rightPanelProps} />
                        </Allotment.Pane>
                    </Allotment>
                ) : (
                    <div className="w-full h-full overflow-y-auto p-1.5 md:p-4 space-y-4">
                        <LeftPanel {...leftPanelProps} />
                        <RightPanel {...rightPanelProps} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemPage;



