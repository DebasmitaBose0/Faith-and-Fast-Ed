import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDiscounts } from "@/store/extra-slice/discount";
import ConfirmationModal from "../extras/ConfirmationModal";

const DiscountHeader = () => {
  const dispatch = useDispatch();
  const { discounts, loading, error } = useSelector((state) => state.discount);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if the header was closed within the past 2 hours
    const closedTime = localStorage.getItem("discountHeaderClosedAt");
    if (closedTime && Date.now() - closedTime < 2 * 60 * 60 * 1000) {
      setIsVisible(false);
    } else {
      dispatch(fetchDiscounts());
    }
  }, [dispatch]);

  // Instead of closing immediately, open the confirmation modal
  const handleRequestClose = () => {
    setIsModalOpen(true);
  };

  // When user confirms the action
  const handleConfirmClose = () => {
    setIsModalOpen(false);
    setIsVisible(false);
    localStorage.setItem("discountHeaderClosedAt", Date.now());
  };

  // If the user cancels, simply close the modal without hiding the header
  const handleCancelClose = () => {
    setIsModalOpen(false);
  };

  // Choose the first discount to display (if available)
  const discountToShow =
    discounts && discounts.length > 0 ? discounts[0] : null;

  // Calculate the remaining time in hours until the discount expires
  let hoursRemaining = null;
  if (discountToShow && discountToShow.endDate) {
    const endDate = new Date(discountToShow.endDate);
    const now = new Date();
    const diffMs = endDate - now;
    hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            {/* Popup Content */}
            <motion.div
              className="relative bg-yellow-500 dark:bg-red-600 p-6 rounded-lg text-white shadow-lg max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Close Button */}
              <button
                className="absolute top-2 right-2 text-2xl font-bold bg-transparent text-white border-0 cursor-pointer"
                onClick={handleRequestClose}
              >
                &times;
              </button>
              <div className="mt-4 text-center">
                {loading && <p>Loading discounts...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && discountToShow && (
                  <p className="font-bold text-lg">
                    Use coupon code{" "}
                    <span className="underline">{discountToShow.name}</span> for{" "}
                    {discountToShow.discountType === "FIXED"
                      ? `$${discountToShow.discountValue}`
                      : `${discountToShow.discountValue}%`}{" "}
                    discount! Expires in {hoursRemaining}{" "}
                    {hoursRemaining === 1 ? "hour" : "hours"}.
                  </p>
                )}
                {!loading && !error && !discountToShow && (
                  <p className="font-bold text-lg">
                    No discount available at this time.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Confirm Close"
        message="This coupon will not be shown to you for 2 hours. Do you want to continue?"
      />
    </>
  );
};

export default DiscountHeader;
