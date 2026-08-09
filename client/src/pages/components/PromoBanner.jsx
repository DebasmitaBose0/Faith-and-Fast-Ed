import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { fetchDiscounts } from '@/store/extra-slice/discount';

const SESSION_KEY = 'promoBannerDismissed';

// Return the best active discount to feature — one that is explicitly active,
// has not yet expired, and has already started. Prefers PERCENTAGE over FIXED
// as they're generally more eye-catching.
const pickDiscount = (discounts) => {
  const now = new Date();
  const active = discounts.filter((d) => {
    if (!d.isActive) return false;
    if (d.startDate && new Date(d.startDate) > now) return false;
    if (d.endDate && new Date(d.endDate) < now) return false;
    return true;
  });
  if (active.length === 0) return null;
  const pct = active.find((d) => d.discountType === 'PERCENTAGE');
  return pct || active[0];
};

const formatExpiry = (endDate) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const msLeft = end - now;
  if (msLeft <= 0) return null;
  const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
  if (hoursLeft <= 48) return `${hoursLeft}h left`;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return `${daysLeft} days left`;
};

const PromoBanner = () => {
  const dispatch = useDispatch();
  const { discounts } = useSelector((state) => state.discount);

  // Per-session dismiss — the banner reappears on a fresh session (new tab /
  // browser restart) but not within the same session.
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem(SESSION_KEY)
  );

  useEffect(() => {
    // Only fetch if we don't already have discounts loaded (other components
    // such as AdminDiscount may have already populated the store).
    if (discounts.length === 0) {
      dispatch(fetchDiscounts());
    }
  }, [dispatch, discounts.length]);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  const discount = pickDiscount(discounts);
  if (!discount) return null;

  const valueText =
    discount.discountType === 'PERCENTAGE'
      ? `${discount.discountValue}% off`
      : `₹${discount.discountValue} off`;

  const expiry = formatExpiry(discount.endDate);

  return (
    <div className="relative z-50 w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600 text-yellow-900 dark:text-yellow-950 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center text-sm font-medium pr-6">
        <span>
          🎉 Use code{' '}
          <span className="font-bold tracking-wide bg-yellow-900/10 px-1.5 py-0.5 rounded">
            {discount.name}
          </span>{' '}
          for <span className="font-bold">{valueText}</span>
          {expiry && (
            <span className="ml-1 opacity-80 text-xs">— ends in {expiry}</span>
          )}
        </span>
        <Link
          to="/products"
          className="ml-2 underline underline-offset-2 font-semibold hover:opacity-75 transition-opacity shrink-0"
        >
          Shop Now →
        </Link>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss promotional banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-yellow-900/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PromoBanner;
