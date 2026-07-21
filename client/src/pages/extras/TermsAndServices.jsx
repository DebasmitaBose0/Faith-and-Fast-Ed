import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const TermsAndServices = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
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
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white text-center mb-4 tracking-tight"
        >
          Terms & Services
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center text-gray-600 dark:text-gray-400 text-sm mb-12 italic"
        >
          Last Updated: March 2025
        </motion.p>

        <div className="space-y-8">
          <Section
            title="1. Introduction"
            content="By using our platform, you agree to abide by these Terms & Services. If you do not agree, please do not use our website."
          />

          <Section
            title="2. Eligibility"
            content="Users must be 18+ or have parental consent to use this platform. Providing false information during registration is strictly prohibited."
          />

          <Section
            title="3. Account & User Responsibilities"
            content="You are responsible for maintaining account security and must not share your login credentials with others."
          />

          <Section
            title="4. Orders & Payments"
            content="We currently accept Cash on Delivery (COD). Prices may change at any time."
          />

          <Section
            title="5. Returns, Cancellations, and Refunds"
            content="Orders can be cancelled before they are shipped. Once shipped, cancellations are not possible. Refunds are processed within 5-7 business days."
          />

          <Section
            title="6. Platform Fee"
            content="Faith and Fast does not charge any platform fees. Our services are completely free for customers."
          />

          <Section
            title="7. User Conduct & Prohibited Activities"
            content="Users must not engage in fraudulent activities, abuse, or spam. Any violations may result in account suspension."
          />

          <Section
            title="8. Privacy & Data Security"
            content={
              <>
                We value your privacy. Please review our{' '}
                <a
                  href="/privacy-policy"
                  className="text-yellow-500 dark:text-red-600 font-medium hover:underline transition-colors duration-200"
                >
                  Privacy Policy
                </a>{' '}
                for more details on how we handle your data.
              </>
            }
          />

          <Section
            title="9. Contact Us"
            content={
              <>
                If you have any questions, feel free to{' '}
                <a
                  href="/contactus"
                  className="text-yellow-500 dark:text-red-600 font-medium hover:underline transition-colors duration-200"
                >
                  contact us
                </a>
                .
              </>
            }
          />
        </div>
      </div>
    </motion.section>
  );
};

const Section = ({ title, content }) => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-white dark:bg-gray-800/90 shadow-xl rounded-xl p-8 transform hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-indigo-500 dark:border-indigo-400 pb-2">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    </motion.div>
  );
};

Section.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default TermsAndServices;
