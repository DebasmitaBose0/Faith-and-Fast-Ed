const WishlistSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4"
        >
          {/* Image */}
          <div className="bg-gray-300 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>

          {/* Name */}
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

          {/* Price */}
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>

          {/* Button */}
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default WishlistSkeleton;
