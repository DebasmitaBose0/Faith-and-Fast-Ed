import { useEffect, useState } from "react";
import { Search, ShoppingCart, X, Heart, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
import { useDispatch, useSelector } from "react-redux";
import { getProductByFilter } from "@/store/product-slice/productSlice";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addToWishList } from "@/store/add-to-wishlist/addToWishlist";
import { toast } from "react-toastify";
import categories from "./Categories";
import colors from "../extras/Colors";
import sizes from "../extras/Size";
import PropTypes from "prop-types";
import MetaData from "../extras/MetaData";
import ProductSkeleton from "../components/skeletons/ProductSkeleton";

const FilterSection = ({ title, items, selected, onSelect, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
  >
    <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
      {title}
    </h3>
    <div className="space-y-2">
      {items.map((item) => (
        <motion.div
          key={item.title}
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition duration-200"
        >
          <label className="flex items-center space-x-3 flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(item.title)}
              onChange={() => onSelect(item.title)}
              className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
            />
            <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
              {item.title}
            </span>
          </label>
          {children && children(item)}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedColorOptions, setSelectedColorOptions] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedSizeOptions, setSelectedSizeOptions] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [sortBy, setSortBy] = useState("relevant");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product = [], totalPages, loading } = useSelector(
    (state) => state.product
  );
  const [shuffledProducts, setShuffledProducts] = useState([]);

  const handleFilterChange = (setter, value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const getActiveSubcategories = () => {
    const category = categories.find((c) =>
      selectedCategories.includes(c.title)
    );
    return category?.subcategories || [];
  };

  const getActiveColorOptions = () => {
    const color = colors.find((c) => selectedColors.includes(c.title));
    return color?.colorOptions || [];
  };

  const getActiveSizeOptions = () => {
    const size = sizes.find((s) => selectedSizes.includes(s.title));
    return size?.sizeOptions || [];
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(
        getProductByFilter({
          page,
          limit: 20,
          searchQuery,
          selectedCategories,
          selectedSubcategories,
          selectedColors,
          selectedColorOptions,
          selectedSizes,
          selectedSizeOptions,
          sortBy,
          priceRange,
        })
      );
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [
    dispatch,
    page,
    searchQuery,
    selectedCategories,
    selectedSubcategories,
    selectedColors,
    selectedColorOptions,
    selectedSizes,
    selectedSizeOptions,
    sortBy,
    priceRange,
  ]);

  useEffect(() => {
    if (product.length > 0) {
      setShuffledProducts([...product].sort(() => Math.random() - 0.5));
    }
  }, [product]);

  const handleAddCart = (item) => {
    navigate(`/product/${item._id}`);
    toast.info("Add item to Cart from Product page!");
  };
  const handleAddWishList = (item) => {
    dispatch(addToWishList(item._id));
    toast.success(`Successfully added to WishList!`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <MetaData
        title="Shop Latest Trends | Faith AND Fast - Fashion, Accessories & More"
        description="Discover the latest fashion trends at Faith AND Fast. Shop stylish clothing, accessories, and more with fast delivery and Cash on Delivery. Find your perfect look today!"
        keywords="Faith AND Fast products, online fashion store, trendy clothing, buy accessories, latest fashion, shop online, best fashion deals"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8"
      >
        <motion.div
          variants={childVariants}
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3 mb-8"
        >
          <Search className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ml-3 bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 text-sm sm:text-lg"
            placeholder=" "
          />
          <div className="absolute pointer-events-none ml-10 text-gray-500 dark:text-gray-400">
            {!searchQuery && (
              <Typewriter
                options={{
                  strings: [
                    "Search for products...",
                    "Find your favorites...",
                    "Explore the collection...",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Mobile Filters Button */}
        <motion.div
          variants={childVariants}
          className="md:hidden mb-6 flex justify-between items-center"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-red-600 dark:to-red-700 text-white rounded-full shadow-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Filters
          </motion.button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filters Panel */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 bg-white dark:bg-gray-800 overflow-y-auto p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Filters
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFiltersOpen(false)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </div>

                {/* Price Filter */}
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner">
                  <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">
                    Price Range
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-3">
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                {/* Filters */}
                <FilterSection
                  title="Categories"
                  items={categories}
                  selected={selectedCategories}
                  onSelect={(cat) =>
                    handleFilterChange(setSelectedCategories, cat)
                  }
                />
                {getActiveSubcategories().length > 0 && (
                  <FilterSection
                    title="Subcategories"
                    items={getActiveSubcategories().map((sc) => ({
                      title: sc,
                    }))}
                    selected={selectedSubcategories}
                    onSelect={(sc) =>
                      handleFilterChange(setSelectedSubcategories, sc)
                    }
                  />
                )}
                <FilterSection
                  title="Colors"
                  items={colors}
                  selected={selectedColors}
                  onSelect={(col) => handleFilterChange(setSelectedColors, col)}
                />
                {getActiveColorOptions().length > 0 && (
                  <FilterSection
                    title="Color Options"
                    items={getActiveColorOptions().map((co) => ({ title: co }))}
                    selected={selectedColorOptions}
                    onSelect={(co) =>
                      handleFilterChange(setSelectedColorOptions, co)
                    }
                  />
                )}
                <FilterSection
                  title="Sizes"
                  items={sizes}
                  selected={selectedSizes}
                  onSelect={(sz) => handleFilterChange(setSelectedSizes, sz)}
                />
                {getActiveSizeOptions().length > 0 && (
                  <FilterSection
                    title="Size Options"
                    items={getActiveSizeOptions().map((so) => ({ title: so }))}
                    selected={selectedSizeOptions}
                    onSelect={(so) =>
                      handleFilterChange(setSelectedSizeOptions, so)
                    }
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filters */}
          <motion.div
            variants={childVariants}
            className="hidden md:block w-80 shrink-0"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                Filters
              </h2>

              {/* Price Filter */}
              <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
                <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">
                  Price Range
                </h3>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-3">
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Filter Sections */}
              <FilterSection
                title="Categories"
                items={categories}
                selected={selectedCategories}
                onSelect={(cat) =>
                  handleFilterChange(setSelectedCategories, cat)
                }
              />
              {getActiveSubcategories().length > 0 && (
                <FilterSection
                  title="Subcategories"
                  items={getActiveSubcategories().map((sc) => ({ title: sc }))}
                  selected={selectedSubcategories}
                  onSelect={(sc) =>
                    handleFilterChange(setSelectedSubcategories, sc)
                  }
                />
              )}
              <FilterSection
                title="Colors"
                items={colors}
                selected={selectedColors}
                onSelect={(col) => handleFilterChange(setSelectedColors, col)}
              />
              {getActiveColorOptions().length > 0 && (
                <FilterSection
                  title="Color Options"
                  items={getActiveColorOptions().map((co) => ({ title: co }))}
                  selected={selectedColorOptions}
                  onSelect={(co) =>
                    handleFilterChange(setSelectedColorOptions, co)
                  }
                />
              )}
              <FilterSection
                title="Sizes"
                items={sizes}
                selected={selectedSizes}
                onSelect={(sz) => handleFilterChange(setSelectedSizes, sz)}
              />
              {getActiveSizeOptions().length > 0 && (
                <FilterSection
                  title="Size Options"
                  items={getActiveSizeOptions().map((so) => ({ title: so }))}
                  selected={selectedSizeOptions}
                  onSelect={(so) =>
                    handleFilterChange(setSelectedSizeOptions, so)
                  }
                />
              )}
            </div>
          </motion.div>

          {/* Product Grid */}
          <motion.div variants={childVariants} className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                All Products
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-yellow-500 transition duration-200"
              >
                <option value="relevant">Sort by: Relevant</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              <AnimatePresence>
                {loading ? (
                  [...Array(8)].map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))
                ) : (
                  shuffledProducts.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                      }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={item.images[0]?.url}
                          alt={item.name}
                          className="w-full h-full object-fit cursor-pointer"
                          onClick={() => navigate(`/product/${item._id}`)}
                        />

                        <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-600 transition duration-200"
                            onClick={() => handleAddWishList(item)}
                          >
                            <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-600 transition duration-200"
                            onClick={() => handleAddCart(item)}
                          >
                            <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="p-2 sm:p-4">
                        <h3 className="font-semibold text-sm sm:text-lg mb-2 line-clamp-2 text-gray-800 dark:text-gray-100">
                          {item.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                              ₹
                              {(
                                item.price -
                                item.price * (item.discount / 100)
                              ).toFixed(2)}
                            </span>

                            {item.discount > 0 && (
                              <span className="text-sm line-through text-gray-500 dark:text-gray-400">
                                ₹{item.price.toFixed(2)}
                              </span>
                            )}

                            {item.discount > 0 && (
                              <p className="text-md bg-white dark:bg-gray-900 text-black dark:text-white font-bold">
                                {item.discount}% Off
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-lg text-green-500 dark:text-green-500 font-bold">
                          Free Delivery
                        </p>

                        <div className="flex items-center mb-2">
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                            <Star className="w-5 h-5 text-yellow-400" />

                            <span className="text-md font-medium text-gray-700 dark:text-gray-200">
                              {item.ratings
                                ? `${item.ratings.toFixed(1)} `
                                : "No ratings"}
                            </span>

                            <span className="text-sm text-gray-500 dark:text-gray-300">
                              ({item.reviews?.length || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              variants={childVariants}
              className="mt-8 flex justify-center"
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                className="[&>.MuiPagination-ul]:gap-2 [&>.MuiPaginationItem-root]:bg-white [&>.MuiPaginationItem-root]:dark:bg-gray-800 [&>.Mui-selected]:bg-yellow-500 [&>.Mui-selected]:text-white"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

FilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string }))
    .isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  children: PropTypes.node,
};

FilterSection.defaultProps = {
  children: null,
};

export default Products;
