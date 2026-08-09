import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const PrivacyPolicy = () => {
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
          Privacy Policy
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
            title="1. Information We Collect"
            content="We collect personal information like name, email, phone number, and payment details when you register, make a purchase, or interact with our platform."
          />

          <Section
            title="2. How We Use Your Information"
            content="We use your information to process orders, provide customer support, improve our services, and ensure security. We do not sell your personal data to third parties."
          />

          <Section
            title="3. Payment Security"
            content="We currently support Cash on Delivery (COD). No online payment information is collected or stored on our servers."
          />

          <Section
            title="4. Advertisements on Platform"
            content="We may display third-party advertisements based on your interactions with our platform. These ads may use cookies or similar technologies to provide relevant content."
          />

          <Section
            title="5. Children’s Information"
            content="Our platform is not intended for children under 18. We do not knowingly collect personal data from children. If you believe a child has provided us with their information, please contact us immediately."
          />

          <Section
            title="6. Cookies and Tracking Technologies"
            content="We use cookies to enhance user experience, analyze traffic, and personalize content. You can manage cookie preferences in your browser settings."
          />

          <Section
            title="7. Data Protection and Security"
            content="We implement strict security measures to protect your personal data. However, no online service is completely secure. We recommend using strong passwords and keeping your login credentials confidential."
          />

          <Section
            title="8. Changes to This Privacy Policy"
            content="We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date."
          />

          <Section
            title="9. Contact Us"
            content={
              <>
                If you have any questions about this Privacy Policy, please{' '}
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

export default PrivacyPolicy;
