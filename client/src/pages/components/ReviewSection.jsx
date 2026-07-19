import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axiosInstance from "@/api";
import ReviewCard from "./ReviewCard";

const ProductReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/product/top-reviews")
      .then((res) => {
        if (res.data && res.data.success) {
          setReviews(res.data.reviews || []);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch top reviews:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Top Reviews for Popular Clothing And Accessories
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.reviewId || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No reviews available yet.
        </p>
      )}

      <div className="marquee text-center mt-12 bg-yellow-50 dark:bg-gray-700 py-3 rounded-lg">
        <p className="text-lg font-semibold text-gray-850 dark:text-gray-150">
          Check out our latest collection with amazing discounts and offers!
        </p>
      </div>

      <style>{`
        .marquee p {
          animation: marquee 10s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default ProductReviews;
