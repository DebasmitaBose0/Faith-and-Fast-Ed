import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  deleteReview,
  getProductReviews,
  postReview,
} from '@/store/product-slice/productDetails'; // Adjust path as needed
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from '@mui/material';

const ProductReviewPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const {
    reviews = [],

    loading,
    error,
  } = useSelector((state) => state.productDetails);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(''); // Assuming name is required for reviews
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    dispatch(getProductReviews(orderId)); // Assuming orderId maps to productId for reviews
  }, [dispatch, orderId]);

  const handleSubmitReview = async () => {
    if (rating === 0 || !comment.trim() || !name.trim()) {
      alert('Please provide a rating, name, and comment.');
      return;
    }

    const reviewData = {
      rating,
      comment,
      name,
    };

    dispatch(postReview({ productId: orderId, reviewData })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setRating(0);
        setComment('');
        setName('');
        dispatch(getProductReviews(orderId));
      } else {
        console.error('Review failed:', result.payload);
      }
    });
  };

  const handleDeleteClick = (reviewId) => {
    setSelectedReviewId(reviewId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    dispatch(
      deleteReview({ productId: orderId, reviewId: selectedReviewId })
    ).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setOpenDeleteDialog(false);
        setSelectedReviewId(null);
        dispatch(getProductReviews(orderId));
      } else {
        console.error('Delete failed:', result.payload);
      }
    });
  };

  const formatReviewDate = (date) => {
    if (!date) return 'Just now';
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isUserReview = (review) => {
    const userId = localStorage.getItem('userId'); // Adjust how you get the user's ID
    return review.user?.toString() === userId;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8"
    >
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white text-center">
          Product Reviews
        </h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6"
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <CircularProgress className="text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : error ? (
          <Alert
            severity="error"
            className="text-sm sm:text-base mb-6 bg-red-100 dark:bg-red-800 text-red-900 dark:text-red-100 p-4 rounded-lg"
          >
            {error}
          </Alert>
        ) : (
          <>
            {/* Review Form */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Write a Review
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitReview}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-colors"
                >
                  Submit Review
                </motion.button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Existing Reviews
              </h2>
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
                          {review.name}
                        </p>
                        <div className="mt-1">
                          <StarRating
                            value={review.rating}
                            onChange={() => {}}
                            readOnly
                          />
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
                          {review.comment}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                      {isUserReview(review) && (
                        <Tooltip
                          className="inline-block"
                          title="Delete Review"
                          style={{ display: 'inline-block' }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteClick(review._id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm sm:text-base"
                          >
                            Delete
                          </motion.button>
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  No reviews yet.
                </p>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm"
            >
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white bg-red-600 rounded-t-lg p-3 sm:p-4">
                Delete Review
              </DialogTitle>
              <DialogContent className="p-3 sm:p-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this review?
              </DialogContent>
              <DialogActions className="p-3 sm:p-4 flex justify-end space-x-4 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
                <button
                  onClick={() => setOpenDeleteDialog(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm sm:text-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg text-sm sm:text-base transition-colors"
                >
                  Delete
                </button>
              </DialogActions>
            </motion.div>
          </div>
        </Dialog>
      </motion.div>
    </motion.div>
  );
};

// Custom Star rating component
const StarRating = ({ value, onChange, readOnly = false }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`cursor-pointer text-2xl ${
        index < value
          ? 'text-yellow-500'
          : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
      } ${readOnly ? 'cursor-default' : ''}`}
      onClick={!readOnly ? () => onChange(index + 1) : undefined}
    >
      ★
    </span>
  ));
  return <div className="flex space-x-1">{stars}</div>;
};

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default ProductReviewPage;
