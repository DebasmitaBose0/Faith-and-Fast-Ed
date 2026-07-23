import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { createProduct } from '@/store/product-slice/AdminProduct';
import MetaData from '../extras/MetaData';
import { XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAddProduct = () => {
  const [images, setImages] = useState(Array(10).fill(null));
  const [imagesPreview, setImagesPreview] = useState(Array(10).fill(null));
  const [isFormValid, setIsFormValid] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  const categories = [
    'MEN',
    'WOMEN',
    'KIDS',
    'CLOTHING',
    'FOOTWEAR',
    'SEASONAL WEAR',
    'SPECIAL CATEGORIES',
  ];

  const subcategories = [
    'T-Shirts & Polos',
    'Shirts',
    'Hoodies & Sweatshirts',
    'Jackets & Coats',
    'Sweaters & Cardigans',
    'Pants & Trousers',
    'Jeans',
    'Shorts',
    'Ethnic Wear (Kurtas, Sarees, Lehengas, etc.)',
    'Innerwear & Loungewear',
    'Activewear',
    'Winter Wear (Thermals, Woolen Caps, Gloves, etc.)',
    'Summer Wear (Cotton Clothes, Sleeveless Tops, etc.)',
    'Rainwear (Raincoats, Waterproof Shoes)',
    'Party Wear',
    'Office/Formal Wear',
    'Streetwear',
    'Sportswear',
    'Luxury/Fashion Brands',
    'Sneakers',
    'Formal Shoes',
    'Casual Shoes',
    'Sandals & Slippers',
    'Boots',
    'Sports Shoes',
  ];

  const colorOptionss = [
    'Red',
    'Blue',
    'Green',
    'Black',
    'White',
    'Yellow',
    'Purple',
    'Pink',
    'Orange',
    'Rainbow',
    'Beige',
    'Grey',
    'Brown',
    'Olive',
    'Cream',
  ];

  const sizes = [
    'Standard Sizes',
    'Kids Sizes',
    'Footwear Sizes',
    'Plus Sizes',
    'Custom Sizes',
    'Tall & Petite Sizes',
    'Swimwear Sizes',
    'Sleepwear Sizes',
    'Maternity Sizes',
  ];

  const sizeOptionss = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
    '4XL',
    '5XL',
    '26',
    '28',
    '30',
    '32',
    '34',
    '36',
    '38',
    '40',
    '42',
  ];

  const [productData, setProductData] = useState({
    name: '',
    category: 'MEN',
    subcategory: 'T-Shirts & Polos',
    coloroptions: [],
    size: [],
    sizeoptions: [],
    stock: 0,
    price: 0,
    discount: 0,
    description: '',
  });

  const { loading } = useSelector((state) => state.adminProduct);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsFormValid(
      productData.name &&
        productData.description &&
        productData.price &&
        productData.stock >= 0 &&
        productData.category &&
        productData.subcategory &&
        productData.coloroptions?.length > 0 &&
        productData.size?.length > 0 &&
        productData.sizeoptions?.length > 0 &&
        images.some((img) => img !== null)
    );
  }, [productData, images]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prevData) => {
      if (type === 'checkbox') {
        return {
          ...prevData,
          [name]: checked
            ? [...(prevData[name] || []), value]
            : prevData[name].filter((item) => item !== value),
        };
      } else if (type === 'select-multiple') {
        return {
          ...prevData,
          [name]: Array.from(
            e.target.selectedOptions,
            (option) => option.value
          ),
        };
      } else {
        return { ...prevData, [name]: value };
      }
    });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        const newPreview = [...imagesPreview];
        newPreview[index] = reader.result;
        setImagesPreview(newPreview);

        const newImages = [...images];
        newImages[index] = file;
        setImages(newImages);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageDelete = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagesPreview];
    newImages[index] = null;
    newPreviews[index] = null;
    setImages(newImages);
    setImagesPreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.every((img) => img === null)) {
      toast.error('Please upload at least one product image');
      return;
    }

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !images.some((img) => img !== null)
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('category', productData.category);
    formData.append('subcategory', productData.subcategory);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('discount', productData.discount);
    productData.coloroptions.forEach((color) =>
      formData.append('coloroptions[]', color)
    );
    productData.size.forEach((size) => formData.append('size[]', size));
    productData.sizeoptions.forEach((sizeoption) =>
      formData.append('sizeoptions[]', sizeoption)
    );
    images.forEach((image) => {
      if (image) {
        formData.append('images', image);
      }
    });

    try {
      await dispatch(createProduct(formData)).unwrap();
      toast.success('Product created successfully!');
      setProductData({
        name: '',
        price: '',
        description: '',
        category: 'MEN',
        subcategory: 'T-Shirts & Polos',
        coloroptions: [],
        size: [],
        sizeoptions: [],
        discount: '',
        stock: '',
      });
      setCustomColorInput('');
      setCustomSizeInput('');
      setImages(Array(10).fill(null));
      setImagesPreview(Array(10).fill(null));
    } catch (error) {
      console.error('Frontend error:', error);
      toast.error(error || 'An error occurred while creating the product.');
    }
  };

  const toggleOption = (field, option) => {
    setProductData((prevData) => {
      const capitalizedOption =
        field === 'coloroptions'
          ? option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()
          : option;
      if (prevData[field].includes(capitalizedOption)) {
        return {
          ...prevData,
          [field]: prevData[field].filter((item) => item !== capitalizedOption),
        };
      } else {
        return {
          ...prevData,
          [field]: [...prevData[field], capitalizedOption],
        };
      }
    });
  };

  const addCustomColor = () => {
    const capitalizedColor =
      customColorInput.trim().charAt(0).toUpperCase() +
      customColorInput.trim().slice(1).toLowerCase();
    if (
      capitalizedColor &&
      !productData.coloroptions.includes(capitalizedColor)
    ) {
      setProductData((prevData) => ({
        ...prevData,
        coloroptions: [...prevData.coloroptions, capitalizedColor],
      }));
      setCustomColorInput('');
    }
  };

  const addCustomSize = () => {
    const trimmedSize = customSizeInput.trim();
    const capitalizedSize = trimmedSize.toUpperCase();
    if (capitalizedSize && !productData.sizeoptions.includes(capitalizedSize)) {
      setProductData((prevData) => ({
        ...prevData,
        sizeoptions: [...prevData.sizeoptions, capitalizedSize],
      }));
      setCustomSizeInput('');
    }
  };

  const removeOption = (field, option) => {
    setProductData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((item) => item !== option),
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const optionVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8"
      >
        <MetaData title="Create New Product | Faith AND Fast" />
        <Link to="/admin/dashboard">
          <motion.button
            variants={childVariants}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-red-600 dark:to-red-700 text-white px-6 py-2 rounded-full mb-6 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md"
          >
            Back to Dashboard
          </motion.button>
        </Link>
        <motion.h2
          variants={childVariants}
          className="text-4xl font-bold text-center text-yellow-600 dark:text-red-500 mb-8"
        >
          Create New Product
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
              required
              placeholder="Enter product name"
            />
          </motion.div>

          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
              required
              placeholder="Enter product price"
            />
          </motion.div>

          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Description/ProductId
            </label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm min-h-[120px]"
              required
              placeholder="Enter product description"
            />
          </motion.div>

          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              SubCategory
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={productData.subcategory}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
              required
            >
              <option value="" disabled>
                Select SubCategory
              </option>
              {subcategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            variants={childVariants}
            className="space-y-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner"
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Color Options
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptionss.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => toggleOption('coloroptions', option)}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                    productData.coloroptions.includes(option)
                      ? 'bg-yellow-600 dark:bg-red-600  text-white border-yellow-600 shadow-lg'
                      : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-white border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                className="block w-full p-4 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                placeholder="Add custom color"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-6 py-2 bg-yellow-500 text-white rounded-full dark:bg-red-600 dark:hover:bg-red-700   hover:bg-yellow-600 transition-all duration-300 shadow-md"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {productData.coloroptions.map((option) => (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => removeOption('coloroptions', option)}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="px-3 py-1 bg-yellow-600 dark:bg-red-600 text-white rounded-full flex items-center gap-1 hover:bg-yellow-700 transition duration-200 shadow-md"
                  >
                    {option}
                    <XCircle size={14} />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            variants={childVariants}
            className="space-y-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner"
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => toggleOption('size', option)}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                    productData.size.includes(option)
                      ? 'bg-yellow-600 dark:bg-red-600 text-white border-yellow-600 shadow-lg'
                      : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-white border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              Selected: {productData.size.join(', ')}
            </div>
          </motion.div>

          <motion.div
            variants={childVariants}
            className="space-y-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner"
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Size Options
            </label>
            <div className="flex flex-wrap gap-2">
              {sizeOptionss.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => toggleOption('sizeoptions', option)}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                    productData.sizeoptions.includes(option)
                      ? 'bg-yellow-600 dark:bg-red-600 text-white border-yellow-600 shadow-lg'
                      : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-white border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                className="block w-full p-4 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                placeholder="Add custom size"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700  transition-all duration-300 shadow-md"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {productData.sizeoptions.map((option) => (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => removeOption('sizeoptions', option)}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="px-3 py-1 bg-yellow-600 dark:bg-red-600 text-white rounded-full flex items-center gap-1 hover:bg-yellow-700 transition duration-200 shadow-md"
                  >
                    {option}
                    <XCircle size={14} />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
              required
              placeholder="Enter the product quantity"
            />
          </motion.div>

          <motion.div variants={childVariants} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Discount
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={productData.discount}
              onChange={handleInputChange}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
              placeholder="Enter the product discount"
            />
          </motion.div>

          <motion.div
            variants={childVariants}
            className="space-y-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner"
          >
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-100">
              Upload Product Images
            </label>
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                <div key={index} className="flex flex-col items-center">
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, index)}
                    className="block w-full p-4 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-yellow-500 transition duration-200 file:cursor-pointer file:px-4 file:py-2 file:rounded-full file:border-none file:bg-yellow-500 file:text-white file:font-semibold 
                    dark:file:bg-red-600 hover:file:bg-yellow-600
                    dark:hover:file:bg-red-700 shadow-sm"
                    accept="image/*"
                    {...(index === 0 ? { required: true } : {})}
                  />
                  <AnimatePresence>
                    {imagesPreview[index] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 20,
                        }}
                        className="relative mt-3"
                      >
                        <img
                          src={imagesPreview[index]}
                          alt={`Preview ${index}`}
                          className="w-28 h-28 object-cover rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => handleImageDelete(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition duration-200 shadow-md"
                        >
                          <XCircle size={18} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <AnimatePresence>
                {imagesPreview.map(
                  (image, index) =>
                    image && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 20,
                        }}
                        className="relative"
                      >
                        <img
                          src={image}
                          alt={`Preview ${index}`}
                          className="w-28 h-28 object-cover rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => handleImageDelete(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition duration-200 shadow-md"
                        >
                          <XCircle size={18} />
                        </button>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.button
            variants={childVariants}
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-full hover:from-yellow-600 hover:to-yellow-700 dark:hover:from-red-600 dark:hover:to-red-700 dark:from-red-600 dark:to-red-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminAddProduct;
