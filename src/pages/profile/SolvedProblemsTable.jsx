import { Link } from 'react-router';
import { BrainCircuit, ChevronDown, CheckCircle } from 'lucide-react';

const SolvedProblemsTable = ({ problems, difficultyFilter, setDifficultyFilter }) => {
    const getDifficultyClasses = (difficulty) => {
        const base = "px-2.5 py-0.5 inline-block rounded-full text-xs font-semibold capitalize";
        switch (difficulty) {
            case 'easy': return `${base} bg-green-500/20 text-green-300`;
            case 'medium': return `${base} bg-yellow-500/20 text-yellow-300`;
            case 'hard': return `${base} bg-red-500/20 text-red-300`;
            default: return `${base} bg-gray-500/20 text-gray-300`;
        }
    };

    const filteredProblems = (problems || []).filter(problem => 
        difficultyFilter === 'all' || problem.difficulty === difficultyFilter
    );

    // ... (rest of the component is the same)
    return (
      // JSX from previous response
      <div className="bg-card rounded-xl shadow-lg p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">Solved Problems</h2>
                <div className="relative w-full sm:w-48">
                     <select 
                        className="w-full appearance-none bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:cursor-pointer" 
                        value={difficultyFilter} 
                        onChange={e => setDifficultyFilter(e.target.value)}
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
                            <th className="p-4 text-sm font-semibold text-muted-foreground">Title</th>
                            <th className="p-4 text-sm font-semibold text-muted-foreground">Difficulty</th>
                            <th className="p-4 text-sm font-semibold text-muted-foreground">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems.length > 0 ? (
                            filteredProblems.map(problem => (
                                <tr key={problem._id} className="border-b border-border/50 hover:bg-white/5 transition-colors duration-200">
                                    <td className="p-4 text-green-400 font-semibold text-sm flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Solved
                                    </td>
                                    <td className="p-4">
                                        <Link to={`/problem/${problem._id}`} className="font-medium text-foreground hover:text-primary-to transition-colors">
                                            {problem.title}
                                        </Link>
                                    </td>
                                    <td className="p-4"><span className={getDifficultyClasses(problem.difficulty)}>{problem.difficulty}</span></td>
                                    <td className="p-4">
                                        <div className="px-2 py-1 rounded bg-input-background text-muted-foreground text-xs font-medium border border-border">{problem.tags}</div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center p-16">
                                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                        <BrainCircuit className="w-16 h-16"/>
                                        <p className="font-semibold text-lg">No Problems Found</p>
                                        <p>No solved problems match your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SolvedProblemsTable;