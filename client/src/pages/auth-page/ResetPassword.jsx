import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Lock } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  updatePassword,
  clearPasswordState,
  clearPasswordMessages,
} from "@/store/auth-slice/updatePasswordSlice";
import MetaData from "../extras/MetaData";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    loading,
    success,
    error,
    email: storedEmail,
  } = useSelector((state) => state.updatePassword);

  // Email comes from the verified forgot-password step (router state first,
  // redux as fallback).
  const email = location.state?.email || storedEmail;
  // The OTP proven in the verify step is threaded via router state and must be
  // re-sent to the reset endpoint, which now verifies it server-side.
  const otp = location.state?.otp;

  // Guard: this page is only reachable after OTP verification. Without an email
  // and OTP there is nothing to reset, so send the user back to start the flow.
  useEffect(() => {
    if (!email || !otp) {
      toast.error("Please verify your email before resetting your password.");
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  // Surface errors.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPasswordMessages());
    }
  }, [error, dispatch]);

  // On success, notify and redirect to login.
  useEffect(() => {
    if (success) {
      toast.success("Password reset successful! Please log in.");
      dispatch(clearPasswordState());
      navigate("/login");
    }
  }, [success, navigate, dispatch]);

  const handleReset = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    dispatch(
      updatePassword({ email, otp, newPassword: password, confirmPassword })
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <MetaData title="Reset Password | Faith AND Fast" />
      <div className="w-96 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Reset Password
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Enter your new password below.
        </p>

        <form onSubmit={handleReset}>
          <div className="mb-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
              <Lock className="text-gray-500 dark:text-gray-400" />
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ml-2 w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
              <Lock className="text-gray-500 dark:text-gray-400" />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ml-2 w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 dark:bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-red-700 transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
