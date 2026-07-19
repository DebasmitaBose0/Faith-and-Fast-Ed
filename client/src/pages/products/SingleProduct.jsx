import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProductDetails,
  getProductReviews,
  postReview,
  getSimilarProducts,
  getTrendingProducts,
  getFrequentlyBoughtTogether,
} from "@/store/product-slice/productDetails";
import ImageSlider from "./ImageSlider";
import ProductCard from "./ProductCard";
import RecentlyViewed from "../components/RecentlyViewedProducts";
import RecommendationSection from "../components/RecommendationSection";
import ProductDetailsSkeleton from "../components/skeletons/ProductDetailsSkeleton";
import MetaData from "../extras/MetaData";
import { Button, Rating } from "@mui/material";
import { Heart, ShoppingCartIcon } from "lucide-react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { addToCart } from "@/store/add-to-cart/addToCart";
import { addToWishList } from "@/store/add-to-wishlist/addToWishList";

const ProductDetails = ({ products }) => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    product,
    reviews = [],
    similarProducts,
    trendingProducts,
    frequentlyBoughtTogether,
    loading,
    error,
    reviewPosting,
  } = useSelector((state) => state.productDetails);
  const { user } = useSelector((state) => state.auth);

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [randomSimilar, setRandomSimilar] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [visibleReviews, setVisibleReviews] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  const getRandomReviews = useCallback(
    (count) => {
      if (!reviews || reviews.length === 0) return [];
      const shuffledReviews = [...reviews].sort(() => 0.5 - Math.random());
      return shuffledReviews.slice(0, count);
    },
    [reviews]
  );

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 5);
  const formattedDate = expectedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setVisibleReviews(getRandomReviews(3));
    }
  }, [reviews, getRandomReviews]);

  const handleShowNext = () => {
    setVisibleReviews((prevReviews) => {
      const nextReviews = getRandomReviews(3);
      return [...prevReviews, ...nextReviews];
    });
  };

  // Fetch product data
  useEffect(() => {
    dispatch(getProductDetails(productId));
    dispatch(getProductReviews(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product?.category) {
      dispatch(
        getSimilarProducts({
          category: product.category,
          subcategory: product.subcategory,
          exclude: product._id,
        })
      );
      dispatch(getTrendingProducts(8));
      dispatch(getFrequentlyBoughtTogether(product._id));
    }
  }, [dispatch, product]);

  useEffect(() => {
    if (product && product._id) {
      let viewedProducts = [];
      try {
        const raw = JSON.parse(localStorage.getItem("recentlyViewed"));
        if (Array.isArray(raw)) viewedProducts = raw;
      } catch {
        /* ignore corrupt or non-array value */
      }

      viewedProducts = viewedProducts.filter(
        (item) => item._id !== product._id
      );

      viewedProducts.unshift(product);

      viewedProducts = viewedProducts.slice(0, 8);

      localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(viewedProducts)
      );

      const filteredViewed = viewedProducts.filter(
        (item) => item._id !== product._id
      );

      setRecentlyViewed(filteredViewed);
    }
  }, [product]);


  useEffect(() => {
    const combined = [...(similarProducts || []), ...(products || [])];
    // Exclude the product currently being viewed and de-duplicate by id so the
    // "You Might Also Like" grid never shows the same product twice or itself.
    const seen = new Set();
    const unique = combined.filter((item) => {
      if (!item || !item._id || item._id === product?._id) return false;
      if (seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
    setRandomSimilar(unique.sort(() => Math.random() - 0.5).slice(0, 6));
  }, [similarProducts, products, product]);

  useEffect(() => {
    if (product) {
      if (product.coloroptions) {
        if (Array.isArray(product.coloroptions)) {
          if (
            product.coloroptions.length === 1 &&
            product.coloroptions[0].includes(",")
          ) {
            setSelectedColor(product.coloroptions[0].split(",")[0].trim());
          } else {
            setSelectedColor(product.coloroptions[0]);
          }
        } else if (typeof product.coloroptions === "string") {
          setSelectedColor(product.coloroptions.split(",")[0].trim());
        }
      }
      if (product.sizeoptions) {
        if (Array.isArray(product.sizeoptions)) {
          if (
            product.sizeoptions.length === 1 &&
            product.sizeoptions[0].includes(",")
          ) {
            setSelectedSize(product.sizeoptions[0].split(",")[0].trim());
          } else {
            setSelectedSize(product.sizeoptions[0]);
          }
        } else if (typeof product.sizeoptions === "string") {
          setSelectedSize(product.sizeoptions.split(",")[0].trim());
        }
      }
    }
  }, [product]);

  let sizeOptions = [];
  if (product?.sizeoptions) {
    if (Array.isArray(product.sizeoptions)) {
      if (product.sizeoptions.length > 0) {
        if (
          product.sizeoptions.length === 1 &&
          product.sizeoptions[0] &&
          product.sizeoptions[0].includes(",")
        ) {
          sizeOptions = product.sizeoptions[0].split(",").map((s) => s.trim());
        } else {
          sizeOptions = product.sizeoptions;
        }
      }
    } else if (typeof product.sizeoptions === "string") {
      sizeOptions = product.sizeoptions.split(",").map((s) => s.trim());
    }
  }

  let colorOptions = [];
  if (product?.coloroptions) {
    if (Array.isArray(product.coloroptions)) {
      if (product.coloroptions.length > 0) {
        if (
          product.coloroptions.length === 1 &&
          product.coloroptions[0] &&
          product.coloroptions[0].includes(",")
        ) {
          colorOptions = product.coloroptions[0]
            .split(",")
            .map((c) => c.trim());
        } else {
          colorOptions = product.coloroptions;
        }
      }
    } else if (typeof product.coloroptions === "string") {
      colorOptions = product.coloroptions.split(",").map((c) => c.trim());
    }
  }

  const handleReviewSubmit = () => {
    if (!user) {
      return toast.error("Please login to post a review");
    }
    if (!rating) {
      return toast.error("Please select a rating");
    }
    if (!reviewText) {
      return toast.error("Please enter a review");
    }
    dispatch(
      postReview({
        productId,
        reviewData: { rating, comment: reviewText, name: user.name },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Review posted successfully");
        // Re-fetch reviews so the new one appears without a page reload.
        dispatch(getProductReviews(productId));
        setReviewText("");
        setRating(0);
      })
      .catch((err) => toast.error(err?.message || "Failed to post review"));
  };

  const handleAddCart = (item) => {
    if (!item) {
      toast.error("Error: Item not found!");
      return;
    }
    dispatch(addToCart({ productId: item._id, selectedColor, selectedSize }));
    toast.success(`"${item.name}" added to cart!`);
  };

  // Buy Now — add the item to the cart, then take the user straight to
  // checkout, bypassing the cart page. We await the thunk so checkout only
  // opens once the item is actually in the cart.
  const handleBuyNow = async (item) => {
    if (!item) {
      toast.error("Error: Item not found!");
      return;
    }
    try {
      await dispatch(
        addToCart({ productId: item._id, selectedColor, selectedSize })
      ).unwrap();
      navigate("/checkout");
    } catch (err) {
      toast.error(err || "Could not proceed to checkout. Please try again.");
    }
  };

  const handleAddWishList = (item) => {
      dispatch(addToWishList(item._id));
      toast.success(`Successfully added to WishList!`);
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-12"
      >
        <MetaData
          title={`${product?.name} | Buy Online at Faith AND Fast`}
          description={`Get ${product?.name} at the best price on Faith AND Fast. ${product?.description}. Fast shipping & Cash on Delivery available!`}
          keywords={`${product?.name}, buy ${product?.name} online, Faith AND Fast, ${product?.category}, best price ${product?.name}, shop ${product?.name}, latest ${product?.category}`}
        />

        <AnimatePresence>
          {loading ? (
            <ProductDetailsSkeleton />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-8 bg-red-100 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl text-red-600 font-bold">{error}</h2>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Product Overview */}
              <motion.div
                variants={itemVariants}
                className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg overflow-hidden shadow-2xl"
                >
                  <ImageSlider
                    images={product?.images?.map((img) => img.url)}
                  />
                </motion.div>
                <div className="space-y-6">
                  <motion.h1
                    variants={itemVariants}
                    className="text-4xl font-bold text-gray-800 dark:text-gray-100 capitalize"
                  >
                    {product?.name}
                  </motion.h1>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-yellow-600 dark:text-red-500">
                      ₹
                      {(
                        product?.price -
                        product?.price * (product?.discount / 100)
                      ).toLocaleString()}
                    </span>
                    {product?.discount > 0 && (
                      <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 line-through">
                        ₹{product?.price}
                      </span>
                    )}
                    {product?.discount > 0 && (
                      <span className="text-lg font-bold text-red-500">
                        ({product?.discount}% off)
                      </span>
                    )}
                  </div>
                  {/* Stock availability indicator */}
                  <motion.div variants={itemVariants}>
                    {product?.stock === 0 ? (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                        Out of Stock
                      </span>
                    ) : product?.stock <= 5 ? (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                        Only {product?.stock} left in stock — order soon
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        In Stock
                      </span>
                    )}
                  </motion.div>
                  {product?.reviews?.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center gap-2"
                    >
                      <Rating
                        value={product?.ratings}
                        readOnly
                        precision={0.5}
                        sx={{ color: "#FFD700" }}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        ({reviews.length} reviews)
                      </span>
                    </motion.div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                      Select Color
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((color, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                            selectedColor === color
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {color}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                      Select Size
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {sizeOptions.map((size, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedSize(size)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                            selectedSize === size
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <motion.div variants={itemVariants}>
                    <Button
                      fullWidth
                      onClick={() => handleAddCart(product)}
                      disabled={loading || product?.stock === 0}
                      sx={{
                        background:
                          "linear-gradient(to right, #f59e0b, #f97316)",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "9999px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        "&:hover": {
                          background:
                            "linear-gradient(to right, #d97706, #ea580c)",
                        },
                        "&:disabled": { opacity: 0.5 },
                      }}
                      startIcon={<ShoppingCartIcon />}
                    >
                      {product?.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button
                      fullWidth
                      onClick={() => handleBuyNow(product)}
                      disabled={loading || product?.stock === 0}
                      sx={{
                        background:
                          "linear-gradient(to right, #16a34a, #15803d)",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "9999px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        "&:hover": {
                          background:
                            "linear-gradient(to right, #15803d, #166534)",
                        },
                        "&:disabled": { opacity: 0.5 },
                      }}
                      startIcon={<ShoppingCartIcon />}
                    >
                      {product?.stock === 0 ? "Unavailable" : "Buy Now"}
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button
                      fullWidth
                      onClick={() => handleAddWishList(product)}
                      disabled={loading}
                      sx={{
                        background:
                          "linear-gradient(to right, #f59e0b, #f97316)",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "9999px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        "&:hover": {
                          background:
                            "linear-gradient(to right, #d97706, #ea580c)",
                        },
                        "&:disabled": { opacity: 0.5 },
                      }}
                      startIcon={<Heart />}
                    >
                      Add to Wishlist
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 
                 shadow-2xl rounded-2xl p-8 transition-all duration-300 group"
              >
                <h2
                  className="text-3xl font-extrabold text-gray-900 dark:text-white 
                     mb-6 pb-2 border-b-2 border-transparent group-hover:border-indigo-500 
                     transition duration-300"
                >
                  📦 Fast & Free Delivery
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  🚚 Free Delivery
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  📅 Delivery by{" "}
                  <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                    {formattedDate}
                  </span>{" "}
                  (Expected)
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Delivery time varies based on location & order size.
                </p>
              </motion.div>

              {/* Product Details Section */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8"
              >
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                  Product Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">
                      Product ID:
                    </span>
                    <span className="text-lg font-medium">
                      F-{product?._id.slice(0, 15)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">
                      Category:
                    </span>
                    <span className="text-lg font-medium">
                      {product?.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">
                      Collection:
                    </span>
                    <span className="text-lg font-medium">
                      {product?.subcategory}
                    </span>
                  </div>
                  {Array.isArray(product?.coloroptions) &&
                    product.coloroptions.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">
                          Available Colors:
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          {product.coloroptions.map((clr, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 font-semibold shadow-sm"
                            >
                              {clr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {product?.size?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">
                        All Sizes:
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {product.size.map((sz, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-semibold shadow-sm"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product?.sizeoptions?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">
                        Available Sizes:
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {product.sizeoptions.map((sz, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 font-semibold shadow-sm"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.section
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl"
              >
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                  Customer Reviews
                </h2>
                <div className="space-y-6 mb-12">
                  {visibleReviews && visibleReviews.length > 0 ? (
                    visibleReviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-md"
                      >
                        <div className="flex items-center mb-4">
                          <Rating
                            value={review?.rating || 0}
                            readOnly
                            size="small"
                            sx={{ color: "#FFD700" }}
                          />
                          <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                            {review?.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : "No date"}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {review?.comment || "No comment"}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-600 dark:text-gray-300">
                      No reviews available
                    </p>
                  )}
                  {visibleReviews.length < reviews.length && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShowNext}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center mx-auto"
                    >
                      Show Next Reviews
                    </motion.button>
                  )}
                </div>
                <div className="border-t pt-8 border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                    Write a Review
                  </h3>
                  <div className="space-y-6">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
                      rows="4"
                    />
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600 dark:text-gray-200 font-medium">
                        Rating:
                      </span>
                      <Rating
                        value={rating}
                        onChange={(e, newValue) => setRating(newValue)}
                        size="large"
                        sx={{
                          color: "#FFD700",
                          "& .MuiRating-iconEmpty": {
                            color: "rgba(189, 189, 189, 0.5)",
                          },
                        }}
                      />
                    </div>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleReviewSubmit}
                      disabled={reviewPosting}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md transition-all duration-300 mx-auto"
                    >
                      {reviewPosting ? "Submitting..." : "Submit Review"}
                    </motion.button>
                  </div>
                </div>
              </motion.section>

              {/* Similar Products Section */}
              <motion.section variants={itemVariants}>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {randomSimilar.map((prod) => (
                    <motion.div
                      key={prod._id}
                      variants={cardVariants}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <ProductCard product={prod} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
              <RecommendationSection
                title="Frequently Bought Together"
                products={frequentlyBoughtTogether}
              />
              <RecommendationSection
                title="Trending Now"
                products={trendingProducts}
              />
              <RecentlyViewed products={recentlyViewed} />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

ProductDetails.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ),
};

export default ProductDetails;
