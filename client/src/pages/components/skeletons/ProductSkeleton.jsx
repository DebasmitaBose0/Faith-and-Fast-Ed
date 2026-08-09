const ProductSkeleton = () => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      {/* Product Image */}
      <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>

      {/* Product Name */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

      {/* Price */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>

      {/* Button */}
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  );
};

export default ProductSkeleton;
