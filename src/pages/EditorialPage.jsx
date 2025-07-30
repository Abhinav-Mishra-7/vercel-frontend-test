import { useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {toggleVideoLike, updateVideoLikes, addCommentFromSocket } from '../editorialSlice';
import VideoPlayer from '../components/VideoPlayer';
import LikeButton from '../components/likeButton/LikeButton';
import CommentSection from '../components/CommentSection';
import { socket } from '../socket';
import {toast} from "react-toastify" ;

const EditorialPage = ({ problemId }) => {
    const dispatch = useDispatch();
    const {video , status , comments} = useSelector((state) => state.editorial) ;
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!video?._id) return;
        const videoId = video?._id;
        socket.connect();
        socket.emit('join-editorial-room', videoId);
        const handleLikeUpdate = (data) => dispatch(updateVideoLikes(data));
        const handleCommentAdd = (newComment) => dispatch(addCommentFromSocket(newComment));
        socket.on('like-updated', handleLikeUpdate);
        socket.on('comment-added', handleCommentAdd);
        return () => {
            socket.emit('leave-editorial-room', videoId);
            socket.off('like-updated', handleLikeUpdate);
            socket.off('comment-added', handleCommentAdd);
            socket.disconnect();
        };
    }, [video?._id]);

    const handleLike = () => {
        if (video?._id && user) {
            dispatch(toggleVideoLike(video?._id));
        } else {
            toast.error("No video present") ;
        }
    };
    
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: 'var(--card)' }}>
                <div className="loading loading-spinner w-16 h-16" style={{ color: 'var(--primary-from)' }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-foreground" style={{ backgroundColor: 'var(--card)' }}>
            {/* Main content container with responsive padding and max-width */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="space-y-8">
                    
                    {/* --- Section 1: Video Title and Description --- */}
                    <header className="text-left">
                        <h1 className="text-2xl md:text-3xl font-bold py-1.5 tracking-tight bg-gradient-to-r from-primary-from to-primary-to text-transparent bg-clip-text">
                            {video ? video?.title : "No Video For This Problem"}
                        </h1>
                        <h2 className='text-xl font-bold'>
                            Video Solution
                        </h2>
                    </header>

                    <div className="w-full h-px" style={{ background: ' linear-gradient(to right, var(--card), white, var(--card))' }}></div>

                    {/* --- Section 2: Video Player and Actions --- */}
                    <div className="space-y-4">
                        {/* A container to give the video a "cinematic" feel */}
                        <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                            <VideoPlayer secureUrl={video?.secureUrl} thumbnailUrl={video?.thumbnailUrl}/>
                        </div>
                        
                        {/* Like Button aligned to the right */}
                        <div className="flex justify-end items-center px-0.5 ">
                            <LikeButton
                                onLike={handleLike}
                                likesCount={video?.likes?.length || 0}
                                isLiked={user ? video?.likes?.includes(user._id) : false}
                            />
                        </div>
                    </div>
                    
                    {/* --- A beautiful gradient divider --- */}
                    <div className="w-full h-px" style={{ background: 'linear-gradient(to right, var(--card), white , var(--card))' }}></div>

                    {/* --- Section 3: Comment Section --- */}
                    {/* The CommentSection component will be rendered here, inheriting the layout */}
                    <div className="max-w-4xl mx-auto">
                      <CommentSection problemId={problemId} videoId={video?._id} comments={comments} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditorialPage;