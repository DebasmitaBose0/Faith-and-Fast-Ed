import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '@/store/extra-slice/darkModeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <motion.button
      onClick={handleToggle}
      className="relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-500 bg-gray-200 dark:bg-gray-800 shadow-lg hover:scale-110"
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <motion.div
        key={darkMode ? 'moon' : 'sun'}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {darkMode ? (
          <Moon className="text-red-600" size={22} />
        ) : (
          <Sun className="text-yellow-500" size={22} />
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.span
          key={darkMode ? 'dark' : 'light'}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 10, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-sm font-semibold text-gray-800 dark:text-white hidden sm:block"
        >
          {darkMode ? 'Dark Mode' : 'Light Mode'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default DarkModeToggle;
