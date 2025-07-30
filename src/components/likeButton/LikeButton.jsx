import { useState } from "react";

{/* Enhanced LikeButton Component with Thumbs-up Icon */}
const LikeButton = ({ onLike, likesCount, isLiked }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    onLike();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-1.5 focus:outline-none ${
        isLiked ? 'text-pink-400' : 'text-gray-400 hover:text-gray-500'
      }`}
    >
      <div className="relative">
        {/* Animation layer */}
        <div className={`
          ${isAnimating ? 'animate-ping' : ''}
          absolute inset-0 bg-pink-400 opacity-0 rounded-full
        `}></div>
        
        {/* Thumbs-up icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-8 w-8 transition-all duration-300 cursor-pointer ${
            isAnimating ? 'scale-125 rotate-[15deg]' : 'scale-100 rotate-0'
          }`}
          fill={isLiked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isLiked ? 0 : 2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </div>
      
      {/* Like counter */}
      <span className={`text-md font-medium transition-colors ${
        isLiked ? 'text-white' : 'text-gray-400'
      }`}>
        {formatCount(likesCount)}
      </span>
    </button>
  );
};

export default LikeButton ;