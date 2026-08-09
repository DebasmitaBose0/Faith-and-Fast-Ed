import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * A consistent, accessible empty-state block used across user-facing pages
 * (cart, wishlist, orders, addresses). Renders an icon, a title, optional
 * guidance text, and an optional call-to-action — either a router Link
 * (`actionTo`) or a button (`onAction`).
 */
const EmptyState = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
}) => {
  const actionClasses =
    'inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-yellow-500 hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-red-500';

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      {Icon ? (
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
          <Icon
            className="w-10 h-10 text-gray-400 dark:text-gray-300"
            aria-hidden="true"
          />
        </div>
      ) : null}

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h2>

      {message ? (
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mb-6">
          {message}
        </p>
      ) : null}

      {actionLabel && actionTo ? (
        <Link to={actionTo} className={actionClasses}>
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <button type="button" onClick={onAction} className={actionClasses}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  actionTo: PropTypes.string,
  onAction: PropTypes.func,
};

export default EmptyState;
