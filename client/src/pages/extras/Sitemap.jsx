import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sitemap = () => {
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/verify-email', name: 'Verify Email' },
    { path: '/login', name: 'Login' },
    { path: '/forgot-password', name: 'Forgot Password' },
    { path: '/reset-password', name: 'Reset Password' },
    { path: '/my-profile', name: 'My Profile' },
    { path: '/my-orders', name: 'My Orders' },
    { path: '/order-success', name: 'Order Success' },
    { path: '/update-password', name: 'Update Password' },
    { path: '/update-profile', name: 'Update Profile' },
    { path: '/saved-address', name: 'Saved Address' },
    { path: '/products', name: 'Products' },
    { path: '/cart', name: 'Cart' },
    { path: '/wishlist', name: 'Wishlist' },
    { path: '/about', name: 'About Us' },
    { path: '/contactus', name: 'Contact Us' },
    { path: '/signup', name: 'Sign Up' },
    { path: '/faqs', name: 'FAQs' },
    { path: '/privacy-policy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms & Conditions' },
    { path: '/sitemap', name: 'Sitemap' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-16 px-6 sm:px-12 lg:px-16"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white text-center mb-12 tracking-tight"
        >
          Sitemap
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map(({ path, name }, index) => (
            <motion.div
              key={path}
              variants={linkVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800/90 shadow-lg rounded-xl p-4 transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <Link
                to={path}
                className="block text-lg font-medium text-yellow-500 dark:text-red-600 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                {name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Sitemap;
