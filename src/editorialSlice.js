import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// Async Thunks for API calls
export const fetchEditorialData = createAsyncThunk(
    'editorial/fetchData',
    async (problemId, { rejectWithValue }) => {
        try {
            // Fetch video and comments in parallel for faster loading
            const [videoRes, commentsRes] = await Promise.all([
                axiosClient.get(`/video/getVideo/${problemId}`),
                axiosClient.get(`/comment/video/${problemId}?sortBy=upvotes`) // Default sort
            ]);
            // console.log(commentsRes) ;
            return { video: videoRes.data, comments: commentsRes.data};
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Network Error' });
        }
    }
);

export const postComment = createAsyncThunk(
    'editorial/postComment',
    async ({ content, solutionVideoId, parentCommentId = null }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/comment', { content, solutionVideoId, parentCommentId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const toggleVideoLike = createAsyncThunk(
    'editorial/toggleVideoLike',
    async (videoId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get(`/video/like/${videoId}`);
            return response.data; // Should return { likeCount, likes }
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const toggleCommentVote = createAsyncThunk(
    'editorial/toggleCommentVote',
    async (commentId, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post(`/comment/${commentId}/vote`);
            return response.data; // Returns the updated comment object
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateComment = createAsyncThunk(
    'editorial/updateComment',
    async ({ commentId, content }, { rejectWithValue }) => {
        try {
            // API call to update the comment
            const response = await axiosClient.put(`/comment/${commentId}`, { content });
            // Return the updated comment object from the server
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteComment = createAsyncThunk(
    'editorial/deleteComment',
    async (commentId, { rejectWithValue }) => {
        try {
            // API call to delete the comment
            await axiosClient.delete(`/comment/${commentId}`);
            // Return the ID of the deleted comment for easy removal from state
            return commentId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    video: null,
    comments: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    sort: 'newest', // 'upvotes' | 'newest'
};

const editorialSlice = createSlice({
    name: 'editorial',
    initialState,
    reducers:{
        setSort: (state, action) => {
            state.sort = action.payload.sort;
        },
        updateVideoLikes: (state, action) => {
            if (state.video) {
                state.video.likes = action.payload.likes;
            }
        },
        // THIS IS THE KEY TO FIXING THE DUPLICATE COMMENT BUG
        addCommentFromSocket: (state, action) => {
            const newComment = action.payload;
            
            if (newComment.parentComment) {
                // --- THIS IS THE KEY LOGIC FOR REPLIES ---
                // It's a reply. Find the parent and add the reply to its nested array.
                const parentComment = state.comments.find(c => c._id === newComment.parentComment);
                if (parentComment) {
                    const replyExists = parentComment.replies.some(r => r._id === newComment._id);
                    if (!replyExists) {
                        parentComment.replies.push(newComment);
                        // Also update the replyCount for the UI
                        parentComment.replyCount = parentComment.replies.length;
                    }
                }
            } else {
                // It's a new top-level comment. Add it if it doesn't exist.
                const commentExists = state.comments.some(c => c._id === newComment._id);
                if (!commentExists) {
                    state.comments.unshift(newComment);
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetching All Data
            .addCase(fetchEditorialData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchEditorialData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.video = action.payload.video;
                state.comments = action.payload.comments;
            })
            .addCase(fetchEditorialData.rejected, (state, action) => {
                state.status = 'failed';
                state.video = null ;
                state.error = action.payload.message || 'Failed to fetch data.';
            })
            // Liking the Video
            .addCase(toggleVideoLike.fulfilled, (state, action) => {
                if (state.video) {
                    state.video.likes = action.payload.likes;
                }
            })
            // Upvoting a Comment
            .addCase(toggleCommentVote.fulfilled, (state, action) => {
                const updatedComment = action.payload;
                const findAndAndUpdate = (comments) => {
                    for (let i = 0; i < comments.length; i++) {
                        if (comments[i]._id === updatedComment._id) {
                            comments[i] = { ...comments[i], ...updatedComment };
                            return true;
                        }
                        if (comments[i].replies && findAndAndUpdate(comments[i].replies)) {
                            return true;
                        }
                    }
                    return false;
                };
                findAndAndUpdate(state.comments);
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                if (state.video?.comments) {
                    const updatedComment = action.payload;
                    const index = state.video.comments.findIndex(c => c._id === updatedComment._id);
                    if (index !== -1) {
                        state.video.comments[index] = updatedComment;
                    }
                }
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                if (state.video?.comments) {
                    const deletedCommentId = action.payload;
                    state.video.comments = state.video.comments.filter(
                        comment => comment._id !== deletedCommentId
                    );
                }
            });
    },
});

export const { setSort, updateVideoLikes, addCommentFromSocket } = editorialSlice.actions;

export default editorialSlice.reducer;