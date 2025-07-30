import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser, sendEmail } from '../authSlice';
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff, User2} from 'lucide-react';
import GoogleSignUp from '../components/google/GoogleSignUp';

const signupSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      dispatch(sendEmail(data));
      navigate(`/OTPVerification/${data.emailId}/${data.firstName}`);
    } catch (err) {
      toast.error("An error occurred. Please try signing up again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-2xl p-8 space-y-6">
        
        <div className="text-center">
            {/* <Flower2Icon className="mx-auto h-12 w-12 text-primary-from" /> */}
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">
              CodeVerse
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A new world of code awaits.
            </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground mb-1.5">
              First Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                id="firstName" 
                type="text" 
                placeholder="Abhinav" 
                className={`block w-full rounded-md border-input bg-[var(--input-background)] py-2.5 pl-10 pr-3 text-foreground placeholder:text-sm placeholder:text-[var(--placeholder-text)] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from ${errors.firstName ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                {...register('firstName')} 
              />
            </div>
            {errors.firstName && (<p className="mt-1.5 text-sm text-destructive">{errors.firstName.message}</p>)}
          </div>

          <div>
            <label htmlFor="emailId" className="block text-sm font-medium text-muted-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                id="emailId" 
                type="email" 
                placeholder="example12@gmail.com" 
                className={`block w-full rounded-md border-input bg-[var(--input-background)] py-2.5 pl-10 pr-3 text-foreground placeholder:text-sm placeholder:text-[var(--placeholder-text)] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from ${errors.emailId ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`} 
                {...register('emailId')} 
              />
            </div>
            {errors.emailId && (<p className="mt-1.5 text-sm text-destructive">{errors.emailId.message}</p>)}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="8+ characters" 
                className={`block w-full rounded-md border-input bg-[var(--input-background)] py-2.5 pl-10 pr-10 text-foreground placeholder:text-sm placeholder:text-[var(--placeholder-text)] focus:border-primary-from focus:outline-none focus:ring-1 focus:ring-primary-from ${errors.password ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`} 
                {...register('password')} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (<p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>)}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--button-text)] shadow-sm transition-all duration-300 ease-in-out bg-gradient-to-r from-primary-from to-primary-to hover:shadow-lg hover:shadow-primary-from/40 hover:scale-[1.02] hover: cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card 
              disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        {/* Google Sign Up */}
        <GoogleSignUp text={"signup_with"} ></GoogleSignUp>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <NavLink to="/login" className="font-semibold text-primary-from hover:text-primary-from/80">
            Log In
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Signup;
