import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import Typewriter from "typewriter-effect";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addToWishList } from "@/store/add-to-wishlist/addToWishList";
import StockBadge from "./StockBadge";

const ProductCategory = ({ title, items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [shuffledItems, setShuffledItems] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
    };

    setShuffledItems(shuffleArray(items));
  }, [items]);

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(Math.min(Math.floor(window.innerWidth / 300), 5));
    };

    updateItemsPerView();
    const resizeHandler = debounce(updateItemsPerView, 100);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const totalItems = shuffledItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerView);

  const getVisibleItems = () => {
    const startIndex = currentIndex * itemsPerView;
    const endIndex = startIndex + itemsPerView;
    return shuffledItems.slice(startIndex, endIndex);
  };

  const nextItems = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevItems = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleAddCart = (item) => {
    navigate(`/product/${item._id}`);
    toast.info("Add item to Cart from Product page!");
  };
  const handleAddWishList = (item) => {
    dispatch(addToWishList(item._id));
    toast.success(`Successfully added to WishList!`);
  };

  return (
    <section className="mt-16 relative px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="lato lg:text-4xl text-3xl font-bold text-gray-600 dark:text-red-600 m-auto">
          <Typewriter
            options={{
              strings: [title],
              autoStart: true,
              loop: true,
              delay: 50,
              deleteSpeed: 50,
            }}
          />
        </h2>
      </motion.div>

      <div className="relative flex items-center px-2">
        {currentIndex > 0 && (
          <button
            onClick={prevItems}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow-md text-black dark:text-white z-10 hover:scale-110 transition-transform"
            aria-label="Previous items"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="overflow-hidden flex gap-4 w-full scroll-smooth">
          {getVisibleItems().map((item) => (
            <motion.div
              key={item._id}
              className="flex-none w-64 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative cursor-pointer">
                <StockBadge stock={item.stock ?? 10} />
                <img
                  src={item.images?.[0]?.url || "/placeholder-product.jpg"}
                  alt={item.name}
                  className="w-full h-48 object-fit rounded-t-xl"
                  onClick={() => navigate(`/product/${item._id}`)}
                  loading="lazy"
                />
                <div className="absolute top-25 right-2 flex flex-col gap-2">
                  <button
                    className="p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md hover:scale-110 transition-transform"
                    onClick={() => handleAddWishList(item)}
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 bg-white/90 dark:bg-gray-700/90 rounded-full shadow-md hover:scale-110 transition-transform"
                    onClick={() => handleAddCart(item)}
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div
                className="p-4 cursor-pointer"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <h3 className="font-semibold text-lg mb-2 truncate capitalize">
                  {item.name}
                </h3>

                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold bg-white dark:bg-gray-900 text-black dark:text-white">
                    ₹
                    {(item.price - item.price * (item.discount / 100)).toFixed(
                      2
                    )}
                    {item.discount > 0 && (
                      <span className="text-sm line-through ml-2 bg-white dark:bg-gray-900 text-black dark:text-white">
                        ₹{item.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                  {item.discount > 0 && (
                    <p className="text-md bg-white dark:bg-gray-900 text-black dark:text-white font-bold">
                      {item.discount}% Off
                    </p>
                  )}
                </div>

                <p className="text-lg text-green-500 dark:text-green-500 font-bold">
                  Free Delivery
                </p>

                <div className="flex items-center mb-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-md font-medium text-gray-700 dark:text-gray-200">
                      {item.ratings ? `${item.ratings.toFixed(1)} ` : "No ratings"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300">({item.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {currentIndex < totalPages - 1 && (
          <button
            onClick={nextItems}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow-md text-black dark:text-white z-10 hover:scale-110 transition-transform"
            aria-label="Next items"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
};

ProductCategory.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired,
        })
      ),
      ratings: PropTypes.number,
      reviews: PropTypes.array,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  onToggleWishlist: PropTypes.func.isRequired,
};

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default ProductCategory;
