import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { sendEmail, clearAuthState } from '../authSlice';
import { toast } from 'react-toastify';
import { MailCheck } from 'lucide-react';

const OTPVerification = () => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { emailId, firstName } = useParams();

  // **KEY FIX 1:** Get the `isSubmitted` state from the form.
  const { register, handleSubmit, formState: { errors, isSubmitted }, setValue } = useForm();

  // Your original timer logic is preserved
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendDisabled(false);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Your original onSubmit logic is preserved
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const otp = Array.from({ length: 6 }, (_, i) => data[`digit${i}`]).join('');

    try {
        const answer = await axiosClient.post("/api/verify-otp", {
            otp: otp,
            emailId: emailId,
            firstName: firstName
        });
    
        if (!answer?.data.user.exists) {
            toast.error("Please Fill The Information Again");
            navigate('/signup');
        } else if (answer?.data.user.exists && answer?.data.user.success) {
            toast.success(`Logged In Successfully`);
            dispatch(clearAuthState());
            navigate('/');
        } else if (answer?.data.user.exists && !answer?.data.user.success) {
            toast.error(answer?.data.user.message || "An unknown error occurred.");
        }
    } catch(err) {
        toast.error("Failed to verify OTP. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Your original handleKeyDown logic is preserved
  const handleKeyDown = (index) => (e) => {
    if (e.key === 'Backspace') {
      // No need for preventDefault here, as it can interfere with natural input behavior.
      if (e.target.value) {
        // Clearing value is handled by the browser backspace, no need to call setValue.
      } else if (index > 0) {
        // If the current input is already empty, then focus the previous one.
        const prevInput = document.getElementById(`digit${index - 1}`);
        if(prevInput) prevInput.focus();
      }
    }
  };

  // Your original handleResend logic is preserved
  const handleResend = async () => {
    try {
      await dispatch(sendEmail({ emailId, firstName })).unwrap();
      toast.success("OTP Resent Successfully");
      setTimeLeft(30);
      setIsResendDisabled(true);
      Array.from({ length: 6 }, (_, i) => setValue(`digit${i}`, ''));
      document.getElementById('digit0').focus();
    } catch (err) {
      toast.error("OTP Not Sent");
      setIsResendDisabled(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-white/5 rounded-lg shadow-2xl p-8 space-y-6">

        <div className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-primary-from" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
          <p className="text-base text-muted-foreground mt-2">
            Enter the 6-digit code sent to <span className="font-semibold text-foreground">{emailId}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                // **KEY FIX 2:** The class now checks for `isSubmitted` before applying the error style.
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border rounded-lg transition-colors duration-200
                           bg-[--input-background] text-foreground border-[--border]
                           focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from
                           ${isSubmitted && errors[`digit${index}`] ? 'border-destructive' : ''}`}
                {...register(`digit${index}`, {
                  required: true,
                  pattern: /^[0-9]$/
                })}
                onKeyDown={handleKeyDown(index)}
                onInput={(e) => {
                  if (e.target.value && index < 5) {
                    document.getElementById(`digit${index + 1}`)?.focus();
                  }
                }}
                id={`digit${index}`}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center rounded-lg px-4 py-3 text-base font-semibold text-[var(--button-text)] shadow-lg shadow-primary-from/20 transition-all duration-300 ease-in-out
                         bg-gradient-to-r from-primary-from to-primary-to
                         hover:shadow-xl hover:shadow-primary-from/30 hover:scale-[1.02]
                         focus:outline-none focus:ring-2 focus:ring-primary-to focus:ring-offset-2 focus:ring-offset-card 
                         disabled:pointer-events-none disabled:opacity-50 hover: cursor-pointer "
            >
              {isSubmitting ? 'Verifying...' : 'Verify Account'}
            </button>
          </div>

          <div className="text-center text-muted-foreground">
            {isResendDisabled ? (
              <p>
                Request a new code in <span className="font-semibold text-foreground">{timeLeft}s</span>
              </p>
            ) : (
              <p>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-primary-from hover:text-primary-from/80 underline hover: cursor-pointer"
                >
                  Resend OTP
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;


// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import axiosClient from '../utils/axiosClient';
// import { useNavigate, useParams } from 'react-router';
// import { useDispatch, useSelector} from 'react-redux';
// import { sendEmail , clearAuthState} from '../authSlice';
// import { toast } from 'react-toastify';
// import { useRef } from 'react';

// const OTPVerification = () => {

//   const [timeLeft, setTimeLeft] = useState(30);
//   const [isResendDisabled, setIsResendDisabled] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate() ;
//   const dispatch = useDispatch() ;
//   const [sent , setSent] = useState(true) ;
//   const {emailId , firstName} = useParams() ;
//   const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  
//   // Timer for resend functionality
//   useEffect(() => {
//     if (timeLeft <= 0) {
//       setIsResendDisabled(false);
//       return;
//     }
    
//     const timer = setTimeout(() => {
//       setTimeLeft(timeLeft - 1);
//     }, 1000);
    
//     return () => clearTimeout(timer);
//   }, [timeLeft]);

//   // Handle form submission
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
    
//     // Extract OTP from form data
//     const otp = Array.from({ length: 6 }, (_, i) => data[`digit${i}`]).join('');

//     const answer = await axiosClient.post("/api/verify-otp" , {
//         otp: otp ,
//         emailId: emailId ,
//         firstName: firstName
//     }) ;

//     if(!answer?.data.user.exists)
//     {
//       toast.error("Please Fill The Information Again") ;
//       navigate('/signup') ;  
//     }
//     else if(answer?.data.user.exists && answer?.data.user.success)
//     {
//       toast.success(`Logged In Successfully`) ;
//       dispatch(clearAuthState()) ;
//       navigate('/') ;
//     }
//     else if(answer?.data.user.exists && !answer?.data.user.success)
//     toast(`${answer?.data.user.message}`) ;
    
//     setIsSubmitting(false);
//   };  

//   const handleKeyDown = (index) => (e) => {
//     if (e.key === 'Backspace') {
//       e.preventDefault();
      
//       // Clear current input if it has value
//       if (e.target.value) {
//         setValue(`digit${index}`, '', { shouldValidate: true });
//         return;
//       }
      
//       // Move to previous input if current is empty
//       if (index > 0) {
//         const prevInput = document.getElementById(`digit${index - 1}`);
//         setValue(`digit${index - 1}`, '', { shouldValidate: true });
//         prevInput.focus();
//       }
//     }
//   };


//   // Handle OTP resend
//   const handleResend = async () => {

//     try{
//       console.log("err") ;
//       await dispatch(sendEmail({ emailId: emailId, firstName: firstName })).unwrap();
//       console.log("err") ;
//     toast.success("OTP Resent Successfully") ;
//     // Reset timer
//     setTimeLeft(30);
//     setIsResendDisabled(true);
//     // Clear all inputs
//     Array.from({ length: 6 }, (_, i) => setValue(`digit${i}`, ''));
//     }
//     catch(err)
//     {
      
//       toast.error("OTP Not Sent") ;
//       setIsResendDisabled(false) ;
//     }
//   };
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-700 p-4">
//       <div className="w-full max-w-md bg-gray-400 rounded-xl shadow-md overflow-hidden p-6">
 
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-800">OTP Verification</h1>
//           <p className="text-gray-600 mt-2">
//             Enter the 6-digit code sent to your email
//           </p>
//         </div>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="flex justify-center space-x-3">
//             {Array.from({ length: 6 }).map((_, index) => (
//               <input
//                 key={index}
//                 type="text"
//                 maxLength={1}
//                 className={`w-12 h-12 text-center text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 ${
//                   errors[`digit${index}`] ? 'border-red-500' : 'border-gray-800'
//                 }`}
//                 {...register(`digit${index}`, {
//                   required: true,
//                   pattern: /^[0-9]$/
//                 })}
//                 onKeyDown={handleKeyDown(index)}
//                 onInput={(e) => {
//                   // Auto-focus next input
//                   if (e.target.value && index < 5) {
//                     const nextInput = document.getElementById(`digit${index + 1}`);
//                     if (nextInput) nextInput.focus();
//                   }
//                 }}
//                 id={`digit${index}`}
//               />
//             ))}
//           </div>
          
//           {Object.keys(errors).length > 0 && (
//             <p className="text-red-600 text-center">Please enter a valid 6-digit code</p>
//           )}
          
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ${
//               isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
//             }`}
//           >
//             {isSubmitting ? 'Verifying...' : 'Verify OTP'}
//           </button>
          
//           <div className="text-center mt-4">
//             <p className="text-gray-800">
//               Didn't receive the code?{' '}
//               <button
//                 type="button"
//                 onClick={handleResend}
//                 disabled={isResendDisabled}
//                 className={`font-medium ${
//                   isResendDisabled ? 'text-gray-800 cursor-not-allowed' : 'text-blue-700 hover:underline hover:cursor-pointer '
//                 }`}
//               >
//                 {isResendDisabled ? `Resend in ${timeLeft}s` : 'Resend OTP'}
//               </button>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OTPVerification;