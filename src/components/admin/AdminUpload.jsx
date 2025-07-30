import { useParams } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../../utils/axiosClient';
import { useNavigate } from 'react-router';
import {toast} from 'react-toastify'

function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const navigate = useNavigate() ;
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

    // Upload video to Cloudinary
      const onSubmit = async (data) => {
        const file = data.videoFile[0];
        
        setUploading(true);
        setUploadProgress(0);
        clearErrors();
    
        try {
          // Step 1: Get upload signature from backend
          const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
          const { signature, timestamp, public_id, api_key, upload_url , title , description} = signatureResponse.data ;
    
          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', api_key);
          formData.append('timestamp', timestamp);
          formData.append('public_id', public_id);
          formData.append('signature', signature);
          
          for (const [key, value] of formData.entries()) {
            console.log(`FormData ==> ${key}: ${value}`);
          }
    
          // Step 3: Upload directly to Cloudinary
          const uploadResponse = await axios.post(upload_url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            },
          });
    
          const cloudinaryResult = uploadResponse.data ;
          // Step 4: Save video metadata to backend
          const metadataResponse = await axiosClient.post('/video/save', {
            problemId:problemId,
            cloudinaryPublicId: cloudinaryResult.public_id,
            secureUrl: cloudinaryResult.secure_url,
            duration: cloudinaryResult.duration,
            title ,
            description
          });
    
          setUploadedVideo(metadataResponse.data.videoSolution);
          reset(); // Reset form after successful upload

          toast.success("Video Uploaded Successfully") ;

          if(metadataResponse.data.videoSolution)
            navigate("/admin") ;
          
        } catch (err) {
          const errorMessage = err.response?.data?.error?.message || err.message || 'Upload failed. Please try again.';
          setError('root', {
          type: 'manual',
          message: errorMessage
      });
        } finally {
          setUploading(false);
          setUploadProgress(0);
        }
      };

    // Format file size
      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
    
    // Format duration
      const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'radial-gradient(ellipse at bottom, var(--gradient-bg-from), var(--gradient-bg-to))',
           backgroundAttachment: 'fixed'
         }}>
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-[#5e5a66] shadow-lg overflow-hidden"
             style={{ background: 'var(--card)' }}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">
              Upload Video Solution
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-[#f8f4f9]">
                  Choose video file
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    {...register('videoFile', {
                      required: 'Please select a video file',
                      validate: {
                        isVideo: (files) => {
                          if (!files || !files[0]) return 'Please select a video file';
                          const file = files[0];
                          return file.type.startsWith('video/') || 'Please select a valid video file';
                        },
                        fileSize: (files) => {
                          if (!files || !files[0]) return true;
                          const file = files[0];
                          const maxSize = 100 * 1024 * 1024; // 100MB
                          return file.size <= maxSize || 'File size must be less than 100MB';
                        }
                      }
                    })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                    errors.videoFile ? 'border-red-500' : 'border-[#5e5a66]'
                  } bg-[#403c46]`}>
                    <span className="text-sm truncate max-w-[70%] text-[#f8f4f9]">
                      {selectedFile ? selectedFile.name : "Select file..."}
                    </span>
                    <div className="px-3 py-1 text-sm rounded bg-[#2d2a32] text-[#f8f4f9] border border-[#5e5a66]">
                      Browse
                    </div>
                  </div>
                </div>
                {errors.videoFile && (
                  <p className="mt-2 text-sm text-red-400">{errors.videoFile.message}</p>
                )}
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="p-3 rounded-lg border border-[#5e5a66] bg-[#403c46]">
                  <div className="flex justify-between text-sm text-[#f8f4f9]">
                    <span>File name:</span>
                    <span className="font-medium truncate max-w-[60%]">{selectedFile.name}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-sm text-[#f8f4f9]">
                    <span>File size:</span>
                    <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-[#f8f4f9]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#403c46] rounded-full overflow-hidden border border-[#5e5a66]">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(to right, var(--primary-from), var(--primary-to))'
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.root && (
                <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10">
                  <p className="text-sm text-red-400">{errors.root.message}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadedVideo && (
                <div className="p-3 rounded-lg border border-green-500/50 bg-green-500/10">
                  <h3 className="font-bold text-sm text-green-400">Upload Successful!</h3>
                  <div className="mt-1 text-sm text-green-400">
                    <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                    <p>Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  uploading || !selectedFile 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:opacity-90 hover:cursor-pointer'
                }`}
                style={{ 
                  background: 'linear-gradient(to right, var(--primary-from), var(--primary-to))'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;





// import { useParams } from 'react-router';
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';
// import axiosClient from '../utils/axiosClient'

// function AdminUpload(){
    
//     const {problemId}  = useParams();
    
//     const [uploading, setUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [uploadedVideo, setUploadedVideo] = useState(null);
    
//       const {register,handleSubmit,watch,formState: { errors },reset,setError,clearErrors} = useForm();
    
//       const selectedFile = watch('videoFile')?.[0];
    
//       // Upload video to Cloudinary
//       const onSubmit = async (data) => {
//         const file = data.videoFile[0];
        
//         setUploading(true);
//         setUploadProgress(0);
//         clearErrors();
    
//         try {
//           // Step 1: Get upload signature from backend
//           const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
//           const { signature, timestamp, public_id, api_key, upload_url} = signatureResponse.data ;
    
//           const formData = new FormData();
//           formData.append('file', file);
//           formData.append('api_key', api_key);
//           formData.append('timestamp', timestamp);
//           formData.append('public_id', public_id);
//           formData.append('signature', signature);
          
//           for (const [key, value] of formData.entries()) {
//             console.log(`FormData ==> ${key}: ${value}`);
//           }
    
//           // Step 3: Upload directly to Cloudinary
//           const uploadResponse = await axios.post(upload_url, formData, {
//             headers: {
//               'Content-Type': 'multipart/form-data',
//             },
//             onUploadProgress: (progressEvent) => {
//               const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//               setUploadProgress(progress);
//             },
//           });
    
//           const cloudinaryResult = uploadResponse.data ;
//           // Step 4: Save video metadata to backend
//           const metadataResponse = await axiosClient.post('/video/save', {
//             problemId:problemId,
//             cloudinaryPublicId: cloudinaryResult.public_id,
//             secureUrl: cloudinaryResult.secure_url,
//             duration: cloudinaryResult.duration,
//           });

//           console.log(metadataResponse.data) ;
    
//           setUploadedVideo(metadataResponse.data.videoSolution);
//           reset(); // Reset form after successful upload
          
//         } catch (err) {
//           const errorMessage = err.response?.data?.error?.message || err.message || 'Upload failed. Please try again.';
//           setError('root', {
//           type: 'manual',
//           message: errorMessage
//       });
//         } finally {
//           setUploading(false);
//           setUploadProgress(0);
//         }
//       };
    
//       // Format file size
//       const formatFileSize = (bytes) => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//       };
    
//       // Format duration
//       const formatDuration = (seconds) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${mins}:${secs.toString().padStart(2, '0')}`;
//       };
    
//       return (
//         <div className="max-w-md mx-auto p-6">
//           <div className="card bg-base-100 shadow-xl">
//             <div className="card-body">
//               <h2 className="card-title">Upload Video</h2>
              
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 {/* File Input */}
//                 <div className="form-control w-full">
//                   <label className="label">
//                     <span className="label-text">Choose video file</span>
//                   </label>
//                   <input
//                     type="file"
//                     accept="video/*"
//                     {...register('videoFile', {
//                       required: 'Please select a video file',
//                       validate: {
//                         isVideo: (files) => {
//                           if (!files || !files[0]) return 'Please select a video file';
//                           const file = files[0];
//                           return file.type.startsWith('video/') || 'Please select a valid video file';
//                         },
//                         fileSize: (files) => {
//                           if (!files || !files[0]) return true;
//                           const file = files[0];
//                           const maxSize = 100 * 1024 * 1024; // 100MB
//                           return file.size <= maxSize || 'File size must be less than 100MB';
//                         }
//                       }
//                     })}
//                     className={`file-input file-input-bordered w-full ${errors.videoFile ? 'file-input-error' : ''}`}
//                     disabled={uploading}
//                   />
//                   {errors.videoFile && (
//                     <div className="card h-44 ">
//                       <span >{errors.videoFile.message}</span>
//                     </div>
//                   )}
//                 </div>
    
//                 {/* Selected File Info */}
//                 {selectedFile && (
//                   <div className="alert alert-info">
//                     <div>
//                       <h3 className="font-bold">Selected File:</h3>
//                       <p className="text-sm">{selectedFile.name}</p>
//                       <p className="text-sm">Size: {formatFileSize(selectedFile.size)}</p>
//                     </div>
//                   </div>
//                 )}
    
//                 {/* Upload Progress */}
//                 {uploading && (
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span>Uploading...</span>
//                       <span>{uploadProgress}%</span>
//                     </div>
//                     <progress 
//                       className="progress progress-primary w-full" 
//                       value={uploadProgress} 
//                       max="100"
//                     ></progress>
//                   </div>
//                 )}
    
//                 {/* Error Message */}
//                 {errors.root && (
//                   <div className="alert alert-error">
//                     <span>{errors.root.message}</span>
//                   </div>
//                 )}
    
//                 {/* Success Message */}
//                 {uploadedVideo && (
//                   <div className="alert alert-success">
//                     <div>
//                       <h3 className="font-bold">Upload Successful!</h3>
//                       <p className="text-sm">Duration: {formatDuration(uploadedVideo.duration)}</p>
//                       <p className="text-sm">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
//                     </div>
//                   </div>
//                 )}
    
//                 {/* Upload Button */}
//                 <div className="card-actions justify-end">
//                   <button
//                     type="submit"
//                     disabled={uploading}
//                     className={`btn btn-primary ${uploading ? 'loading' : ''}`}
//                   >
//                     {uploading ? 'Uploading...' : 'Upload Video'}
//                   </button>
//                 </div>
//               </form>
            
//             </div>
//           </div>
//         </div>
//     );
// }


// export default AdminUpload;