import { useEffect } from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    window.history.replaceState(null, '', window.location.href);

    const preventBack = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('popstate', preventBack);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-6">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
        <CheckCircle className="text-green-500 dark:text-green-400 w-16 h-16 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Thank you for shopping with us. Your order will be processed soon.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Return to Home
          </button>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate('/my-orders')}
            className="bg-yellow-500 hover:bg-yellow-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
