import PropTypes from "prop-types";

const ReviewCard = ({ review }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-xl transition-shadow duration-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
          {review.rating} ★
        </span>
        <span className="text-gray-800 dark:text-gray-100 font-semibold text-sm">
          {review.userName}
        </span>
        <span className="bg-gray-100 dark:bg-gray-700 rounded-full px-1.5 py-0.5 text-[9px] text-green-600 ml-auto">
          Certified Buyer
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 italic">
        &ldquo;{review.comment}&rdquo;
      </p>
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs">
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        <span className="truncate max-w-[180px] text-blue-500">{review.productName}</span>
      </div>
      {review.productImage && (
        <div className="mt-2">
          <img
            src={review.productImage}
            alt={review.productName}
            className="w-12 h-12 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    productId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    productImage: PropTypes.string,
  }).isRequired,
};

export default ReviewCard;
