// utils/submissionHandler.js
import { useContext } from 'react';
import { ContestContext } from '../context/ContestContext'; // Adjust path as needed

export const useSubmissionHandler = () => {
    const { markProblemSolved } = useContext(ContestContext);

    const handleSuccessfulSubmission = (contestId, problemId) => {
        // Update local state
        markProblemSolved(contestId, problemId);
        
        // Optional: Sync with backend
        // axiosClient.patch(`/contest/${contestId}/mark-solved`, { problemId });
    };

    return { handleSuccessfulSubmission };
};