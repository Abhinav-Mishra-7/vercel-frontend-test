import { useState } from 'react';
import clsx from 'clsx';
import axiosClient from '../../utils/axiosClient'; 
import useRazorpay from '../../hooks/useRazorpay';
import {toast} from "react-toastify" ;
import { useNavigate } from 'react-router';

const PlanCard = ({ plan, currency }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate() ;

  // Loading the Razorpay script
  useRazorpay();

  const handleCheckout = async () => {
    // Not allowing payment for free trial or USD (as backend is INR only)
    if (plan.id === 'free-trial' || currency === 'USD') {
        if (currency === 'USD') setError('Payments in USD are not yet supported.');
        else alert('Redirecting to trial...'); // Or handle trial activation
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        // 1. Create Order on the backend
        const { data: orderData } = await axiosClient.post('/payments/create-order', { planId: plan.id });
        
        if (!orderData || !orderData.orderId) {
          throw new Error("Failed to create order.");
        }

        const { orderId, currency: orderCurrency, amount, keyId } = orderData;
        
        // 2. Configure Razorpay options
        const options = {key: keyId, amount: amount, currency: orderCurrency, name: "codeverseplus", description: `Payment for ${plan.name} Plan`, order_id: orderId,
            
          // 3. This handler function is called after payment
          handler: async function (response) {
            try {
              const verificationData = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };

              // 4. Verify the payment on the backend
              const { data: verificationResult } = await axiosClient.post('/payments/verify-payment', verificationData);

              navigate('/payment-success', { 
                state: { 
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  planId: verificationResult.planId,
                  message: verificationResult.message 
                } 
              });
                    
              toast.success(verificationResult.message);
            } 
            catch (err) {
              console.error('Payment verification failed:', err);
              setError(err.response?.data?.message || 'Payment verification failed.');
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            // You can pre-fill user details here if you have them
            // name: "User Name",
            // email: "user.email@example.com",
          },
          notes: {
            address: "codeverseplus"
          },
          theme: {
            color: "#3399cc"
          },
          modal: {
            ondismiss: function() {
              console.log('Checkout form closed');
              setIsLoading(false);
            }
          }
        };

        // 5. Open the Razorpay checkout modal
        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error('Checkout error:', err);
        setError(err.response?.data?.message || 'An error occurred during checkout.');
        setIsLoading(false);
    }
  };

  const theme = plan.theme;
  const displayPrice = currency === 'INR' ? plan.priceINR : plan.priceUSD;

  const FeatureRow = ({ icon, text }) => (
    <li className="flex items-center py-3 border-b border-slate-800/60 last:border-b-0">
      <span className={`mr-4 ${theme.accentColor}`}>{icon}</span>
      <span className="text-slate-300">{text}</span>
    </li>
  );

  return (
    <div
      className={clsx(
        'relative flex flex-col h-full bg-slate-800 rounded-xl overflow-hidden ', 
        theme.borderColor,
        'transform transition-all duration-300 ease-in-out',
        'hover:-translate-y-2 hover:shadow-2xl', 
        theme.shadowColor,
        { 'ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-400': plan.highlight}
      )}
    >
      {plan.highlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <span className="inline-block px-4 py-1 text-xs font-semibold tracking-wider text-indigo-800 uppercase bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full shadow-lg pt-6">
                {plan.highlight}
            </span>
        </div>
      )}

      <div className={`p-6 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo}`}>
        <h3 className="text-2xl font-bold text-white pt-2 text-center">{plan.name}</h3>
        <p className="text-white/80 text-center text-sm">{plan.highlight ? 'Everything in Monthly, plus:' : 'Get started with our platform'}</p>
      </div>

      <div className="flex flex-col flex-grow p-6">
        <div className="pb-4 text-center">
          <span className="text-5xl font-extrabold text-white">{displayPrice}</span>
          <span className="ml-1 text-slate-400">{plan.period}</span>
        </div>
        
        <ul className="flex-grow my-6">
          {plan.features.map((feature, index) => (
            <FeatureRow key={index} icon={feature.icon} text={feature.text} />
          ))}
        </ul>
        
        {error && <p className="text-center text-red-400 text-sm mb-2">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={isLoading || currency === 'USD'} // Disable button for USD
          className={clsx(
            'w-full py-3 mt-auto font-semibold text-white rounded-lg transition-all duration-300 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
            theme.buttonClasses,
            `focus:ring-${theme.mainColor}-500`,
            { 'opacity-50 cursor-not-allowed': isLoading || currency === 'USD', 'transform hover:scale-105': !isLoading && currency !== 'USD' }
          )}
        >
          {isLoading ? 'Processing...' : plan.buttonText}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;