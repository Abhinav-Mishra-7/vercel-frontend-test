import { Link } from 'react-router'; // Ensure this is from react-router-dom
import { User, Edit, Camera, Loader2 } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import axios from 'axios';
import { useState, useRef } from 'react';

const UserProfileCard = ({ user, onProfilePicUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        if (isUploading) return;
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setFeedback({ message: 'Uploading...', type: 'info' });

        try {
            const signatureResponse = await axiosClient.get('/image/generate-upload-signature');
            const { signature, timestamp, api_key, cloud_name, folder , transformation} = signatureResponse.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);
            formData.append('transformation', 'w_250,h_250,c_fill,g_face,r_max');

            if (transformation) {
                formData.append('transformation', transformation);
            }

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
            const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);
            
            const { public_id, secure_url } = cloudinaryResponse.data;

            const updateResponse = await axiosClient.put('/image/update-profile-picture-info', {
                public_id,
                url: secure_url,
            });

            onProfilePicUpdate(updateResponse.data.user);
            setFeedback({ message: 'Profile picture updated!', type: 'success' });

        } catch (error) {
            console.error("UPLOAD FAILED:", error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.message || 'Upload failed. Check console.';
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setIsUploading(false);
            setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
        }
    };

    if (!user) return null;
    
    return (
        <div className="bg-card rounded-xl shadow-lg p-6 text-center border border-border">
            <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer" onClick={handleImageClick}>
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center p-1 border-2 border-primary-to">
                    {user.profilePicUrl ? (
                        <img 
                            src={user.profilePicUrl} 
                            alt={`${user.name}'s profile`} 
                            className="w-full h-full rounded-full object-cover" 
                        />
                    ) : (
                        <User className="w-16 h-16 text-muted-foreground" />                            
                    )}
                </div>

                <div className="absolute inset-0 bg-transparent bg-opacity-60 rounded-full items-center justify-center transition-all duration-300 hidden group-hover:flex">
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white" />
                    )}
                </div>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    hidden
                    accept="image/*"
                />
            </div>
            
            {feedback.message && (
                <div className={`p-2 my-2 text-sm rounded-md ${feedback.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {feedback.message}
                </div>
            )}

            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-from to-primary-to text-transparent bg-clip-text">
                {user.name}
            </h1>

            <Link
                to="/profile/edit"
                className="mt-4 group inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-border bg-transparent text-foreground hover:bg-white/5 hover:border-primary-to transition-all duration-200"
            >
                <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary-to transition-colors" />
                Edit Profile
            </Link>
        </div>
    );
};

export default UserProfileCard;

// import { Link } from 'react-router';
// import { User, Edit } from 'lucide-react';
// import axiosClient from '../../utils/axiosClient';
// import axios from 'axios';
// import { Camera, Loader2 } from 'lucide-react';
// import { useState , useRef } from 'react';

// // The 'onEditClick' prop is no longer needed
// const UserProfileCard = ({ user }) => {


//     const [isUploading, setIsUploading] = useState(false);
//     const [feedback, setFeedback] = useState({ message: '', type: '' });
//     const fileInputRef = useRef(null);

//     const handleImageClick = () => {
//         if (isUploading) return;
//         fileInputRef.current.click();
//     };

//     const handleFileChange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         setIsUploading(true);
//         setFeedback({ message: '', type: '' });

//         try {
//             // --- STEP 1: Get signature from our backend ---
//             const signatureResponse = await axiosClient.get('/user/generate-upload-signature');
//             const { signature, timestamp, api_key, cloud_name } = signatureResponse.data;

//             // --- STEP 2: Upload directly to Cloudinary ---
//             const formData = new FormData();
//             formData.append('file', file);
//             formData.append('api_key', api_key);
//             formData.append('timestamp', timestamp);
//             formData.append('signature', signature);
//             formData.append('folder', 'profile_pictures');
//             // Add transformations directly for the upload
//             formData.append('transformation', 'w_250,h_250,c_fill,g_face');

//             const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
//             const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);
            
//             const { public_id, secure_url } = cloudinaryResponse.data;

//             // --- STEP 3: Save the result to our backend ---
//             const updateResponse = await axiosClient.put('/user/update-profile-picture-info', {
//                 public_id,
//                 url: secure_url,
//             });

//             // --- STEP 4: Update the UI ---
//             onProfilePicUpdate(updateResponse.data.user);
//             setFeedback({ message: 'Success!', type: 'success' });

//         } catch (error) {
//             const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
//             setFeedback({ message: errorMessage, type: 'error' });
//             console.error("Profile pic upload failed:", error);
//         } finally {
//             setIsUploading(false);
//             setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
//         }
//     };

//     if (!user) return null;

//     return(
//         <div className="bg-card rounded-xl shadow-lg p-6 text-center">
//         {/* Profile Picture (no change) */}
//         <div className="relative w-32 h-32 mx-auto mb-4">
//              <div className="bg-gradient-to-br from-primary-from to-primary-to p-1 rounded-full">
//                 <div className="w-full h-full bg-card rounded-full flex items-center justify-center p-1">
//                     {user?.profilePictureUrl ? (
//                         <img src={user.profilePictureUrl} alt={`${user.name}'s profile`} className="w-full h-full rounded-full object-cover" />
//                     ) : (
//                         <User className="w-16 h-16 text-muted-foreground" />
//                     )}
//                 </div>
//             </div>
//         </div>

//         {/* User Info (no change) */}
//         <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-from to-primary-to text-transparent bg-clip-text">
//             {user?.name || 'User Name'}
//         </h1>

//         {/* Edit Button is now a Link */}
//         <Link
//             to="/profile/edit" // <-- NAVIGATES TO THE NEW PAGE
//             className="group inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-border bg-transparent text-foreground hover:bg-white/5 hover:border-primary-to transition-all duration-200"
//         >
//             <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary-to transition-colors" />
//             Edit Profile
//         </Link>
//     </div>
//     )
// };

// export default UserProfileCard;