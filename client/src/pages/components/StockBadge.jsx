import PropTypes from "prop-types";

const StockBadge = ({ stock }) => {
  if (stock === 0) {
    return (
      <span className="absolute top-2 left-2 z-10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-red-600 text-white shadow-sm">
        Out of Stock
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="absolute top-2 left-2 z-10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-orange-500 text-white shadow-sm animate-pulse">
        Only {stock} Left
      </span>
    );
  }

  return (
    <span className="absolute top-2 left-2 z-10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-green-600 text-white shadow-sm">
      In Stock
    </span>
  );
};

StockBadge.propTypes = {
  stock: PropTypes.number.isRequired,
};

export default StockBadge;
