import { Link } from 'react-router';
import { XCircle } from 'lucide-react'; 

const PaymentCanceled = () => {
    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <XCircle className="text-red-400 w-16 h-16 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-red-400 mb-4">Payment Canceled</h1>
                <p className="text-gray-300 mb-6">Your payment was not processed. Your card has not been charged. You can try again or contact support if the issue persists.</p>
                <Link to="/plans" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    View Plans
                </Link>
            </div>
        </div>
    );
};


export default PaymentCanceled ;