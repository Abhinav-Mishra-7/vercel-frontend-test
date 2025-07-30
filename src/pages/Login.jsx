import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Flower2 } from 'lucide-react';
import { toast } from 'react-toastify';
import GoogleSignUp from '../components/google/GoogleSignUp';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    resolver: zodResolver(loginSchema) 
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-2xl p-8 space-y-6">
        
        <div className="text-center">
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">
              CodeVerse
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Welcome back.
            </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
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
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground" 
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (<p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>)}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--button-text)] shadow-sm transition-all duration-300 ease-in-out
                         bg-gradient-to-r from-primary-from to-primary-to
                         hover:shadow-lg hover:shadow-primary-from/40 hover:scale-[1.02]
                         focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card 
                         disabled:pointer-events-none disabled:opacity-60 hover: cursor-pointer "
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>
        
        {/* Google Sign in */}
        <GoogleSignUp text={"Login_with"} ></GoogleSignUp>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <NavLink to="/signup" className="font-semibold text-primary-from hover:text-primary-from/80">
            Sign Up
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;