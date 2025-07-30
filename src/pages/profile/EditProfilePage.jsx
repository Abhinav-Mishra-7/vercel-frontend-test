// src/pages/Profile/EditProfilePage.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; // <-- Import the hook
import { useNavigate } from 'react-router';
import axiosClient from '../../utils/axiosClient';
import Loader from '../../components/loader/Loader';
import { User, Mail } from 'lucide-react';

const EditProfilePage = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }} = useForm();

    // We still need state for page loading and general API errors
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState('');

    // Fetch current user data and populate the form
    useEffect(() => {
        const fetchCurrentUserData = async () => {
            try {
                const response = await axiosClient.get('/user/get-user-data'); 
                const userData = response.data;
                setValue('firstName', userData.firstName);
                setValue('emailId', userData.emailId); 
                
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setApiError('Could not load your profile data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentUserData();
    }, [setValue]);

    const onSubmit = async (data) => {
        setApiError('');
        try {
            console.log(data) ;
            await axiosClient.put('/user/update-profile', data);
            navigate('/profilePage'); 
        } catch (err) {
            console.error("Failed to update profile:", err);
            setApiError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
            <div className="bg-card rounded-xl shadow-lg border border-border/50">
                {/* handleSubmit wraps our onSubmit function and handles validation */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Header */}
                    <div className="p-6 border-b border-border">
                        <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
                        <p className="text-muted-foreground mt-1">Update your personal information.</p>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 space-y-6">
                        {apiError && <div className="bg-destructive/20 text-destructive p-3 rounded-md text-sm">{apiError}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                  
                                    <input type="text" id="firstName" {...register('firstName', { required: 'First name is required.' })} className="w-full bg-input-background border border-border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                                {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>}
                            </div>

                        </div>

                        <div>
                            <label htmlFor="emailId" className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                {/* Using 'emailId' and adding a pattern validation */}
                                <input type="email" id="emailId" {...register('emailId', { 
                                    required: 'Email is required.', 
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address format.' }
                                })} className="w-full bg-input-background border border-border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            {errors.emailId && <p className="text-destructive text-xs mt-1">{errors.emailId.message}</p>}
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="flex items-center justify-end gap-4 p-6 bg-input-background/50 border-t border-border rounded-b-xl">
                        <button type="button" onClick={() => navigate('/profilePage')} className="px-4 py-2 text-sm font-semibold rounded-md border border-border text-foreground hover:bg-white/5 transition-colors" disabled={isSubmitting}>
                            Cancel
                        </button>
                        {/* 'isSubmitting' from react-hook-form automatically handles the disabled state */}
                        <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-md bg-primary-to text-primary-foreground hover:bg-primary-to/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;