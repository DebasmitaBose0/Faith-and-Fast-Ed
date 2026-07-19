import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Email, Lock } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  sendResetOtp,
  verifyResetOtp,
  clearPasswordState,
  clearPasswordMessages,
} from "@/store/auth-slice/updatePasswordSlice";
import MetaData from "../extras/MetaData";

const ForgotPassword = () => {
  const [email, setLocalEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, message, otpSent, otpVerified } = useSelector(
    (state) => state.updatePassword
  );

  // Start from a clean slate whenever the page mounts.
  useEffect(() => {
    dispatch(clearPasswordState());
  }, [dispatch]);

  // Surface server/validation messages.
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPasswordMessages());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearPasswordMessages());
    }
  }, [message, dispatch]);

  // Once the OTP is verified, move to the reset step carrying the email.
  useEffect(() => {
    if (otpVerified) {
      navigate("/reset-password", { state: { email, otp } });
    }
  }, [otpVerified, navigate, email, otp]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    dispatch(sendResetOtp(email));
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }
    dispatch(verifyResetOtp({ email, otp }));
  };

  const handleResend = () => {
    if (email) {
      dispatch(sendResetOtp(email));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white text-black dark:bg-gray-800 dark:text-white">
      <MetaData title="Forgot Password | Faith AND Fast" />
      <div className="w-96 p-6 rounded-lg shadow-md text-center bg-white text-black dark:bg-gray-900 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

        {!otpSent ? (
          <form onSubmit={handleEmailSubmit}>
            <p className="mb-4">
              Enter your registered email to receive a verification OTP.
            </p>
            <div className="mb-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-black dark:bg-gray-900 dark:text-white p-2">
                <Email />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  className="ml-2 w-full outline-none bg-transparent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 dark:bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <p className="mb-4">
              Enter the 6-digit OTP sent to <strong>{email}</strong>.
            </p>
            <div className="mb-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-black dark:bg-gray-900 dark:text-white p-2">
                <Lock />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter the OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="ml-2 w-full outline-none bg-transparent text-center tracking-widest font-semibold"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 dark:bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="mt-4 text-yellow-500 dark:text-red-500 font-bold hover:underline disabled:opacity-60"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
