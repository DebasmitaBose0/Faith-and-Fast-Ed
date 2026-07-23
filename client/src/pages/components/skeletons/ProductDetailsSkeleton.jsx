const ProductDetailsSkeleton = () => {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10 p-6">
      {/* Left Image */}
      <div className="bg-gray-300 dark:bg-gray-700 h-[500px] rounded-xl"></div>

      {/* Right Content */}
      <div>
        {/* Title */}
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>

        {/* Rating */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>

        {/* Price */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>

        {/* Description */}
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>

        {/* Buttons */}
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>

        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
