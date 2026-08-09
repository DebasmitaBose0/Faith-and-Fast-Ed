import { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, ShoppingCart, X, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import { useDispatch, useSelector } from 'react-redux';
import { getProductByFilter } from '@/store/product-slice/productSlice';
import { Pagination } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addToWishList } from '@/store/add-to-wishlist/addToWishList';
import { toast } from 'react-toastify';
import categories from './Categories';
import colors from '../extras/ProductColorOptions';
import sizes from '../extras/ProductSizeSelector';
import PropTypes from 'prop-types';
import MetaData from '../extras/MetaData';
import ProductSkeleton from '../components/skeletons/ProductSkeleton';
import useDebounce from '@/utils/useDebounce';
import { fetchRates, setCurrency } from '@/store/currency-slice/currencySlice';

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

FilterSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  children: PropTypes.func,
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const searchQueryFromUrl = searchParams.get('search') || '';

  const selectedCategories = useMemo(
    () =>
      searchParams.get('category')
        ? searchParams.get('category').split(',')
        : [],
    [searchParams]
  );
  const selectedSubcategories = useMemo(
    () =>
      searchParams.get('subcategory')
        ? searchParams.get('subcategory').split(',')
        : [],
    [searchParams]
  );
  const selectedColors = useMemo(
    () =>
      searchParams.get('color') ? searchParams.get('color').split(',') : [],
    [searchParams]
  );
  const selectedColorOptions = useMemo(
    () =>
      searchParams.get('coloroptions')
        ? searchParams.get('coloroptions').split(',')
        : [],
    [searchParams]
  );
  const selectedSizes = useMemo(
    () => (searchParams.get('size') ? searchParams.get('size').split(',') : []),
    [searchParams]
  );
  const selectedSizeOptions = useMemo(
    () =>
      searchParams.get('sizeoptions')
        ? searchParams.get('sizeoptions').split(',')
        : [],
    [searchParams]
  );

  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : 0;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : 20000;

  const priceRange = useMemo(() => [minPrice, maxPrice], [minPrice, maxPrice]);

  const sortBy = searchParams.get('sortBy') || 'relevant';
  const rating = searchParams.get('rating') || '';
  const availability = searchParams.get('availability') || '';
  const discount = searchParams.get('discount') || '';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    product = [],
    totalPages = 1,
    loading,
  } = useSelector((state) => state.product);

  const [localSearchInput, setLocalSearchInput] = useState(searchQueryFromUrl);
  const debouncedSearchInput = useDebounce(localSearchInput, 400);

  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const {
    selectedCurrency,
    rates = {},
    symbols = {},
  } = useSelector((state) => state.currency);

  const formatPrice = useCallback(
    (amount) => {
      const rate = rates[selectedCurrency] || 1;
      const symbol = symbols[selectedCurrency] || '₹';
      const converted = (amount * rate).toFixed(2);
      return `${symbol}${converted}`;
    },
    [rates, selectedCurrency, symbols]
  );

  useEffect(() => {
    dispatch(fetchRates());
  }, [dispatch]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    setLocalSearchInput(searchQueryFromUrl);
  }, [searchQueryFromUrl]);

  const updateSearchParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);

      if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
        newParams.set('page', '1');
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, value.toString());
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (localMaxPrice !== maxPrice) {
        updateSearchParams({ maxPrice: localMaxPrice });
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [localMaxPrice, maxPrice, updateSearchParams]);

  useEffect(() => {
    if (debouncedSearchInput !== searchQueryFromUrl) {
      updateSearchParams({ search: debouncedSearchInput });
    }
  }, [debouncedSearchInput, searchQueryFromUrl, updateSearchParams]);

  const handleToggleFilter = (paramKey, value) => {
    const currentParam = searchParams.get(paramKey);
    const currentValues = currentParam ? currentParam.split(',') : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    let updatedDependentFilters = {};
    if (paramKey === 'category') {
      const remainingCats = categories.filter((c) =>
        newValues.includes(c.title)
      );
      const allowedSubcats = remainingCats.flatMap(
        (c) => c.subcategories || []
      );
      const currentSubcats = searchParams.get('subcategory')
        ? searchParams.get('subcategory').split(',')
        : [];
      const newSubcats = currentSubcats.filter((sc) =>
        allowedSubcats.includes(sc)
      );
      updatedDependentFilters.subcategory = newSubcats;
    } else if (paramKey === 'color') {
      const remainingCols = colors.filter((c) => newValues.includes(c.title));
      const allowedColOpts = remainingCols.flatMap((c) => c.colorOptions || []);
      const currentColOpts = searchParams.get('coloroptions')
        ? searchParams.get('coloroptions').split(',')
        : [];
      const newColOpts = currentColOpts.filter((co) =>
        allowedColOpts.includes(co)
      );
      updatedDependentFilters.coloroptions = newColOpts;
    } else if (paramKey === 'size') {
      const remainingSizes = sizes.filter((s) => newValues.includes(s.title));
      const allowedSizeOpts = remainingSizes.flatMap(
        (s) => s.sizeOptions || []
      );
      const currentSizeOpts = searchParams.get('sizeoptions')
        ? searchParams.get('sizeoptions').split(',')
        : [];
      const newSizeOpts = currentSizeOpts.filter((so) =>
        allowedSizeOpts.includes(so)
      );
      updatedDependentFilters.sizeoptions = newSizeOpts;
    }

    updateSearchParams({
      [paramKey]: newValues,
      ...updatedDependentFilters,
    });
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQueryFromUrl) {
      newParams.set('search', searchQueryFromUrl);
    }
    setSearchParams(newParams);
  };

  const getActiveSubcategories = () => {
    if (selectedCategories.length === 0) return [];
    const activeCats = categories.filter((c) =>
      selectedCategories.includes(c.title)
    );
    const subcats = activeCats.flatMap((c) => c.subcategories || []);
    return [...new Set(subcats)];
  };

  const getActiveColorOptions = () => {
    if (selectedColors.length === 0) return [];
    const activeCols = colors.filter((c) => selectedColors.includes(c.title));
    const opts = activeCols.flatMap((c) => c.colorOptions || []);
    return [...new Set(opts)];
  };

  const getActiveSizeOptions = () => {
    if (selectedSizes.length === 0) return [];
    const activeSizes = sizes.filter((s) => selectedSizes.includes(s.title));
    const opts = activeSizes.flatMap((s) => s.sizeOptions || []);
    return [...new Set(opts)];
  };

  useEffect(() => {
    dispatch(
      getProductByFilter({
        page,
        limit: 20,
        searchQuery: searchQueryFromUrl,
        selectedCategories,
        selectedSubcategories,
        selectedColors,
        selectedColorOptions,
        selectedSizes,
        selectedSizeOptions,
        sortBy,
        priceRange,
        rating,
        availability,
        discount,
      })
    );
  }, [
    dispatch,
    page,
    searchQueryFromUrl,
    selectedCategories,
    selectedSubcategories,
    selectedColors,
    selectedColorOptions,
    selectedSizes,
    selectedSizeOptions,
    sortBy,
    priceRange,
    rating,
    availability,
    discount,
  ]);

  const handleAddCart = (item) => {
    navigate(`/product/${item._id}`);
    toast.info('Add item to Cart from Product page!');
  };

  const handleAddWishList = (item) => {
    dispatch(addToWishList(item._id));
    toast.success(`Successfully added to WishList!`);
  };

  const handlePageChange = (event, value) => {
    updateSearchParams({ page: value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
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
          className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3 mb-8"
        >
          <Search className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            value={localSearchInput}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            className="w-full ml-3 bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 text-sm sm:text-lg"
            placeholder=" "
          />
          <div className="absolute pointer-events-none ml-10 text-gray-500 dark:text-gray-400">
            {!localSearchInput && (
              <Typewriter
                options={{
                  strings: [
                    'Search for products...',
                    'Find your favorites...',
                    'Explore the collection...',
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
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 bg-white dark:bg-gray-800 overflow-y-auto p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Filters
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleClearFilters}
                      className="text-sm font-semibold text-yellow-500 hover:text-yellow-600 dark:text-red-400 dark:hover:text-red-300 transition duration-200"
                    >
                      Clear All
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsFiltersOpen(false)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
                    >
                      <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </motion.button>
                  </div>
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
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-3">
                    <span>₹0</span>
                    <span>₹{localMaxPrice}</span>
                  </div>
                </div>

                <FilterSection
                  title="Categories"
                  items={categories}
                  selected={selectedCategories}
                  onSelect={(cat) => handleToggleFilter('category', cat)}
                />
                {getActiveSubcategories().length > 0 && (
                  <FilterSection
                    title="Subcategories"
                    items={getActiveSubcategories().map((sc) => ({
                      title: sc,
                    }))}
                    selected={selectedSubcategories}
                    onSelect={(sc) => handleToggleFilter('subcategory', sc)}
                  />
                )}
                <FilterSection
                  title="Colors"
                  items={colors}
                  selected={selectedColors}
                  onSelect={(col) => handleToggleFilter('color', col)}
                />
                {getActiveColorOptions().length > 0 && (
                  <FilterSection
                    title="Color Options"
                    items={getActiveColorOptions().map((co) => ({ title: co }))}
                    selected={selectedColorOptions}
                    onSelect={(co) => handleToggleFilter('coloroptions', co)}
                  />
                )}
                <FilterSection
                  title="Sizes"
                  items={sizes}
                  selected={selectedSizes}
                  onSelect={(sz) => handleToggleFilter('size', sz)}
                />
                {getActiveSizeOptions().length > 0 && (
                  <FilterSection
                    title="Size Options"
                    items={getActiveSizeOptions().map((so) => ({ title: so }))}
                    selected={selectedSizeOptions}
                    onSelect={(so) => handleToggleFilter('sizeoptions', so)}
                  />
                )}

                {/* Rating Filter */}
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
                    Rating
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: '4★ & Above', value: '4' },
                      { label: '3★ & Above', value: '3' },
                      { label: '2★ & Above', value: '2' },
                      { label: '1★ & Above', value: '1' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating-mobile"
                          checked={rating === opt.value}
                          onChange={() =>
                            updateSearchParams({ rating: opt.value })
                          }
                          className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
                    Availability
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'All Items', value: '' },
                      { label: 'In Stock Only', value: 'in-stock' },
                      { label: 'Out of Stock', value: 'out-of-stock' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="availability-mobile"
                          checked={availability === opt.value}
                          onChange={() =>
                            updateSearchParams({ availability: opt.value })
                          }
                          className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Discount Filter */}
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
                    Discount
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: '10% Off or more', value: '10' },
                      { label: '20% Off or more', value: '20' },
                      { label: '30% Off or more', value: '30' },
                      { label: '50% Off or more', value: '50' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="discount-mobile"
                          checked={discount === opt.value}
                          onChange={() =>
                            updateSearchParams({ discount: opt.value })
                          }
                          className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Filters */}
          <motion.div
            variants={childVariants}
            className="hidden md:block w-80 shrink-0"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Filters
                </h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm font-semibold text-yellow-500 hover:text-yellow-600 dark:text-red-400 dark:hover:text-red-300 transition duration-200"
                >
                  Clear All
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
                <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">
                  Price Range
                </h3>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-3">
                  <span>₹0</span>
                  <span>₹{localMaxPrice}</span>
                </div>
              </div>

              <FilterSection
                title="Categories"
                items={categories}
                selected={selectedCategories}
                onSelect={(cat) => handleToggleFilter('category', cat)}
              />
              {getActiveSubcategories().length > 0 && (
                <FilterSection
                  title="Subcategories"
                  items={getActiveSubcategories().map((sc) => ({ title: sc }))}
                  selected={selectedSubcategories}
                  onSelect={(sc) => handleToggleFilter('subcategory', sc)}
                />
              )}
              <FilterSection
                title="Colors"
                items={colors}
                selected={selectedColors}
                onSelect={(col) => handleToggleFilter('color', col)}
              />
              {getActiveColorOptions().length > 0 && (
                <FilterSection
                  title="Color Options"
                  items={getActiveColorOptions().map((co) => ({ title: co }))}
                  selected={selectedColorOptions}
                  onSelect={(co) => handleToggleFilter('coloroptions', co)}
                />
              )}
              <FilterSection
                title="Sizes"
                items={sizes}
                selected={selectedSizes}
                onSelect={(sz) => handleToggleFilter('size', sz)}
              />
              {getActiveSizeOptions().length > 0 && (
                <FilterSection
                  title="Size Options"
                  items={getActiveSizeOptions().map((so) => ({ title: so }))}
                  selected={selectedSizeOptions}
                  onSelect={(so) => handleToggleFilter('sizeoptions', so)}
                />
              )}

              {/* Rating Filter */}
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
                  Rating
                </h3>
                <div className="space-y-2">
                  {[
                    { label: '4★ & Above', value: '4' },
                    { label: '3★ & Above', value: '3' },
                    { label: '2★ & Above', value: '2' },
                    { label: '1★ & Above', value: '1' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rating-desktop"
                        checked={rating === opt.value}
                        onChange={() =>
                          updateSearchParams({ rating: opt.value })
                        }
                        className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
                  Availability
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'All Items', value: '' },
                    { label: 'In Stock Only', value: 'in-stock' },
                    { label: 'Out of Stock', value: 'out-of-stock' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="availability-desktop"
                        checked={availability === opt.value}
                        onChange={() =>
                          updateSearchParams({ availability: opt.value })
                        }
                        className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount Filter */}
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-100">
                  Discount
                </h3>
                <div className="space-y-2">
                  {[
                    { label: '10% Off or more', value: '10' },
                    { label: '20% Off or more', value: '20' },
                    { label: '30% Off or more', value: '30' },
                    { label: '50% Off or more', value: '50' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="discount-desktop"
                        checked={discount === opt.value}
                        onChange={() =>
                          updateSearchParams({ discount: opt.value })
                        }
                        className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-200"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product Grid Container */}
          <motion.div variants={childVariants} className="flex-1">
            <div className="flex justify-between items-center mb-8 gap-4">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                All Products
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCurrency}
                  onChange={(e) => dispatch(setCurrency(e.target.value))}
                  className="px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-yellow-500 transition duration-200"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    updateSearchParams({ sortBy: e.target.value })
                  }
                  className="px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-yellow-500 transition duration-200"
                >
                  <option value="relevant">Sort by: Relevant</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Content States */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : product.length === 0 ? (
              <motion.div
                variants={childVariants}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md"
              >
                <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-full shadow-md transition duration-200"
                >
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {product.map((item) => (
                    <motion.div
                      key={item._id}
                      variants={cardVariants}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col justify-between group transition duration-300"
                    >
                      <div
                        className="relative overflow-hidden cursor-pointer"
                        onClick={() => handleAddCart(item)}
                      >
                        <img
                          src={
                            item.images?.[0]?.url ||
                            item.image ||
                            '/placeholder.png'
                          }
                          alt={item.title || item.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddWishList(item);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-md text-red-500 hover:bg-white dark:hover:bg-gray-800 transition duration-200"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </motion.button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">
                            {item.title || item.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl font-bold text-gray-900 dark:text-yellow-400">
                              {formatPrice(item.price)}
                            </span>
                            {item.ratings !== undefined && (
                              <div className="flex items-center text-yellow-500 text-sm font-semibold">
                                <Star className="w-4 h-4 fill-current mr-1" />
                                <span>{item.ratings}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddCart(item)}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition duration-200"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Products;
