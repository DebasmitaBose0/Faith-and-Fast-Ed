const CartSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow"
        >
          {/* Product Image */}
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>

          {/* Product Details */}
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>

            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartSkeleton;
