import { useState } from 'react';
import { Link } from 'react-router';
import { Code, Bot, Building2, BookOpen, Star, BarChartHorizontal, Gem } from 'lucide-react';
import PlanCard from "../components/payment/PlanCard"; // Assuming path is correct
import PlanComparisonTable from '../components/payment/PlanComparisonTable'; // Assuming path is correct
import Navbar from "../components/navbar/Navbar"

const PlansPage = () => {
  const [currency, setCurrency] = useState('INR');
  const [showComparison, setShowComparison] = useState(false);

  const plans = [
      {
        id: 'free-trial',
        name: 'Free Trial',
        priceINR: '₹0',
        priceUSD: '$0',
        period: '/ 7 days',
        features: [
          { text: '5 Standard Questions', icon: <Code size={18} /> },
          { text: '10 AI Chat Prompts', icon: <Bot size={18} /> },
          { text: 'Community Support', icon: <BookOpen size={18} /> },
        ],
        buttonText: 'Start Free Trial',
        theme: {
          mainColor: 'slate',
          gradientFrom: 'from-slate-600',
          gradientTo: 'to-slate-700',
          accentColor: 'text-slate-400',
          borderColor: 'border-slate-500',
          shadowColor: 'hover:shadow-slate-500/20',
          buttonClasses: 'bg-slate-600 hover:bg-slate-700',
        }
      },
      {
        id: 'monthly',
        name: 'Monthly',
        priceINR: '₹100',
        priceUSD: '$1.20',
        period: '/month',
        features: [
          { text: 'All Standard Questions', icon: <Code size={18} /> },
          { text: 'Limited Chat with AI', icon: <Bot size={18} /> },
          { text: 'Problem Solutions', icon: <BookOpen size={18} /> },
        ],
        buttonText: 'Get Started',
        theme: {
          mainColor: 'sky',
          gradientFrom: 'from-sky-500',
          gradientTo: 'to-cyan-500',
          accentColor: 'text-sky-400',
          borderColor: 'border-sky-500',
          shadowColor: 'hover:shadow-sky-500/25',
          buttonClasses: 'bg-sky-600 hover:bg-sky-700',
        }
      },
      {
        id: 'yearly',
        name: 'Yearly',
        priceINR: '₹1000',
        priceUSD: '$12',
        period: '/year',
        highlight: 'Most Popular',
        features: [
          { text: 'All Standard Questions', icon: <Code size={18} /> },
          { text: 'Unlimited Chat with AI', icon: <Bot size={18} /> },
          { text: 'Company Specific Problems', icon: <Building2 size={18} /> },
          { text: 'Access to All Courses', icon: <BookOpen size={18} /> },
        ],
        buttonText: 'Go Yearly',
        theme: {
          mainColor: 'indigo',
          gradientFrom: 'from-indigo-500',
          gradientTo: 'to-purple-600',
          accentColor: 'text-indigo-400',
          borderColor: 'border-indigo-500',
          shadowColor: 'hover:shadow-indigo-500/30',
          buttonClasses: 'bg-indigo-600 hover:bg-indigo-700',
        }
      },
      {
        id: 'lifetime',
        name: 'Lifetime',
        priceINR: '₹2000',
        priceUSD: '$24',
        period: '/ one-time',
        features: [
          { text: 'All Current & Future Content', icon: <Star size={18} /> },
          { text: 'Unlimited Chat with AI', icon: <Bot size={18} /> },
          { text: 'All Company Problems', icon: <Building2 size={18} /> },
          { text: 'Priority Support', icon: <BookOpen size={18} /> },
        ],
        buttonText: 'Go Lifetime',
        theme: {
          mainColor: 'red',
          gradientFrom: 'from-red-500',
          gradientTo: 'to-orange-500',
          accentColor: 'text-red-400',
          borderColor: 'border-red-500',
          shadowColor: 'hover:shadow-red-500/30',
          buttonClasses: 'bg-red-600 hover:bg-red-700',
        }
      },
  ];

  return (
    <>
      <Navbar/>
      <div className="w-full min-h-screen overflow-x-hidden">
        <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8">
          <div className="text-center mb-12 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4">
              Unlock Your Coding Potential
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Choose the perfect plan to accelerate your journey from learner to pro developer.
            </p>
            
            {/* Controls (Currency toggle, Comparison button) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center bg-slate-800/50 backdrop-blur rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                    currency === 'INR' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                    currency === 'USD' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
              </div>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="px-6 py-3 font-medium rounded-lg bg-gradient-to-r from-cyan-600 to-teal-700 text-white hover:from-cyan-700 hover:to-teal-800 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 flex items-center transform hover:-translate-y-0.5"
              >
                <BarChartHorizontal className="h-5 w-5 mr-2" />
                {showComparison ? 'Show Plans' : 'Show Comparison'}
              </button>

              <Link
                to="/my-premium"
                className="inline-flex items-center gap-3 px-6 py-3 font-semibold text-white rounded-lg
                          bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)]
                          hover:shadow-lg hover:shadow-oklch(var(--primary-from)/0.3)
                          transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Gem size={20} />
                View My Premium
              </Link>
              
            </div>
          </div>
          
          {/* Main Content (Plan Cards) */}
          <div className="w-full max-w-7xl mx-auto">
            {showComparison ? (
              <PlanComparisonTable plans={plans} currency={currency} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                {plans.map((plan) => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    currency={currency} 
                  />
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-12 text-slate-500 text-sm max-w-2xl">
            <p>All payments are secure and encrypted. You own your data, always. 30-day money-back guarantee for paid plans.</p>
          </div>
        </div>
        
        <style jsx global>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default PlansPage;