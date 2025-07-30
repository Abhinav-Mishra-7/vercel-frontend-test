import axiosClient from "../../utils/axiosClient";
import { useDispatch } from "react-redux";
import { useNavigate} from 'react-router';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleSignUp = ({text}) =>{

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            
            const response = await axiosClient.post('/user/google', { token: credentialResponse.credential },
                { 
                withCredentials: true,  // Correct way to send credentials
                headers: {
                    'Content-Type': 'application/json'
                }
                }
            );

            if (response.request.statusText === "OK") {
                // Handle Google user differently
                if (response.data.user.verified) {
                    dispatch({ type: 'auth/loginSuccess', payload: response.data.user });
                    navigate('/');
                } else {
                    // Shouldn't happen for Google users, but safe fallback
                    navigate(`/OTPVerification/${response.data.user.emailId}/${response.data.user.firstName}`);
                }
            } else {
                throw new Error(response.data.message || 'Google authentication failed');
            }
        } catch (err) {
            toast.error(err.message);
        }
  };

  return (
    <>
    <div>
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
              </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">OR CONTINUE WITH</span>
                </div>
        </div>
                
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => {toast.error('Google Sign-In failed');}}
              useOneTap
              theme="filled_blue"
              size="large"
              shape="rectangular"
              text={`${text}`}
            />
          </GoogleOAuthProvider>
        </div>
        </div>
    </>
  )
}

export default GoogleSignUp ;
