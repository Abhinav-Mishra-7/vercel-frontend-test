import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { postComment, setSort} from '../editorialSlice';
import Comment from './Comment'; // Assuming this is also the styled version
import { useMemo } from 'react';

const CommentSection = ({ videoId , comments}) => {
   
    const dispatch = useDispatch();
    const {sort} = useSelector((state)=> state.editorial) ;
    const { user } = useSelector((state) => state.auth);
    const { register, handleSubmit, reset, formState: { isSubmitting, errors, isValid } } = useForm({ mode: 'onChange' });

    // Memoize sorted comments
    const sortedComments = useMemo(() => {
        const commentsCopy = [...comments];
        if (sort === 'upvotes') {
            return commentsCopy.sort((a, b) => b.upvotes.length - a.upvotes.length);
        } else {
            return commentsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }, [comments, sort]);

    const onCommentSubmit = (data) => {
        dispatch(postComment({
            content: data.commentText,
            solutionVideoId: videoId,
        }))
        .unwrap()
        .then(() => {
            reset();
        })
        .catch(err => {
            console.error("Failed to post comment:", err);
        });
    };
    
    const handleSortChange = (newSort) => {
        dispatch(setSort({sort: newSort }));
    };

    return (
        // Main container for the comment section
        <div className="mt-8 space-y-8">
            
            {/* --- Header with Comment Count and Sorting --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-foreground">{comments?.length} Comments</h2>
                <div className="flex items-center gap-2">
                    <span className="text-md font-bold text-muted-foreground mr-1.5">Sort by:</span>
                    <button 
                        onClick={() => handleSortChange('upvotes')}
                        className={`px-3 py-1 rounded-full font-bold text-button-text transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 hover:cursor-pointer ${sort === 'upvotes' ? 'text-button-text' : 'text-foreground hover:bg-white/10'}`}
                        style={{ backgroundImage: sort === 'upvotes' ? 'linear-gradient(to bottom right, var(--primary-from), var(--primary-to))' : '' }}
                    >
                        Top
                    </button>
                    <button 
                        onClick={() => handleSortChange('newest')}
                        className={`px-3 py-1 rounded-full font-bold text-button-text transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 hover:cursor-pointer ${sort === 'newest' ? 'text-button-text' : 'text-foreground hover:bg-white/10'}`}
                        style={{ backgroundImage: sort === 'newest' ? 'linear-gradient(to bottom right, var(--primary-from), var(--primary-to))' : '' }}
                    >
                        Newest
                    </button>
                </div>
            </div>

            {/* --- Comment Form --- */}
            {user ? (
                <form onSubmit={handleSubmit(onCommentSubmit)}>
                    <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <div className="avatar flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full text-button-text flex items-center justify-center ring-2 ring-offset-2 ring-offset-card"
                                 style={{ backgroundImage: 'linear-gradient(to bottom right, var(--primary-from), var(--primary-to))', ringColor: 'var(--primary-from)' }}>
                                <span className="text-xl font-bold">{user.firstName?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                        {/* Text Area and Error Message */}
                        <div className="w-full">
                            <textarea
                                {...register("commentText", { required: "Comment cannot be empty." })}
                                className="w-full p-3 rounded-xl text-foreground placeholder-muted-foreground border-2 transition-all duration-300 focus:ring-2 focus:border-primary-from"
                                style={{ 
                                    backgroundColor: 'var(--input-background)', 
                                    borderColor: errors.commentText ? 'var(--destructive)' : 'var(--border)',
                                    '--tw-ring-color': 'var(--ring)' // Maps focus ring to theme
                                }}
                                placeholder="Add a public comment..."
                                rows="3"
                                disabled={isSubmitting}
                            />
                            {errors.commentText && <p className="text-sm mt-1" style={{ color: 'var(--destructive)' }}>{errors.commentText.message}</p>}
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="flex justify-end mt-3">
                        <button 
                            type="submit" 
                            className="px-6 py-2 rounded-full font-bold text-button-text transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 hover:cursor-pointer"
                            style={{ backgroundImage: 'linear-gradient(to right, var(--primary-from), var(--primary-to))' }}
                            disabled={isSubmitting || !isValid}
                        >
                            {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : "Comment"}
                        </button>
                    </div>
                </form>
            ) : (
                // --- Logged-out User Prompt ---
                <div className="text-center my-6 p-6 rounded-xl border border-dashed" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)' }}>
                    <p className="text-muted-foreground">Please log in to participate in the discussion.</p>
                </div>
            )}
            
            {/* --- Comments List (Loading State & Content) --- */}
            {comments?.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Loading comments...</p>
                </div>
            )}
            
             <div className="space-y-8">
                {sortedComments.map(comment => (
                    <Comment key={comment._id} comment={comment} videoId={videoId} />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;