import { CheckCircle, ShieldCheck, Calendar, Hash, FileText, Gift } from 'lucide-react';
import { useLocation, Link } from 'react-router';

const PaymentSuccessPage = () => {
  const location = useLocation();

  // Safely access state with default fallbacks
  const { state } = location;
  const paymentDetails = {
    paymentId: state?.paymentId || 'N/A',
    orderId: state?.orderId || 'N/A',
    planId: state?.planId || 'Unknown Plan',
    message: state?.message || 'Your subscription has been activated successfully!'
  };

  // Extract the expiry date from the message for display
  const expiryDateMatch = paymentDetails.message.match(/until (.*)\./);
  const expiryDate = expiryDateMatch ? expiryDateMatch[1] : 'Lifetime';

  const DetailRow = ({ icon, label, value, isMonospace = false }) => (
    <div className="flex justify-between items-center py-4 border-b border-[var(--border)] last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="text-[var(--primary-from)]">{icon}</span>
        <span className="text-sm font-medium text-[var(--card-foreground)]">{label}</span>
      </div>
      <span className={`text-sm text-right ${isMonospace ? 'font-mono text-[var(--placeholder-text)]' : 'font-semibold text-white'}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div 
        className="w-full max-w-2xl bg-[var(--card)] rounded-lg shadow-2xl overflow-hidden
                   border border-[var(--border)] transition-all duration-500"
        style={{'--shadow-color': 'oklch(var(--primary-from) / 0.2)'}}
      >
        {/* Header Section */}
        <div className="p-8 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-white animate-pulse" />
          <h1 className="mt-4 text-3xl font-bold text-[var(--button-text)]">Payment Successful!</h1>
          <p className="mt-2 text-white/90">Your premium access has been activated.</p>
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white mb-4">Subscription Details</h2>
          <div className="flex flex-col gap-2">
            <DetailRow icon={<Gift size={20} />} label="Plan Activated" value={paymentDetails.planId.charAt(0).toUpperCase() + paymentDetails.planId.slice(1)} />
            <DetailRow icon={<Calendar size={20} />} label="Valid Until" value={expiryDate} />
          </div>

          <h2 className="text-lg font-semibold text-white mt-8 mb-4">Transaction Receipt</h2>
          <div className="flex flex-col gap-2 bg-[var(--input-background)] p-4 rounded-md">
            <DetailRow icon={<ShieldCheck size={20} />} label="Payment ID" value={paymentDetails.paymentId} isMonospace />
            <DetailRow icon={<FileText size={20} />} label="Order ID" value={paymentDetails.orderId} isMonospace />
            <DetailRow icon={<Hash size={20} />} label="Status" value="Confirmed" />
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-black/20 text-center">
            <Link
              to="/" className="inline-block px-8 py-3 font-semibold text-white rounded-md bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] transition-all duration-00 transform hover:-translate-y-0.5 mr-5"
            >
              Start Exploring
            </Link>
            <Link
              to="/my-premium" className="inline-block px-8 py-3 font-semibold text-white rounded-md bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              My Premium
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

