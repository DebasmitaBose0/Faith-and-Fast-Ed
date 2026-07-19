import React from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught render error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-6">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <FiAlertTriangle className="mx-auto text-7xl text-yellow-500 dark:text-red-600 mb-4" />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              Something went wrong
            </motion.h1>

            <motion.p
              className="text-gray-600 dark:text-gray-400 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              An unexpected error occurred. Please try again or return home.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-300"
              >
                <FiRefreshCw className="text-xl" />
                Try again
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold text-lg rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <FiHome className="text-xl" />
                Go Home
              </a>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
