import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CategoryPanel = () => {
  const navigate = useNavigate();

  const categories = ['MEN', 'WOMEN', 'KIDS', 'VIEW MORE PRODUCTS'];

  const handleCategoryClick = (category) => {
    if (category === 'VIEW MORE PRODUCTS') {
      navigate('/products');
    }
  };

  return (
    <div className="flex items-center flex-wrap justify-center border-b border-gray-300 dark:border-gray-400 text-black dark:text-white mt-6 px-4 py-3 gap-10 mx-9 md:mx-28 lg:mx-72">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="relative flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-md shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            aria-label={`Category: ${category}`}
          >
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {category}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPanel;
