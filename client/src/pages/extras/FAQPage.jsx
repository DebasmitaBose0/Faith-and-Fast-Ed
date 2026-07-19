import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import MetaData from "./MetaData";
import contactConfig from "../../config/contact";

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept Cash on Delivery (COD).",
  },
  {
    question: "What is Cash on Delivery?",
    answer:
      "Cash on Delivery (COD) allows you to pay for your order in cash when it’s delivered to your doorstep.",
  },
  {
    question: "How is a 'business day' different from a regular day?",
    answer:
      "A business day refers to working days (Monday to Friday), excluding public holidays and weekends.",
  },
  {
    question: "How much is the platform fee?",
    answer:
      "Our platform is totally free! No extra charges for browsing or purchasing products.",
  },
  {
    question: "What's not allowed in product reviews?",
    answer:
      "Fake, abusive, or promotional content is not allowed in product reviews.",
  },
  {
    question: "What can I write in product reviews?",
    answer: "You can write about your personal experience with the product.",
  },
  {
    question: "Are there any guidelines for writing product reviews?",
    answer:
      "Yes. Reviews should be honest, relevant, and respectful. Avoid spam, advertisements, or offensive content.",
  },
  {
    question:
      "If I have found a security Bug/Vulnerability/Issue, what should I do?",
    answer: (
      <>
        Please report security vulnerabilities by emailing us at{" "}
        <strong>{contactConfig.contact_details.email}</strong> with the following details:
        <ol className="list-decimal ml-5 mt-2">
          <li>Steps to reproduce the bug/issue.</li>
          <li>Your web browser/mobile browser’s name and version.</li>
          <li>Screenshot/screencast (if any).</li>
        </ol>
      </>
    ),
  },
  {
    question: "Do I need to verify my email address while signing up?",
    answer:
      "Yes, email verification is required to ensure account security and prevent fraud.",
  },
  {
    question: "Why do I need to verify my email address while signing up?",
    answer:
      "Email verification helps protect your account from unauthorized access and allows us to send important order updates.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Shipping usually takes 5-10 business days depending on your location.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You will receive a tracking number on your My Orders page once your order has been shipped.",
  },
  {
    question: "What is an OTP or verification code?",
    answer:
      "An OTP (One-Time Password) is a temporary code sent to your registered email or phone for security verification.",
  },
  {
    question: "Will I have to pay a cancellation fee?",
    answer: "No, there is no cancellation fee.",
  },
  {
    question: "How long does it take to cancel an order?",
    answer:
      "If the seller hasn’t shipped the order, it will be cancelled immediately. If already shipped, cancellation is not possible.",
  },
  {
    question: "How do I contact customer support?",
    answer: (
      <>
        You can reach us via email at <strong>{contactConfig.contact_details.email}</strong>.
      </>
    ),
  },
  {
    question: "How can I contact you?",
    answer: (
      <>
        You can visit our{" "}
        <Link
          to="/ContactUs"
          className="text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          Contact Us
        </Link>{" "}
        page for any inquiries.
      </>
    ),
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8"
    >
      <MetaData
        title="FAQs | Faith AND Fast"
        description="Find answers to frequently asked questions about Faith AND Fast, including payments, shipping, order tracking, and more."
        keywords="Faith AND Fast FAQs, online shopping questions, payment methods, shipping details, order tracking, cancellation policy"
      />

      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white text-center mb-12 tracking-tight"
        >
          Frequently Asked Questions
        </motion.h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform hover:shadow-2xl transition-all duration-300 group"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left text-xl font-semibold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors duration-200"
              >
                <span>{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="px-6 pb-6 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Still have questions?{" "}
            <Link
              to="/ContactUs"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-colors duration-200"
            >
              Get in Touch
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQPage;
