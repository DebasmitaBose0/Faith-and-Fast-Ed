import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleDetail, loginUser } from '@/store/auth-slice/user';
import { toast } from 'react-toastify';
import MetaData from '../extras/MetaData';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const { verifyEmail } = useSelector((state) => state.otp);

  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/';

  const loginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (isAuthenticated) {
      dispatch(getSingleDetail());

      toast.success('Login successful');
      navigate(redirect);

      const isEmailVerified = localStorage.getItem('verifyEmail') === 'true';
      if (!verifyEmail && !isEmailVerified) {
        navigate('/verify-email');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, error, navigate, redirect, verifyEmail, dispatch]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white text-black dark:bg-gray-800 dark:text-white">
      <MetaData
        title="Login | Faith AND Fast - Secure Access to Your Account"
        description="Sign in to your Faith AND Fast account to track orders, manage your wishlist, and enjoy exclusive fashion deals. Secure and hassle-free login experience!"
        keywords="Faith AND Fast login, sign in, user account, fashion store login, track orders, wishlist, secure shopping"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-6 rounded-lg shadow-xl text-center bg-white text-black dark:bg-gray-900 dark:text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>

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

        <div className="flex justify-between items-center mb-3">
          <label className="flex items-center text-gray-600">
            <input type="checkbox" className="mr-1" /> Keep me logged in
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-yellow-500 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          className="w-full bg-yellow-500 text-white font-bold py-2 rounded-lg transition-transform transform hover:scale-105 hover:bg-yellow-600"
          disabled={loading}
          onClick={loginSubmit}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-gray-600 mt-4">
          Not a member yet?
          <Link
            to="/signup"
            className="text-yellow-500 font-bold cursor-pointer ml-1"
          >
            Register now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
