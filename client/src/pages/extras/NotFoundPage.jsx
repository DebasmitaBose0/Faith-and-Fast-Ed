import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-6 not-found-wrapper" role="main">
      <motion.div
        className="text-center not-found-card"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.h1
          className="text-8xl font-extrabold text-yellow-500 dark:text-red-600 not-found-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          aria-label="Error Code 404"
        >
          404
        </motion.h1>

        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mt-4 not-found-message"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          aria-live="polite"
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-300"
            aria-label="Return to the store homepage"
          >
            <FiArrowLeft className="text-xl" aria-hidden="true" />
            Go Back Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
