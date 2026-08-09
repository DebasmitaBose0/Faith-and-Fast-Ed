import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Function to track scrolling
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 50,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed bottom-30 right-6  md:right-6 p-4 bg-yellow-500 dark:bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out hover:shadow-xl focus:outline-none"
      style={{ display: isVisible ? 'block' : 'none' }}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-7 h-7 md:w-8 md:h-8" />
    </motion.button>
  );
};

export default ScrollToTop;
