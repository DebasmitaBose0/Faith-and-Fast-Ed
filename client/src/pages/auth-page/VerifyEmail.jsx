import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { resendOtp, verifyEmailOtp } from '@/store/auth-slice/otpSlice';
import { toast } from 'react-toastify';
import MetaData from '../extras/MetaData';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, successMessage, verifyEmail } = useSelector(
    (state) => state.otp
  );
  const { user } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState('');

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (verifyEmail) {
      navigate(redirect);
    }
  }, [verifyEmail, navigate, redirect]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return alert('OTP must be 6 digits');

    dispatch(verifyEmailOtp({ email: user?.email, otp }));
  };

  const handleResendOtp = () => {
    if (user?.email) {
      dispatch(resendOtp(user.email));
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MetaData title="Verify OTP | Faith AND Fast" />
      <motion.div
        className="bg-white dark:bg-black p-6 rounded-lg shadow-md max-w-md w-full text-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-4">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-200">
          Enter the 6-digit OTP sent to{' '}
          <strong>{user?.email || 'your email'}</strong>
        </p>

        <form onSubmit={handleVerify} className="mt-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            placeholder="Enter OTP"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-900 text-center text-lg font-semibold"
          />
          <button
            type="submit"
            className="w-full mt-4 p-3 bg-yellow-500 text-white rounded-lg font-bold dark:bg-red-600 transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        {error && toast.error(error)}
        {successMessage && toast.success(successMessage)}

        <motion.button
          onClick={handleResendOtp}
          className="mt-4 text-yellow-500 dark:text-red-600 font-bold hover:underline"
          whileHover={{ scale: 1.05 }}
          disabled={loading}
        >
          Resend OTP
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default VerifyEmail;
