import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logoLight.png';
import MetaData from '../extras/MetaData';

const AboutUs = () => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-all duration-300">
      <MetaData
        title="About Us | Faith AND Fast - Your Trusted Fashion Store"
        description="Learn more about Faith AND Fast, your go-to destination for the latest fashion trends, accessories, and exclusive deals. Discover our story, mission, and commitment to quality!"
        keywords="About Faith AND Fast, fashion store, online shopping, fashion trends, best clothing store, stylish accessories"
      />

      {/* Heading */}
      <div className="max-w-6xl mx-auto py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-6 mb-16 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            About{' '}
            <span className="text-yellow-500 dark:text-red-600 inline-block hover:scale-105 transition-transform">
              Faith AND Fast
            </span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-700 dark:text-gray-300">
            Welcome to{' '}
            <span className="font-semibold text-yellow-500 dark:text-red-600">
              Faith AND Fast
            </span>
            , your go-to destination for trendy and high-quality fashion for
            both men and women. Fashion is more than just clothing – it’s a way
            to express confidence, elegance, and individuality.
          </p>
        </motion.div>

        {/* Image & Content Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image with Motion Effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="overflow-hidden rounded-lg"
          >
            <img
              src={logoLight}
              alt="About Us"
              className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-all duration-500 object-cover dark:hidden"
              loading="lazy"
            />
            <img
              src={logoDark}
              alt="About Us Dark Mode"
              className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-all duration-500 object-cover hidden dark:block"
              loading="lazy"
            />
          </motion.div>

          {/* Text Content with Fade-In Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            className="space-y-8"
          >
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              At{' '}
              <span className="font-semibold text-yellow-500 dark:text-red-600">
                Faith AND Fast
              </span>
              , we offer a carefully curated collection of stylish and
              comfortable apparel for every occasion. Whether you need casual
              wear, formal outfits, or the latest streetwear trends, we have
              something for everyone.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Our brand represents faith in quality and fast fashion trends,
              ensuring you stay ahead in style. We continuously innovate to meet
              the evolving fashion needs of our customers.
            </p>

            {/* Why Choose Us Section */}
            <div className="pt-4">
              <h2 className="text-3xl font-bold mb-6">
                Why Choose{' '}
                <span className="text-yellow-500 dark:text-red-600">
                  Faith AND Fast
                </span>
                ?
              </h2>
              <ul className="space-y-4">
                {[
                  'Premium Quality Fabrics – Designed for durability and comfort.',
                  'Trendy & Timeless Styles – Stay ahead with the latest fashion.',
                  'Affordable Prices – Fashion that fits your budget.',
                  'Customer Satisfaction – Your happiness is our priority.',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-red-600 mr-3 text-xl">✔</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 py-16 mt-12 text-center"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8 leading-tight">
            Join us in redefining fashion with{' '}
            <span className="text-yellow-500 dark:text-red-600">
              Faith AND Fast
            </span>
            .
            <span className="block mt-2 text-2xl font-normal text-gray-700 dark:text-gray-300">
              Be stylish. Be confident. Be you.
            </span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExploreClick}
            className="px-8 py-4 bg-yellow-500 dark:bg-red-600 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:shadow-xl"
          >
            Explore Our Collection
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
