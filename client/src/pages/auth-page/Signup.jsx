import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { clearError, signupUser } from '@/store/auth-slice/user';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading, user } = useSelector((state) => state.auth);
  useEffect(() => {}, [user, loading, navigate, dispatch]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Wait for the actual result before deciding success vs failure.
      await dispatch(signupUser({ name, email, password })).unwrap();
      toast.success(
        'Registration successful! Please check your email for the OTP.'
      );
      // Go straight to OTP entry — the account is not verified yet.
      navigate('/verify-email');
    } catch {
      // Failure message is surfaced by the error effect below.
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [dispatch, error, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white text-black dark:bg-gray-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-6 rounded-lg shadow-xl text-center bg-white text-black dark:bg-gray-900 dark:text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <div className="mb-3 flex items-center border rounded-lg px-3 bg-white text-black dark:bg-gray-900 dark:text-white">
          <Person className="text-gray-400" />
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 focus:outline-none bg-transparent"
          />
        </div>

        <div className="mb-3 flex items-center border rounded-lg px-3 bg-white text-black dark:bg-gray-900 dark:text-white">
          <Email className="text-gray-400" />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 focus:outline-none bg-transparent"
          />
        </div>

        <div className="mb-3 flex items-center border rounded-lg px-3 bg-white text-black dark:bg-gray-900 dark:text-white">
          <Lock className="text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 focus:outline-none bg-transparent"
          />
          {showPassword ? (
            <VisibilityOff
              className="text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <Visibility
              className="text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          )}
        </div>

        <button
          className="w-full bg-yellow-500 text-white font-bold py-2 rounded-lg transition-transform transform hover:scale-105 hover:bg-yellow-600"
          onClick={handleSubmit}
        >
          Sign Up
        </button>

        <p className="text-gray-600 mt-4">
          Already have an account?
          <Link
            to="/login"
            className="text-yellow-500 font-bold cursor-pointer ml-1"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
