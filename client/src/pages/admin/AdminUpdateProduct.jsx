import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { updateProduct } from '@/store/product-slice/AdminProduct';
import { getProductDetails } from '@/store/product-slice/productDetails';
import MetaData from '../extras/MetaData';

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

const ProductUpdatePage = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading: updating } = useSelector((state) => state.adminProduct);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    coloroptions: [],
    size: [],
    sizeoptions: [],
    stock: '',
    discount: '',
  });

  // Existing images already saved on the product (objects with { url, public_id }).
  const [existingImages, setExistingImages] = useState([]);
  // Newly selected File objects. Only these are uploaded; if empty, the backend
  // keeps the existing images untouched.
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [customColorInput, setCustomColorInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await dispatch(getProductDetails(productId)).unwrap();
        setProductData({
          name: response.name || '',
          description: response.description || '',
          price: response.price ?? '',
          category: response.category || '',
          subcategory: response.subcategory || '',
          coloroptions: Array.isArray(response.coloroptions)
            ? response.coloroptions
            : [],
          size: Array.isArray(response.size) ? response.size : [],
          sizeoptions: Array.isArray(response.sizeoptions)
            ? response.sizeoptions
            : [],
          stock: response.stock ?? '',
          discount: response.discount ?? '',
        });
        setExistingImages(
          Array.isArray(response.images) ? response.images : []
        );
      } catch (error) {
        toast.error(
          typeof error === 'string' ? error : 'Failed to load product details'
        );
      } finally {
        setFetching(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [dispatch, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    const previews = [];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB and was skipped`);
        return;
      }
      valid.push(file);
      previews.push(URL.createObjectURL(file));
    });
    setNewImages(valid);
    setNewImagePreviews(previews);
  };

  const toggleOption = (field, option) => {
    setProductData((prev) => {
      const value =
        field === 'coloroptions'
          ? option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()
          : option;
      const current = prev[field] || [];
      return current.includes(value)
        ? { ...prev, [field]: current.filter((item) => item !== value) }
        : { ...prev, [field]: [...current, value] };
    });
  };

  const addCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;
    const capitalized =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (!productData.coloroptions.includes(capitalized)) {
      setProductData((prev) => ({
        ...prev,
        coloroptions: [...prev.coloroptions, capitalized],
      }));
    }
    setCustomColorInput('');
  };

  const addCustomSize = () => {
    const capitalized = customSizeInput.trim().toUpperCase();
    if (!capitalized) return;
    if (!productData.sizeoptions.includes(capitalized)) {
      setProductData((prev) => ({
        ...prev,
        sizeoptions: [...prev.sizeoptions, capitalized],
      }));
    }
    setCustomSizeInput('');
  };

  const removeOption = (field, option) => {
    setProductData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== option),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      productData.price === ''
    ) {
      toast.error('Name, description and price are required');
      return;
    }

    try {
      // Pass a PLAIN OBJECT to the thunk — the thunk builds the FormData itself.
      // Only newly selected File objects are sent; if none, existing images are kept.
      await dispatch(
        updateProduct({
          id: productId,
          productData: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            subcategory: productData.subcategory,
            stock: productData.stock,
            discount: productData.discount === '' ? 0 : productData.discount,
            coloroptions: productData.coloroptions,
            size: productData.size,
            sizeoptions: productData.sizeoptions,
            images: newImages,
          },
        })
      ).unwrap();

      toast.success('Product updated successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(
        typeof error === 'string' ? error : 'Failed to update product'
      );
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 dark:text-gray-300">Loading product…</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MetaData title="Admin | Update Product" />

      <Link to="/admin/dashboard">
        <button className="bg-yellow-500 dark:bg-red-600 text-white px-6 py-2 rounded-full mb-6 hover:bg-yellow-600 dark:hover:bg-red-700 transition-all duration-300 shadow-md">
          Back to Dashboard
        </button>
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Update Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-gray-700 dark:text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={productData.description}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="price"
              className="block text-gray-700 dark:text-gray-300"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-gray-700 dark:text-gray-300"
            >
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              min="0"
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
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
          </div>

          <div>
            <label
              htmlFor="subcategory"
              className="block text-gray-700 dark:text-gray-300"
            >
              SubCategory
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={productData.subcategory}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            >
              <option value="" disabled>
                Select SubCategory
              </option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="discount"
            className="block text-gray-700 dark:text-gray-300"
          >
            Discount (%)
          </label>
          <input
            type="number"
            id="discount"
            name="discount"
            value={productData.discount}
            onChange={handleChange}
            min="0"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Color options */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Color Options
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptionss.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption('coloroptions', option)}
                className={`px-3 py-1 rounded-full border transition ${
                  productData.coloroptions.includes(option)
                    ? 'bg-yellow-600 dark:bg-red-600 text-white border-yellow-600'
                    : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-white border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customColorInput}
              onChange={(e) => setCustomColorInput(e.target.value)}
              placeholder="Add custom color"
              className="flex-1 p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
            <button
              type="button"
              onClick={addCustomColor}
              className="px-4 py-2 bg-yellow-500 dark:bg-red-600 text-white rounded-full"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <AnimatePresence>
              {productData.coloroptions.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => removeOption('coloroptions', option)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1 bg-yellow-600 dark:bg-red-600 text-white rounded-full flex items-center gap-1"
                >
                  {option}
                  <XCircle size={14} />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Size */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption('size', option)}
                className={`px-3 py-1 rounded-full border transition ${
                  productData.size.includes(option)
                    ? 'bg-yellow-600 dark:bg-red-600 text-white border-yellow-600'
                    : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-white border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            Selected: {productData.size.join(', ') || 'None'}
          </div>
        </div>

        {/* Size options */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Size Options
          </label>
          <div className="flex flex-wrap gap-2">
            {sizeOptionss.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption('sizeoptions', option)}
                className={`px-3 py-1 rounded-full border transition ${
                  productData.sizeoptions.includes(option)
                    ? 'bg-yellow-600 dark:bg-red-600 text-white border-yellow-600'
                    : 'bg-white text-gray-700 dark:bg-gray-600 dark:text-white border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              placeholder="Add custom size"
              className="flex-1 p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
            <button
              type="button"
              onClick={addCustomSize}
              className="px-4 py-2 bg-yellow-500 dark:bg-red-600 text-white rounded-full"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <AnimatePresence>
              {productData.sizeoptions.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => removeOption('sizeoptions', option)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1 bg-yellow-600 dark:bg-red-600 text-white rounded-full flex items-center gap-1"
                >
                  {option}
                  <XCircle size={14} />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Current Images
            </label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, index) => (
                <img
                  key={img.public_id || index}
                  src={img.url}
                  alt={`Current ${index}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              ))}
            </div>
          </div>
        )}

        {/* New images (optional) */}
        <div>
          <label
            htmlFor="images"
            className="block text-gray-700 dark:text-gray-300"
          >
            Replace Images (optional)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty to keep the current images. Selecting new images
            replaces all existing ones.
          </p>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 mt-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          />
          {newImagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {newImagePreviews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`New ${index}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <motion.button
            type="submit"
            disabled={updating}
            className="px-6 py-3 mt-6 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            whileHover={{ scale: updating ? 1 : 1.05 }}
            whileTap={{ scale: updating ? 1 : 0.95 }}
          >
            {updating ? 'Updating…' : 'Update Product'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductUpdatePage;
