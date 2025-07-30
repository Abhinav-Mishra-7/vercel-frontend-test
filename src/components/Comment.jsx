import { useState ,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThumbsUp , UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { toggleCommentVote, postComment } from '../editorialSlice';
import axiosClient from '../utils/axiosClient';

const Comment = ({ comment, videoId }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [localReplies, setLocalReplies] = useState([]);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [authorName , setAuthorName] = useState(null) ; 

    const [isAnimating, setIsAnimating] = useState(false);

    // ---Optimistic state for votes for instant UI feedback ---
    const [optimisticVote, setOptimisticVote] = useState({});

    // Sync the optimistic state if the comment prop changes from parent re-render
    useEffect(() => {
        setOptimisticVote({
            isVoted: user ? comment.upvotes?.includes(user._id) : false,
            count: comment.upvotes?.length || 0,
        });
    }, [comment.upvotes, user]);

    const { register, handleSubmit, errors , reset, formState: { isSubmitting } } = useForm();

    if(!authorName)
        setAuthorName(comment.author.firstName) ;

    const replies = comment.replies || []; 

    // --- Implementing optimistic voting ---
    const handleVote = () => {
        if (!user) return alert('Please log in to vote.');

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        
        // Update UI instantly
        setOptimisticVote(prev => ({
            isVoted: !prev.isVoted,
            count: prev.isVoted ? prev.count - 1 : prev.count + 1,
        }));
        
        // Dispatch action to sync with backend
        dispatch(toggleCommentVote(comment._id));
    };

    const onReplySubmit = (data) => {
        dispatch(postComment({
            content: data.replyText,
            solutionVideoId: videoId,
            parentCommentId: comment._id
        }))
        .unwrap()
        .then(() => {
            reset();
            setShowReplyForm(false);
            // Refresh replies to show the new one
            fetchReplies();
            if (!showReplies) {
                setShowReplies(true);
            }
        });
    };

    const fetchReplies = async () => {
        if (localReplies.length > 0) return; // Don't refetch if already loaded
        setRepliesLoading(true);
        try {
            console.log(comment) ;
            // IMPORTANT: Assumes an API endpoint like `/comment/replies/:commentId` exists
            const response = await axiosClient.get(`/comment/replies/${comment._id}`);
            console.log(response.data) ;
            setLocalReplies(response.data?.replies || []);
        } catch (error) {
            console.error("Failed to fetch replies:", error);
        } finally {
            setRepliesLoading(false);
        }
    };

   
    function DisplayReplies()
        {
            return (
                <>
                    {replies.length > 0 && (
                        <button onClick={()=> setShowReplies(!showReplies)} className="btn btn-link btn-xs p-0 mt-2 text-primary font-bold">
                            {showReplies ? 'Hide replies' : `View ${replies.length} replies`}
                        </button>
                    )}

                    {(showReplies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-base-300 flex flex-col gap-4">
                            {comment.replies.map(reply => (
                                <Comment key={reply._id} comment={reply} videoId={videoId}/>
                            ))}
                        </div>
                    ))}
                </>
            )
    }

    return (
        <div className="flex gap-3">
            <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center" 
                  style={{ backgroundImage: 'linear-gradient(to bottom right, var(--primary-from), var(--primary-to))', ringColor: 'var(--primary-from)' }}
                >
                    <span className="text-lg "> <UserCircle size={25} className='text-white/90'></UserCircle> </span>
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm">{authorName}</span>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="py-1 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4 mt-1">
                    <button onClick={handleVote} className={`flex items-center gap-1.5 text-xs ${isAnimating ? 'animate-thumbs-up' : '' }`}>
                       {optimisticVote.isVoted ? (
                            // Filled thumbs-up icon
                            <ThumbsUp size={17} fill="currentColor" className="text-pink-400" />
                        ) : (
                            // Outline thumbs-up icon
                            <ThumbsUp size={17} />
                        )}
                        <span className='text-sm' >{comment.upvotes.length}</span>
                    </button>
                    {user && (
                        <div>
                            <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1.5 text-sm text-gray-400 font-semibold hover:text-gray-500 hover:cursor-pointer ">
                            <span>Reply</span>
                        </button>
                        
                        </div>
                    )}
                </div>
                
                {showReplyForm && (
                    <form onSubmit={handleSubmit(onReplySubmit)} className="mt-3">
                        <div className='w-full'>
                            <textarea
                                {...register("replyText", { required: true })}
                                className="w-full p-3 rounded-xl text-foreground placeholder-muted-foreground border-2 transition-all duration-300 focus:ring-2 focus:border-primary-from"
                                placeholder={`Replying to ${authorName}...`}
                                rows="2"
                                disabled={isSubmitting}
                                style={{ 
                                    backgroundColor: 'var(--input-background)', 
                                    borderColor: errors?.commentText ? 'var(--destructive)' : 'var(--border)',
                                    '--tw-ring-color': 'var(--ring)' // Maps focus ring to theme                               
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => { setShowReplyForm(false); reset(); }} className="px-3 py-1 rounded-full font-bold text-button-text transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-104 hover:cursor-pointer" 
                            style={{ backgroundImage: 'linear-gradient(to right, var(--primary-from), var(--primary-to))' }}   >Cancel</button>

                            <button type="submit" className="px-3 py-1 rounded-full font-bold text-button-text transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-104 hover:cursor-pointer" disabled={isSubmitting} 
                            style={{ backgroundImage: 'linear-gradient(to right, var(--primary-from), var(--primary-to))' }}>
                                {isSubmitting ? <span className="loading loading-spinner loading-xs "></span> : 'Reply'}
                            </button>
                        </div>
                    </form>
                )}

                <DisplayReplies></DisplayReplies>

            {/* NEW: Inline CSS for animation */}
            <style jsx>{`
                @keyframes thumbsUpAnimation {
                    0% {
                        transform: scale(1);
                        color: inherit;
                    }
                    25% {
                        transform: scale(1.3);
                        color: #3b82f6;
                    }
                    50% {
                        transform: rotate(-15deg) scale(1.2);
                    }
                    75% {
                        transform: rotate(15deg) scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        color: inherit;
                    }
                }
                .animate-thumbs-up {
                    animation: thumbsUpAnimation 0.5s ease;
                }
            `}</style>
            </div>
        </div>
    );
};

export default Comment;
