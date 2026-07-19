import PropTypes from "prop-types";
import ProductCard from "../products/ProductCard";

const RecentlyViewedProducts = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Recently Viewed
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

RecentlyViewedProducts.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RecentlyViewedProducts;
