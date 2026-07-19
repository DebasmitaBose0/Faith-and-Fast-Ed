import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  deleteWishListItem,
  getWishListItems,
} from "@/store/add-to-wishlist/addToWishList";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WishlistSkeleton from "../components/skeletons/WishlistSkeleton";
import EmptyState from "../components/EmptyState";
import { Heart } from "lucide-react";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { WishListItems, loading, error } = useSelector(
    (state) => state.wishList
  );

  const navigate = useNavigate();
  useEffect(() => {
    dispatch(getWishListItems());
  }, [dispatch]);

  const handleAddCart = (item) => {
    navigate(`/product/${item._id}`);
    toast.info("Add item to Cart from Product page!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent mb-8 text-center">
        My Wishlist
      </h1>

      {loading ? (
        <WishlistSkeleton />
      ) : (
        <>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-center mb-4"
        >
          {error}
        </motion.p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {WishListItems.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={Heart}
                title="Your wishlist is empty"
                message="Save the items you love and they'll appear here. Start exploring our collection."
                actionLabel="Browse Products"
                actionTo="/products"
              />
            </div>
          ) : (
            WishListItems.map((item) => (
              <motion.div
                key={item.productId._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col"
              >
                <Link to={`/product/${item.productId._id}`}>
                  <img
                    src={item.productId.images[0].url}
                    alt={item.productId.name}
                    className="w-full h-48 object-fit rounded-md mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {item.productId.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 flex-grow">
                    {item.productId.description}
                  </p>
                </Link>
                <button
                  onClick={() => handleAddCart(item.productId)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md mt-4"
                >
                  Add to Cart
                </button>
                <div className="mt-4">
                  <Button
                    variant="contained"
                    color="error"
                    size="medium"
                    fullWidth
                    startIcon={<DeleteIcon />}
                    onClick={() => dispatch(deleteWishListItem(item._id))}
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      </>
      )}
    </div>

  );
};

export default WishlistPage;
