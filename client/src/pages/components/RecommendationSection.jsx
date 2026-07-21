import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ProductCard from '../products/ProductCard';

/**
 * A titled grid of recommended products. Renders nothing when there are no
 * products to show, so callers can mount it unconditionally without guarding.
 */
const RecommendationSection = ({ title, products }) => {
  if (!products || products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="my-10"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </motion.section>
  );
};

RecommendationSection.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.array,
};

export default RecommendationSection;
