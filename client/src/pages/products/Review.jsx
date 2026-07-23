import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';

const Review = () => {
  const [activeTab, setActiveTab] = useState('description');
  const [wishlist, setWishlist] = useState(new Set());

  const products = [
    {
      id: 1,
      name: 'Men Slim Fit Relaxed Denim Jacket',
      price: 79,
      image: '/api/placeholder/300/400',
      color: 'Yellow',
    },
    {
      id: 2,
      name: 'Men Slim Fit Relaxed Denim Jacket',
      price: 72,
      image: '/api/placeholder/300/400',
      color: 'Navy',
    },
    {
      id: 3,
      name: 'Men Slim Fit Relaxed Denim Jacket',
      price: 80,
      image: '/api/placeholder/300/400',
      color: 'Light Blue',
    },
    {
      id: 4,
      name: 'Men Slim Fit Relaxed Denim Jacket',
      price: 84,
      image: '/api/placeholder/300/400',
      color: 'Dark Blue',
    },
    {
      id: 5,
      name: 'Men Slim Fit Relaxed Denim Jacket',
      price: 77,
      image: '/api/placeholder/300/400',
      color: 'Black/White',
    },
  ];

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs Section */}
      <div className="mb-12">
        <div className="border-b">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'description'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'reviews'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500'
            }`}
          >
            Reviews (122)
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'description' && (
            <div className="text-gray-600">
              <p className="mb-4">
                An e-commerce website is an online platform that facilitates the
                buying and selling of products or services over the internet. It
                serves as a virtual marketplace where businesses and individuals
                can showcase their products, interact with customers, and
                conduct transactions without the need for a physical presence.
                E-commerce websites have gained immense popularity due to their
                convenience, accessibility, and the global reach they offer.
              </p>
              <p>
                E-commerce websites typically display products or services along
                with detailed descriptions, images, prices, and any available
                variations (e.g., sizes, colors). Each product usually has its
                own dedicated page with relevant information.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-gray-600">
              Customer reviews will be displayed here.
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div>
        <h2 className="text-center text-2xl font-medium mb-8">
          <span className="text-gray-500">RELATED</span>{' '}
          <span className="text-gray-800">PRODUCTS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group border border-gray-200 rounded-lg overflow-hidden bg-white"
            >
              {/* Card Container */}
              <div className="aspect-[4/4] relative">
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
                >
                  <Heart
                    className={`w-5 h-5 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>

                {/* Image Container */}
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button className="bg-white text-gray-800 px-4 py-2 rounded opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Quick View
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-2 text-gray-800">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-800">
                    ${product.price}
                  </p>
                  <button className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors duration-300 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;
