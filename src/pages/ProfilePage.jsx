import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import Loader from '../components/loader/Loader';
import Navbar from '../components/navbar/Navbar';

// Import all child components, including our new achievement sections
import UserProfileCard from './profile/UserProfileCard';
import ProfileStats from './profile/ProfileStats';
import { UnlockedAchievementsSection, LockedAchievementsSection } from './profile/AchievementSection'; // <-- NEW
import SolvedProblemsTable from './profile/SolvedProblemsTable';
import EditProfileModal from './profile/EditProfileModal';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [totalProblems, setTotalProblems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [difficultyFilter, setDifficultyFilter] = useState('all');

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const profileResponse = await axiosClient.get('/problem/problemSolvedByUser');
            setProfile(profileResponse.data);
            console.log(profileResponse.data) ;
            setTotalProblems({ easy: 886, medium: 1885, hard: 855 });
            setError('');
        } catch (err) {
            console.error("Failed to fetch profile data:", err);
            setError('Could not load profile data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

   
    useEffect(() => { fetchProfileData(); }, []);
     const handleProfilePicUpdate = (updatedUser) => {
        setProfile(prevProfile => ({
            ...prevProfile, 
            user: updatedUser
        }));
    };

    if (loading) return <Loader />;
    if (error) return <div className="text-center text-destructive">{error}</div>;

    return (
        <>
        <Navbar/>
        <div className="container mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">           
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-8 flex flex-col gap-8">
                        <UserProfileCard 
                            user={profile?.user} 
                            onEditClick={() => setIsEditModalOpen(true)} 
                            onProfilePicUpdate={handleProfilePicUpdate}
                        />
                       
                        <LockedAchievementsSection 
                            stats={profile?.stats}
                        />
                    </div>
                </aside>

                <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
                    
                    <ProfileStats 
                        stats={profile?.stats} 
                    />
                    
                    {/* The unlocked achievements now live here */}
                    <UnlockedAchievementsSection 
                        stats={profile?.stats}
                    />
                    
                    <SolvedProblemsTable
                        problems={profile?.solvedProblems}
                        difficultyFilter={difficultyFilter}
                        setDifficultyFilter={setDifficultyFilter}
                    />
                </main>
            </div>

            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                user={profile?.user} 
                onSave={handleProfilePicUpdate} 
            />
        </div>
        </>
        
    );
};

export default ProfilePage;




// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosClient'; // Ensure this path is correct
// import Loader from '../components/loader/Loader'; // Ensure this path is correct

// // Import all child components
// import UserProfileCard from './profile/UserProfileCard';
// import AchievementsCard from './profile/AchievementsCard';
// import ProfileStats from './profile/ProfileStats';
// import SolvedProblemsTable from './profile/SolvedProblemsTable';
// import EditProfileModal from './profile/EditProfileModal';
// // import ProblemStatsChart from './profile/ProblemStatsChart';

// const ProfilePage = () => {
//     // State management remains the same
//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [difficultyFilter, setDifficultyFilter] = useState('all');
//     const [totalProblems, setTotalProblems] = useState(null); 
//     const [userActivity, setUserActivity] = useState(null);
//     const [monthlyBadges, setMonthlyBadges] = useState([]);

//     // --- Data Fetching using your API call ---
//     const fetchProfileData = async () => {
//         try {
//             setLoading(true);
//             const response = await axiosClient.get('/problem/problemSolvedByUser');
//             setProfile(response.data);
//             setError('');
//             console.log(response.data) ;
//             setTotalProblems({ easy: response.data.stats.easy , medium: response.data.stats.medium , hard: response.data.stats.hard }) ;

//             setMonthlyBadges([
//                 { month: 1, year: 2023, date: '2023-01-31' },
//                 { month: 2, year: 2023, date: '2023-02-28' },
//                 { month: 3, year: 2023, date: '2023-03-31' },
//                 { month: 4, year: 2023, date: '2023-04-30' },
//             ]);
//         } catch (err) {
//             console.error("Failed to fetch profile:", err);
//             setError('Could not load profile data. Please try again later.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProfileData();
//     }, []); // Runs once on component mount

//     // --- Data Update Logic using your API client ---
//     const handleProfileUpdate = async (updatedData) => {
//         try {
//             // NOTE: Your initial code did not specify an update endpoint.
//             // A common RESTful practice is PUT or PATCH to a user-specific endpoint.
//             // Please replace '/user/profile/update' with your actual backend endpoint.
//             const response = await axiosClient.put('/user/profile/update', updatedData);

//             // Optimistically update the UI with the new data from the response
//             // or simply refetch all data for consistency. Refetching is simpler and safer.
//             await fetchProfileData();

//             // Close the modal on success
//             setIsEditModalOpen(false);

//             // Optionally, you can add a success notification (toast) here
//         } catch (err) {
//             console.error("Error updating profile:", err);
//             // Optionally, show an error notification to the user
//             // Re-throw the error so the modal's catch block can also handle it (e.g., stop the saving spinner)
//             throw err;
//         }
//     };

//     if (loading) {
//         return <Loader />;
//     }

//     if (error) {
//         return <div className="container max-w-2xl mx-auto mt-20 p-4 rounded-md bg-destructive/20 text-destructive font-semibold text-center">{error}</div>;
//     }

//     return (
//         <div className="container mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
//                 {/* --- Left Panel --- */}
//                 <aside className="lg:col-span-4 xl:col-span-3">
//                     <div className="flex flex-col gap-8 sticky top-8">
//                         <UserProfileCard 
//                             user={profile?.user} 
//                             onEditClick={() => setIsEditModalOpen(true)} 
//                         />
//                         <AchievementsCard stats={profile?.stats} />
//                     </div>
//                 </aside>

//                 {/* --- Main Content (Right Panel) --- */}
//                 <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
//                     <ProfileStats stats={profile?.stats} />
//                     <SolvedProblemsTable
//                         problems={profile?.solvedProblems}
//                         difficultyFilter={difficultyFilter}
//                         setDifficultyFilter={setDifficultyFilter}
//                     />
//                 </main>
//             </div>

//             {/* --- Render the Edit Profile Modal --- */}
//             <EditProfileModal
//                 isOpen={isEditModalOpen}
//                 onClose={() => setIsEditModalOpen(false)}
//                 user={profile?.user}
//                 onSave={handleProfileUpdate}
//             />
//         </div>
//     );
// };

// export default ProfilePage;



// import { useState, useEffect } from 'react';
// import { Link } from 'react-router'; // Corrected import for modern React Router
// import axiosClient from '../utils/axiosClient';
// import Loader from '../components/loader/Loader';

// // --- ICONS ---
// import { User, Award, CheckCircle, TrendingUp, BarChart, Edit, BrainCircuit, ChevronDown } from 'lucide-react';


// // --- (1) User Profile Card Component (Left Panel) ---
// const UserProfileCard = ({ user, onEditClick }) => (
//     <div className="bg-card rounded-xl shadow-lg p-6 lg:p-8 text-center sticky top-8">
//         {/* Profile Picture */}
//         <div className="relative w-32 h-32 mx-auto mb-4">
//             <div className="w-full h-full rounded-full bg-input-background flex items-center justify-center ring-4 ring-offset-4 ring-primary-from ring-offset-card">
//                 {user?.profilePictureUrl ? (
//                     <img src={user.profilePictureUrl} alt={`${user.name}'s profile`} className="w-full h-full rounded-full object-cover" />
//                 ) : (
//                     <User className="w-16 h-16 text-muted-foreground" />
//                 )}
//             </div>
//         </div>

//         {/* User Info */}
//         <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-from to-primary-to text-transparent bg-clip-text">
//             {user?.name}
//         </h1>
//         <p className="text-muted-foreground mt-1 mb-4">{user?.email}</p>

//         {/* Edit Button */}
//         <button
//             onClick={onEditClick}
//             className="group inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-border bg-transparent text-foreground hover:bg-white/5 hover:border-primary-to transition-all duration-200"
//         >
//             <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary-to transition-colors" />
//             Edit Profile
//         </button>
//     </div>
// );


// // --- (2) Profile Stats Component (Top Section) ---
// // --- (2) Profile Stats Component (Top Section) with Percentages ---
// // This version adds dynamic percentages and progress bars for each difficulty.

// const ProfileStats = ({ stats }) => {
//     // Helper function to safely calculate percentages
//     const calculatePercentage = (count, total) => {
//         if (!total || total === 0) {
//             return 0; // Avoid division by zero
//         }
//         return Math.round((count / total) * 100);
//     };

//     // Calculate percentages for each difficulty
//     const easyPercentage = calculatePercentage(stats?.easy, stats?.total);
//     const mediumPercentage = calculatePercentage(stats?.medium, stats?.total);
//     const hardPercentage = calculatePercentage(stats?.hard, stats?.total);

//     return (
//         <div className="bg-card rounded-xl shadow-lg">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
//                 {/* Total Solved Stat */}
//                 <div className="p-6 flex items-center gap-5 border-b md:border-b-0 md:border-r border-border">
//                     <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-from/10 flex items-center justify-center">
//                         <Award className="w-7 h-7 text-primary-from" />
//                     </div>
//                     <div className="w-full">
//                         <div className="text-sm text-muted-foreground">Total Solved</div>
//                         <div className="text-2xl font-bold text-foreground">{stats?.total || 0}</div>
//                         {/* Progress bar for Total is always 100% */}
//                         <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
//                             <div className="bg-gradient-to-r from-primary-from to-primary-to h-1.5 rounded-full" style={{ width: '100%' }}></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Easy Stat with Percentage */}
//                 <div className="p-6 flex items-center gap-5 border-b md:border-b-0 lg:border-r border-border">
//                     <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
//                         <CheckCircle className="w-7 h-7 text-green-400" />
//                     </div>
//                     <div className="w-full">
//                         <div className="flex justify-between items-baseline">
//                             <span className="text-sm text-muted-foreground">Easy</span>
//                             <span className="text-sm font-semibold text-green-400">{easyPercentage}%</span>
//                         </div>
//                         <div className="text-2xl font-bold text-green-400">{stats?.easy || 0}</div>
//                         <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
//                             <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${easyPercentage}%` }}></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Medium Stat with Percentage */}
//                 <div className="p-6 flex items-center gap-5 border-b md:border-b-0 md:border-r border-border">
//                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
//                         <TrendingUp className="w-7 h-7 text-yellow-400" />
//                     </div>
//                     <div className="w-full">
//                         <div className="flex justify-between items-baseline">
//                             <span className="text-sm text-muted-foreground">Medium</span>
//                             <span className="text-sm font-semibold text-yellow-400">{mediumPercentage}%</span>
//                         </div>
//                         <div className="text-2xl font-bold text-yellow-400">{stats?.medium || 0}</div>
//                         <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
//                             <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${mediumPercentage}%` }}></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Hard Stat with Percentage */}
//                 <div className="p-6 flex items-center gap-5">
//                     <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
//                         <BarChart className="w-7 h-7 text-red-400" />
//                     </div>
//                     <div className="w-full">
//                         <div className="flex justify-between items-baseline">
//                             <span className="text-sm text-muted-foreground">Hard</span>
//                             <span className="text-sm font-semibold text-red-400">{hardPercentage}%</span>
//                         </div>
//                         <div className="text-2xl font-bold text-red-400">{stats?.hard || 0}</div>
//                         <div className="w-full bg-input-background rounded-full h-1.5 mt-2">
//                             <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${hardPercentage}%` }}></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };


// // --- (3) Solved Problems Table Component (Main Content) ---
// const SolvedProblemsTable = ({ problems, difficultyFilter, setDifficultyFilter, tagFilter, setTagFilter }) => {
    
//     const getDifficultyClasses = (difficulty) => {
//         const baseClasses = "px-2.5 py-0.5 inline-block rounded-full text-xs font-semibold";
//         switch (difficulty) {
//             case 'easy': return `${baseClasses} bg-green-500/20 text-green-300`;
//             case 'medium': return `${baseClasses} bg-yellow-500/20 text-yellow-300`;
//             case 'hard': return `${baseClasses} bg-red-500/20 text-red-300`;
//             default: return `${baseClasses} bg-gray-500/20 text-gray-300`;
//         }
//     };

//     const filteredProblems = (problems || []).filter(problem => {
//         const difficultyMatch = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
//         const tagMatch = tagFilter === '' || problem.tags ;
//         return difficultyMatch && tagMatch;
//     });

//     return (
//         <div className="bg-card rounded-xl shadow-lg p-6 lg:p-8">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//                 <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">Solved Problems</h2>
//                 <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//                     <div className="relative w-full sm:w-48  ">
//                          <select 
//                             className="w-full appearance-none bg-[var(--input-background)] border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:cursor-pointer" 
//                             value={difficultyFilter} 
//                             onChange={e => setDifficultyFilter(e.target.value)}
//                         >
//                             <option value="all">All Difficulties</option>
//                             <option value="easy">Easy</option>
//                             <option value="medium">Medium</option>
//                             <option value="hard">Hard</option>
//                         </select>
//                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
//                     </div>
                    
//                 </div>
//             </div>

//             <div className="overflow-x-auto">
//                 <table className="w-full text-left min-w-[640px]">
//                     <thead className="border-b border-border">
//                         <tr>
//                             <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
//                             <th className="p-4 text-sm font-semibold text-muted-foreground">Title</th>
//                             <th className="p-4 text-sm font-semibold text-muted-foreground">Difficulty</th>
//                             <th className="p-4 text-sm font-semibold text-muted-foreground">Tags</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredProblems.length > 0 ? (
//                             filteredProblems.map(problem => (
//                                 <tr key={problem._id} className="border-b border-border/50 hover:bg-white/5 transition-colors duration-200">
//                                     <td className="p-4 text-green-400 font-semibold text-sm">Solved</td>
//                                     <td className="p-4">
//                                         <Link to={`/problem/${problem._id}`} className="font-medium text-foreground hover:text-primary-to transition-colors">
//                                             {problem.title}
//                                         </Link>
//                                     </td>
//                                     <td className="p-4"><span className={getDifficultyClasses(problem.difficulty)}>{(problem.difficulty).toUpperCase()}</span></td>
//                                     <td className="p-4">
//                                         <div className="flex flex-wrap gap-2">
//                                             {/* {problem.tags.slice(0, 3).map(tag => ( */}
//                                                 <div key={problem.tags} className="px-2 py-1 rounded bg-input-background text-muted-foreground text-xs font-medium border border-border">{problem.tags}</div>
//                                             {/* ))} */}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="4" className="text-center p-16">
//                                     <div className="flex flex-col items-center gap-4 text-muted-foreground">
//                                         <BrainCircuit className="w-16 h-16"/>
//                                         <p className="font-semibold text-lg">No Problems Found</p>
//                                         <p>No solved problems match your filters.</p>
//                                     </div>
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };


// // --- (4) Main Profile Page Component ---
// const ProfilePage = () => {
//     // --- State management from your original code ---
//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [difficultyFilter, setDifficultyFilter] = useState('all');
//     const [tagFilter, setTagFilter] = useState('');

//     // --- Data fetching logic from your original code ---
//     useEffect(() => {
//         const fetchProfileData = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axiosClient.get('/problem/problemSolvedByUser');
//                 setProfile(response.data);
//                 setError(''); // Clear any previous errors on success
//             } catch (err) {
//                 console.error("Failed to fetch profile:", err);
//                 setError('Could not load profile data. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProfileData();
//     }, []); // Empty dependency array ensures this runs once on mount.

//     if (loading) {
//         return (
//             <Loader></Loader>
//         );
//     }

//     if (error) {
//         return <div className="container max-w-2xl mx-auto mt-20 p-4 rounded-md bg-destructive/20 text-destructive font-semibold text-center">{error}</div>;
//     }

//     return (
//         <div className="container mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//                 <aside className="lg:col-span-4 xl:col-span-3">
//                     <UserProfileCard 
//                         user={profile?.user} 
//                         onEditClick={() => setIsEditModalOpen(true)} 
//                     />
//                 </aside>

//                 <main className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
//                     <ProfileStats stats={profile?.stats} />
//                     <SolvedProblemsTable
//                         problems={profile?.solvedProblems}
//                         difficultyFilter={difficultyFilter}
//                         setDifficultyFilter={setDifficultyFilter}
//                         tagFilter={tagFilter}
//                         setTagFilter={setTagFilter}
//                     />
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default ProfilePage;






// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosClient';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router';
// import { useForm } from 'react-hook-form';

// // --- User Profile Card Component (Left Panel) ---
// const UserProfileCard = ({ user, stats, onEditClick }) => (
//     <div className="card bg-base-200 shadow-xl p-6">
//         <div className="flex flex-col items-center space-y-4">
//             <div className="avatar">
//                 <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
//                     {/* Placeholder SVG Icon */}
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full p-4 text-primary">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
//                     </svg>
//                 </div>
//             </div>
//             <h1 className="text-3xl font-bold">{user?.name}</h1>
//             <p className="text-base-content/70">{user?.email}</p>
//             <button onClick={onEditClick} className="btn btn-primary btn-outline btn-sm">Edit Profile</button>
//         </div>

//         <div className="divider my-6">Stats</div>

//         <div className="stats stats-vertical shadow">
//             <div className="stat">
//                 <div className="stat-title">Total Solved</div>
//                 <div className="stat-value text-primary">{stats?.total}</div>
//                 <div className="stat-desc">Problems</div>
//             </div>
//             <div className="stat">
//                 <div className="stat-title">Easy</div>
//                 <div className="stat-value text-success">{stats?.easy}</div>
//             </div>
//             <div className="stat">
//                 <div className="stat-title">Medium</div>
//                 <div className="stat-value text-warning">{stats?.medium}</div>
//             </div>
//             <div className="stat">
//                 <div className="stat-title">Hard</div>
//                 <div className="stat-value text-error">{stats?.hard}</div>
//             </div>
//         </div>
//     </div>
// );

// // --- Main Profile Page Component ---
// const ProfilePage = () => {
//     const [profile, setProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//     // Filters for the problem list
//     const [difficultyFilter, setDifficultyFilter] = useState('all');
//     const [tagFilter, setTagFilter] = useState('');

//     useEffect(() => {
//         const fetchProfileData = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axiosClient.get('/problem/problemSolvedByUser');
//                 setProfile(response.data);
//                 setError('');
//             } catch (err) {
//                 console.error("Failed to fetch profile:", err);
//                 setError('Could not load profile data. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProfileData();
//     }, []);

//     // const handleProfileUpdate = async (data) => {
//     //     try {
//     //         const response = await axiosClient.put('/user/profile', data);
//     //         // Update the profile state with the new user data
//     //         setProfile(prev => ({ ...prev, user: response.data }));
//     //         setIsEditModalOpen(false); // Close modal on success
//     //     } catch (error) {
//     //         console.error('Failed to update profile:', error);
//     //         // Optionally, show an error message in the modal
//     //     }
//     // };
    
//     const getDifficultyClass = (difficulty) => {
//         if (difficulty === 'easy') return 'badge-success';
//         if (difficulty === 'medium') return 'badge-warning';
//         if (difficulty === 'hard') return 'badge-error';
//         return 'badge-ghost';
//     };

//     const filteredProblems = profile?.solvedProblems?.filter(problem => {
//         const difficultyMatch = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
//         const tagMatch = tagFilter === '' || problem.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
//         return difficultyMatch && tagMatch;
//     }) || [];

//     if (loading) {
//         return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
//     }

//     if (error) {
//         return <div className="text-center mt-20 text-error">{error}</div>;
//     }

//     return (
//         <div className="container mx-auto p-4 md:p-8">
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//                 {/* Left Column */}
//                 <div className="lg:col-span-4 xl:col-span-3">
//                     <UserProfileCard user={profile?.user} stats={profile?.stats} onEditClick={() => setIsEditModalOpen(true)} />
//                 </div>

//                 {/* Right Column */}
//                 <div className="lg:col-span-8 xl:col-span-9">
//                     <div className="card bg-base-200 shadow-xl p-6">
//                         <h2 className="text-2xl font-bold mb-6">Solved Problems</h2>
                        
//                         {/* Filters */}
//                         <div className="flex flex-wrap gap-4 mb-6 items-center">
//                            <select className="select select-bordered w-full max-w-xs" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
//                                 <option value="all">All Difficulties</option>
//                                 <option value="easy">Easy</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="hard">Hard</option>
//                             </select>
//                              <input 
//                                 type="text" 
//                                 placeholder="Filter by tag (e.g., Array)" 
//                                 className="input input-bordered w-full max-w-xs"
//                                 value={tagFilter}
//                                 onChange={e => setTagFilter(e.target.value)}
//                             />
//                         </div>

//                         {/* Problems Table */}
//                         <div className="overflow-x-auto">
//                             <table className="table w-full">
//                                 <thead>
//                                     <tr>
//                                         <th>Status</th>
//                                         <th>Title</th>
//                                         <th>Difficulty</th>
//                                         <th>Tags</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredProblems.length > 0 ? (
//                                         filteredProblems.map(problem => (
//                                             <tr key={problem._id} className="hover">
//                                                 <td><span className="text-success">✔ Solved</span></td>
//                                                 <td>
//                                                     <Link to={`/problem/${problem.slug}`} className="link link-hover">
//                                                         {problem.title}
//                                                     </Link>
//                                                 </td>
//                                                 <td><span className={`badge ${getDifficultyClass(problem.difficulty)}`}>{problem.difficulty}</span></td>
//                                                 <td>
//                                                     <div className="flex flex-wrap gap-1">
//                                                         {/* {problem.tags.map(tag => <div key={tag} className="badge badge-outline">{tag}</div>)} */}
//                                                         {problem.tags}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="4" className="text-center p-8">
//                                                 No solved problems match your filters. Keep coding!
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProfilePage;