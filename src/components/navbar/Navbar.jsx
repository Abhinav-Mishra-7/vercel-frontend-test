import { useRef , useState , useEffect} from "react";
import { NavLink } from "react-router"
import { UserIcon , ChevronDown , Settings , LogOut} from "lucide-react";
import { useSelector ,useDispatch } from "react-redux";
import { logoutUser } from "../../authSlice";

const Navbar = () => {
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const {user} = useSelector((state) => state.auth) ; 
    const dispatch = useDispatch() ;
    const [solvedProblems, setSolvedProblems] = useState([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]);
        navigate('/login');
    };


    return (
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-8xl mx-auto px-4 sm:px-4 lg:px-6 flex items-center justify-between h-15">
            {/* Left Side: Logo and Nav Links */}
            <div className="flex justify-center items-baseline gap-8">
                {/* Logo */}
                <NavLink to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-from to-primary-to">
                CodeVerse
                </NavLink>
                {/* Navigation Links - Hidden on mobile, shown on md screens and up */}
                <div className="hidden md:flex items-center gap-6">
                <NavLink
                    to="/"
                    end // Use 'end' prop to ensure this only matches the exact path
                    className={({ isActive }) =>
                    `text-md font-medium transition-colors hover:text-foreground ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`
                    }
                >
                    Problems
                </NavLink>
                <NavLink
                    to="/contest/ContestListPage"
                    className={({ isActive }) =>
                    `text-md font-medium transition-colors hover:text-foreground ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`
                    }
                >
                    Contest
                </NavLink>
                <NavLink
                    to="/explore" // Placeholder link for explore page
                    className={({ isActive }) =>
                    `text-md font-medium transition-colors hover:text-foreground ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`
                    }
                >
                    Explore
                </NavLink>
                
                </div>
            </div>

            {/* Right Side: Profile Dropdown */}
            <div className="relative flex items-center gap-3" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 rounded-full transition-colors hover:bg-white/10 p-1 pr-3 hover: cursor-pointer">

                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-from to-primary-to flex items-center justify-center">
                    {user?.profilePicUrl ? (
                        <img 
                            src={user?.profilePicUrl} 
                            alt={`${user?.name}'s profile`} 
                            className="w-full h-full rounded-full object-cover" 
                        />
                    ) : (
                        <UserIcon className="w-16 h-16 text-muted-foreground" />                            
                )}</div>

                <span className="font-semibold text-foreground hidden sm:block">{user?.firstName || 'Guest'}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                  <NavLink
                    to="/plansPage"
                    end // Use 'end' prop to ensure this only matches the exact path
                    className={({ isActive }) =>
                    `text-md font-medium transition-colors hover:bg-yellow-700/40 bg-yellow-700/20 rounded-md px-3 py-1.5 text-yellow-500/90`
                    }
                >
                    Premium
                </NavLink>

                
                {isDropdownOpen && (
                <ul className="absolute top-10.5 right-9 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-2xl py-1 transition-all duration-300 animate-in fade-in-0 zoom-in-95">
                    <li><NavLink to="/profilePage" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5"><UserIcon size={14} /> Profile</NavLink></li>
                    {user?.role === 'admin' && (<li><NavLink to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-white/5"><Settings size={14} /> Admin Panel</NavLink></li>)}
                    <div className="my-1 border-t border-white/10"></div>
                    <li><button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer"><LogOut size={14} /> Logout</button></li>
                </ul>
                )}
            </div>
            </div>
        </nav>
    )
}

export default Navbar ;
