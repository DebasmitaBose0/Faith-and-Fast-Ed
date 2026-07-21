import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, KeyRound, Shield } from 'lucide-react';
import { updatePassword } from '@/store/auth-slice/updatePasswordSlice';

const UpdatePassword = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector(
    (state) => state.updatePassword
  );

  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePassword(formData));
  };

  useEffect(() => {
    if (success) {
      setFormData({
        email: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    }
    if (error) {
      toast.error('Something went wrong');
    }
  }, [success, error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200 bg-white dark:bg-black text-black dark:text-white">
      <div className="w-full max-w-lg rounded-xl shadow-2xl p-8 transition-all duration-200 transform hover:scale-[1.02] bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-yellow-800" />
            <h2 className="text-2xl font-bold">Update Password</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 mb-6 rounded-lg  dark:bg-gray-900 text-black bg-white dark:text-white">
          <Shield className="text-yellow-800" />
          <p>
            Ensure your new password is at least 8 characters long for better
            security
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 bg-white text-black dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New Password"
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 bg-white text-black dark:bg-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 bg-white text-black dark:bg-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 transform hover:translate-y-[-1px] bg-yellow-500 dark:bg-yellow-800"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
