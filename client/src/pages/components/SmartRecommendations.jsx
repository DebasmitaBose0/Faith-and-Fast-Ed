import { useState, useEffect } from "react";
import { Sparkles, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "@/api";

const SmartRecommendations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/api/recommendations/home");
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to load smart recommendations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Finding custom recommendations for you...
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-transparent to-yellow-50/20 dark:to-gray-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="text-yellow-500 animate-pulse" /> Selected Just For You
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personalized suggestions based on rating and popularity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-50">
                <img
                  src={p.images?.[0]?.url}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {p.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {p.discount}% OFF
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 text-sm">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-950 dark:text-gray-50 text-base">
                    ₹{p.price}
                  </span>
                  <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded text-xs text-yellow-600 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 stroke-yellow-500" />
                    {p.ratings ? p.ratings.toFixed(1) : "N/A"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartRecommendations;
