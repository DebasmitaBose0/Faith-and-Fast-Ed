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
import gsap from 'gsap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/validation/schemas';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const { error, loading, user } = useSelector((state) => state.auth);
  useEffect(() => {}, [user, loading, navigate, dispatch]);

  const onSignupSubmit = async (data) => {
    try {
      await dispatch(signupUser(data)).unwrap();
      toast.success(
        'Registration successful! Please check your email for the OTP.'
      );
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

    gsap.from('.login-form', { opacity: 0, y: -30, duration: 1 });
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

        <form onSubmit={handleSubmit(onSignupSubmit)}>
          <div className="mb-1 flex items-center border rounded-lg px-3 bg-white text-black dark:bg-gray-900 dark:text-white">
            <Person className="text-gray-400" />
            <input
              type="text"
              placeholder="Enter your full name"
              {...register('name')}
              className="w-full p-2 focus:outline-none bg-transparent"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs text-left mb-2 pl-1">
              {errors.name.message}
            </p>
          )}

          <div className="mb-1 mt-3 flex items-center border rounded-lg px-3 bg-white text-black dark:bg-gray-900 dark:text-white">
            <Email className="text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className="w-full p-2 focus:outline-none bg-transparent"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs text-left mb-2 pl-1">
              {errors.email.message}
            </p>
          )}

          <div className="mb-1 mt-3 flex items-center border rounded-lg px-3 bg-white text-black dark:bg-gray-900 dark:text-white">
            <Lock className="text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password')}
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
          {errors.password && (
            <p className="text-red-500 text-xs text-left mb-2 pl-1">
              {errors.password.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-yellow-500 text-white font-bold py-2 rounded-lg transition-transform transform hover:scale-105 hover:bg-yellow-600"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-600 dark:text-gray-400 mt-4">
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
