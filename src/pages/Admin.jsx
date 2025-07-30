import { Plus, Edit, Trash2, Home, RefreshCw, Zap, Video, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router';
import { useState , useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/navbar/Navbar';
import Loader from '../components/loader/Loader';
// import RecentActivity from '../components/recentActivity/RecentActivity';

function Admin() {

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      iconBgColor: 'bg-green-500/10',
      iconTextColor: 'text-green-400',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      iconBgColor: 'bg-amber-500/10',
      iconTextColor: 'text-amber-400',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform permanently',
      icon: Trash2,
      iconBgColor: 'bg-red-500/10',
      iconTextColor: 'text-red-400',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Solution',
      description: 'Upload or manage video solutions for problems',
      icon: Video,
      iconBgColor: 'bg-sky-500/10',
      iconTextColor: 'text-sky-400',
      route: '/admin/video'
    } ,
    {
      id: 'contest',
      title: 'Create Contest',
      description: 'Create contest for users',
      icon: Video,
      iconBgColor: 'bg-sky-500/10',
      iconTextColor: 'text-sky-400',
      route: '/admin/contest'
    }
  ];

  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [users , setUsers] = useState() ;

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosClient.get('/problem/getAllProblems');
        setProblems(data);
        console.log(problems) ;
      } catch (error) { 
        console.error('Error fetching problems:', error);
        setProblems([]);
      } finally {
        // setIsLoading(false);
      }
    };
    fetchProblems();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      // setIsLoading(true);
      try {
        const { data } = await axiosClient.get('/user/getAllUsers');
        setUsers(data);
      } catch (error) { 
        console.error('Error fetching problems:', error);
        setProblems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [users?.length]);

  if(isLoading)
  {
    return(
      <Loader></Loader>
    )
  }

  return (
    <div className="min-h-screen w-full bg-transparent text-foreground font-sans">
      <Navbar></Navbar>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">
              Admin Panel
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-[var(--placeholder-text)]">
            Manage, create, and organize coding problems and resources with ease
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-lg mr-4">
                <Home size={24} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--placeholder-text)]">Total Problems</p>
                <p className="text-2xl font-bold text-[var(--card-foreground)]">{problems?.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/10 rounded-lg mr-4">
                <Zap size={24} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--placeholder-text)]">Active Users</p>
                <p className="text-2xl font-bold text-[var(--card-foreground)]">{users?.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
                <Video size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--placeholder-text)]">Video Solutions</p>
                <p className="text-2xl font-bold text-[var(--card-foreground)]">{problems?.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/10 rounded-lg mr-4">
                <RefreshCw size={24} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-[var(--placeholder-text)]">Pending Updates</p>
                <p className="text-2xl font-bold text-[var(--card-foreground)]">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Options Grid */}
        <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="group relative flex flex-col text-center bg-[var(--card)] border border-[var(--border)] rounded-lg transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-to"
              >
                <div className="flex-grow flex flex-col items-center p-8">
                  {/* Icon */}
                  <div className={`flex items-center justify-center h-16 w-16 rounded-full mb-6  ${option.iconBgColor} transition-colors duration-300 group-hover:scale-110 `}>
                    <IconComponent size={32} className={option.iconTextColor} />
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-3">
                    {option.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-[var(--placeholder-text)] mb-8 flex-grow">
                    {option.description}
                  </p>

                  {/* Action Button */}
                  <div className="mt-auto w-full">
                    <NavLink 
                      to={option.route}
                      className="inline-flex items-center justify-center w-full px-6 py-3 font-semibold text-[var(--button-text)] rounded-md bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] shadow-lg shadow-[var(--primary-from)]/20 transform-gpu transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-[var(--primary-to)]/30 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--primary-from)]/50 focus:ring-offset-2 focus:ring-offset-[var(--card)]"
                    >
                      {option.title}
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* Recent Activity Section */}
        <div className="mt-16 bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--card-foreground)]">
              <span className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">
                Recent Activity
              </span>
            </h2>
            <button className="text-sm text-[var(--placeholder-text)] hover:text-[var(--card-foreground)] transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-green-500/10 rounded-lg mr-4">
                <Plus className="text-green-400" size={18} />
              </div>
              <div>
                <p className="text-[var(--card-foreground)]">Added new problem: <span className="font-medium">Binary Search Tree Traversal</span></p>
                <p className="text-xs text-[var(--placeholder-text)] mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-amber-500/10 rounded-lg mr-4">
                <Edit className="text-amber-400" size={18} />
              </div>
              <div>
                <p className="text-[var(--card-foreground)]">Updated problem: <span className="font-medium">Graph Algorithms</span></p>
                <p className="text-xs text-[var(--placeholder-text)] mt-1">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-blue-500/10 rounded-lg mr-4">
                <Video className="text-blue-400" size={18} />
              </div>
              <div>
                <p className="text-[var(--card-foreground)]">Added video solution: <span className="font-medium">Dynamic Programming</span></p>
                <p className="text-xs text-[var(--placeholder-text)] mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
        {/* <RecentActivity></RecentActivity> */}

      </div>
    </div>
  );
}

export default Admin;