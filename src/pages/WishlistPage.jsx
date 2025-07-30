import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/navbar/Navbar';
import Loader from '../components/loader/Loader';
import { CheckCircle, Trash2, BookmarkX, Tag, ExternalLink } from 'lucide-react';

// Re-using the helper function for consistent styling
const getDifficultyClass = (difficulty) => {
  const baseClass = "font-semibold capitalize text-sm";
  switch (difficulty?.toLowerCase()) {
    case 'easy': return `${baseClass} text-teal-400`;
    case 'medium': return `${baseClass} text-amber-400`;
    case 'hard': return `${baseClass} text-rose-400`;
    default: return `${baseClass} text-muted-foreground`;
  }
};

function WishListPage() {
  const [wishlistProblems, setWishlistProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [wishlistRes, solvedRes] = await Promise.all([
          axiosClient.get('/user/wishlist'),
          axiosClient.get('/problem/problemSolvedByUser')
        ]);
        setWishlistProblems(wishlistRes.data || []);
        setSolvedProblems(solvedRes.data?.problemSolved || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setWishlistProblems([]);
        setSolvedProblems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteFromWishlist = async (problemId) => {
    // Optimistic UI Update: Remove the problem from the state immediately
    // for a faster user experience.
    setWishlistProblems(currentProblems => 
      currentProblems.filter(p => p._id !== problemId)
    );

    try {
      // Send the request to the backend to toggle (remove) the problem
      await axiosClient.post('/user/wishlist/toggle', { problemId });
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      // Optional: Add the problem back to the list if the API call fails
      // For now, we'll just log the error. A toast notification would be ideal here.
    }
  };

  if (isLoading) {
    return (
        <Loader />
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl pb-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">
              Your curated list of problems to conquer.
            </p>
          </div>
        </div>

        {wishlistProblems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlistProblems.map((problem) => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);
              return (
                <div 
                  key={problem._id}
                  className="bg-card rounded-lg border border-white/10 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-primary-to/30"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {isSolved && (
                          <CheckCircle 
                            size={20} 
                            className="text-primary-to flex-shrink-0"
                            title="Solved"
                          />
                        )}
                        <NavLink 
                          to={`/problem/${problem._id}`} 
                          className="font-semibold text-lg text-foreground hover:text-white/60 transition-colors"
                        >
                          {problem.title}
                        </NavLink>
                      </div>
                      <button 
                        onClick={() => handleDeleteFromWishlist(problem._id)}
                        className="p-1.5 rounded-full text-muted-foreground cursor-pointer hover:bg-gray-500/60"
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <span className={getDifficultyClass(problem.difficulty)}>
                        {problem.difficulty}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        
                          <div key={problem.tags} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                            <Tag size={12} />
                            {problem.tags}
                          </div>
                    
                      </div>
                    </div>
                  </div>
                  <NavLink 
                    to={`/problem/${problem._id}`}
                    className="flex items-center gap-2 w-full mt-5 text-sm font-semibold text-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 py-2 rounded-md transition-colors"
                  >
                    Solve Problem <ExternalLink size={14} />
                  </NavLink>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center py-24 px-6 min-h-[400px] bg-card rounded-lg border border-dashed border-white/20">
            <BookmarkX className="w-20 h-20 text-muted-foreground/50 mb-4" strokeWidth={1} />
            <h3 className="text-2xl font-semibold text-foreground">Your Wishlist is Empty</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Explore the problems and click the bookmark icon to save them for later.
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-from to-primary-to text-white font-semibold shadow-lg hover:scale-105 transition-transform">
              Explore Problems
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default WishListPage;