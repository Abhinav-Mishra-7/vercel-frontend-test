import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, Calendar, Clock, AlertTriangle, ArrowLeft, History, ShoppingCart } from 'lucide-react';
import axiosClient from '../../utils/axiosClient'; // Assuming path is correct
import Loader from '../loader/Loader';

const PremiumDetails = () => {
  const [subscription, setSubscription] = useState({
    isLoading: true,
    isPremium: false,
    premiumUntil: null,
    lastPayment: null,
    error: null,
  });

  useEffect(() => {
    // This function runs when the page loads
    const fetchDetails = async () => {
      try {
        // Fetch both subscription status and last payment details simultaneously
        const [statusResponse, paymentResponse] = await Promise.all([
          axiosClient.get('/user/subscription-status'),
          axiosClient.get('/payments/last-payment')
        ]);

        setSubscription({
          isLoading: false,
          isPremium: statusResponse.data.isPremium,
          premiumUntil: statusResponse.data.premiumUntil ? new Date(statusResponse.data.premiumUntil) : null,
          lastPayment: paymentResponse.data.lastPayment,
          error: null,
        });
      } catch (err) {
        console.error("Could not fetch subscription details:", err);
        setSubscription({
          isLoading: false,
          isPremium: false,
          premiumUntil: null,
          lastPayment: null,
          error: 'Could not load your subscription details. Please try again later.',
        });
      }
    };

    fetchDetails();
  }, []); // The empty array [] ensures this runs only once on mount

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };
  
  // Helper function to format currency
  const formatAmount = (amountInPaise) => {
    if (typeof amountInPaise !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amountInPaise / 100);
  };

  // Helper function to calculate remaining days
  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // This function decides what to show based on the state
  const renderContent = () => {
    // 1. Show a loader while fetching data
    if (subscription.isLoading) {
      return (
        <Loader/>
      );
    }

    // 2. Show an error message if the API call failed
    if (subscription.error) {
      return (
        <div className="text-center p-12 flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-[var(--accent-gold)]" />
            <p className="mt-4 text-lg text-white">{subscription.error}</p>
        </div>
      );
    }
    
    // 3. Show a message if the user has no active subscription
    if (!subscription.isPremium) {
        return (
            <div className="text-center p-12 flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 text-[var(--accent-gold)]" />
                <p className="mt-4 text-lg text-white">No active premium subscription found.</p>
                <Link
                  to="/plansPage" className="mt-6 inline-block px-6 py-2.5 font-semibold text-white rounded-md bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] transition-transform transform hover:scale-105"
                >
                  View Plans
                </Link>
            </div>
        );
    }

    // 4. If everything is fine, show the full details
    const daysLeft = calculateDaysLeft(subscription.premiumUntil);
    const { lastPayment } = subscription;

    return (
      <>
        <div className="p-8 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-center">
          <BadgeCheck className="mx-auto h-16 w-16 text-white" />
          <h1 className="mt-4 text-3xl font-bold text-[var(--button-text)]">Premium Membership Active</h1>
        </div>

        <div className="p-8 flex flex-col gap-8">
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Current Status</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-[var(--input-background)] rounded-lg">
                        <Calendar className="h-10 w-10 text-[var(--primary-from)]" />
                        <p className="mt-3 text-sm text-[var(--placeholder-text)]">Expires On</p>
                        <p className="text-2xl font-bold text-white mt-1">{formatDate(subscription.premiumUntil)}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-[var(--input-background)] rounded-lg">
                        <Clock className="h-10 w-10 text-[var(--primary-from)]" />
                        <p className="mt-3 text-sm text-[var(--placeholder-text)]">Time Remaining</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {daysLeft} Day{daysLeft !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {lastPayment && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Last Payment Details</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                         <div className="flex flex-col items-center justify-center p-6 bg-[var(--input-background)] rounded-lg">
                            <History className="h-10 w-10 text-[var(--primary-from)]" />
                            <p className="mt-3 text-sm text-[var(--placeholder-text)]">Payment Date</p>
                            <p className="text-2xl font-bold text-white mt-1">{formatDate(lastPayment.createdAt)}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 bg-[var(--input-background)] rounded-lg">
                            <ShoppingCart className="h-10 w-10 text-[var(--primary-from)]" />
                            <p className="mt-3 text-sm text-[var(--placeholder-text)]">Plan Purchased</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {lastPayment.plan.charAt(0).toUpperCase() + lastPayment.plan.slice(1)}
                                <span className="text-base font-medium text-[var(--placeholder-text)]"> ({formatAmount(lastPayment.amount)})</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-6 bg-black/20 text-center">
            <Link
              to="/plansPage"
              className="inline-block px-8 py-3 font-semibold text-white rounded-md bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] hover:shadow-lg hover:shadow-oklch(var(--primary-from)/0.2)
              transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Extend or Upgrade Plan
            </Link>
        </div>
      </>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-[var(--card)] rounded-lg shadow-2xl border border-[var(--border)] relative">
        <Link to="/plansPage" className="absolute top-4 left-4 text-[var(--placeholder-text)] hover:text-white transition-colors">
            <ArrowLeft size={24} />
        </Link>
        {renderContent()}
      </div>
    </div>
  );
};


export default PremiumDetails ;