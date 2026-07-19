import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { CircularProgress, Button, TextField } from "@mui/material";
import {
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  IndianRupee,
  Boxes,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getInventoryOverview,
  bulkUpdateStock,
} from "@/store/extra-slice/inventorySlice";
import { hasPermission } from "@/utils/permissions";

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { summary, products, threshold, loading, updating } = useSelector(
    (state) => state.inventory
  );
  const { user } = useSelector((state) => state.auth);
  const canWrite = hasPermission(user, "inventory:write");

  // Local map of productId -> edited stock value (only dirty rows are tracked).
  const [edits, setEdits] = useState({});
  const [thresholdInput, setThresholdInput] = useState(5);

  useEffect(() => {
    dispatch(getInventoryOverview(5));
  }, [dispatch]);

  const handleStockChange = (productId, value) => {
    setEdits((prev) => ({ ...prev, [productId]: value }));
  };

  const handleApplyThreshold = () => {
    const t = parseInt(thresholdInput, 10);
    dispatch(getInventoryOverview(t > 0 ? t : 5));
  };

  const handleBulkSave = () => {
    // Build the updates array from dirty rows that hold a valid number.
    const updates = Object.entries(edits)
      .filter(([, val]) => val !== "" && Number(val) >= 0)
      .map(([productId, val]) => ({ productId, stock: Number(val) }));

    if (updates.length === 0) {
      toast.info("No stock changes to save.");
      return;
    }

    dispatch(bulkUpdateStock(updates))
      .unwrap()
      .then((res) => {
        toast.success(res?.message || "Stock updated successfully");
        setEdits({});
        dispatch(getInventoryOverview(threshold));
      })
      .catch((err) => toast.error(err || "Failed to update stock"));
  };

  const statusBadge = (status) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
      case "LOW_STOCK":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    }
  };

  const statusLabel = (status) =>
    status === "OUT_OF_STOCK"
      ? "Out of Stock"
      : status === "LOW_STOCK"
      ? "Low Stock"
      : "In Stock";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress />
      </div>
    );
  }

  const widgets = summary
    ? [
        {
          icon: Package,
          label: "Total Products",
          value: summary.totalProducts,
          color: "text-blue-600 dark:text-blue-400",
        },
        {
          icon: Boxes,
          label: "Total Stock Units",
          value: summary.totalStockUnits,
          color: "text-purple-600 dark:text-purple-400",
        },
        {
          icon: IndianRupee,
          label: "Inventory Value",
          value: `₹${Number(summary.inventoryValue).toLocaleString()}`,
          color: "text-emerald-600 dark:text-emerald-400",
        },
        {
          icon: CheckCircle,
          label: "Healthy",
          value: summary.healthyCount,
          color: "text-green-600 dark:text-green-400",
        },
        {
          icon: AlertTriangle,
          label: "Low Stock",
          value: summary.lowStockCount,
          color: "text-orange-600 dark:text-orange-400",
        },
        {
          icon: XCircle,
          label: "Out of Stock",
          value: summary.outOfStockCount,
          color: "text-red-600 dark:text-red-400",
        },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Inventory Management
        </h1>
        <div className="flex items-center gap-2">
          <TextField
            label="Low-stock threshold"
            type="number"
            size="small"
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.target.value)}
            className="dark:bg-gray-700 rounded"
            sx={{ width: 160 }}
          />
          <Button variant="outlined" onClick={handleApplyThreshold}>
            Apply
          </Button>
        </div>
      </div>

      {/* Inventory health widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {widgets.map((w) => (
          <div
            key={w.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center text-center"
          >
            <w.icon className={`w-6 h-6 mb-2 ${w.color}`} />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {w.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {w.label}
            </span>
          </div>
        ))}
      </div>

      {/* Low-stock alert banner */}
      {summary && (summary.lowStockCount > 0 || summary.outOfStockCount > 0) && (
        <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-sm text-orange-800 dark:text-orange-300">
            <strong>{summary.outOfStockCount}</strong> product(s) are out of
            stock and <strong>{summary.lowStockCount}</strong> are running low
            (≤ {threshold} units). Review and restock the highlighted items
            below.
          </p>
        </div>
      )}

      {/* Bulk save bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Edit stock values inline, then save all changes at once.
        </p>
        <Button
          variant="contained"
          onClick={handleBulkSave}
          disabled={updating || Object.keys(edits).length === 0 || !canWrite}
          sx={{
            background: "linear-gradient(to right, #16a34a, #15803d)",
            "&:hover": {
              background: "linear-gradient(to right, #15803d, #166534)",
            },
          }}
        >
          {updating
            ? "Saving..."
            : `Save Changes${
                Object.keys(edits).length > 0
                  ? ` (${Object.keys(edits).length})`
                  : ""
              }`}
        </Button>
      </div>

      {/* Product inventory table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-600 dark:text-gray-300">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated By</th>
              <th className="p-3">New Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300 capitalize">
                    {p.category}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    ₹{Number(p.price).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-gray-900 dark:text-gray-100">
                    {p.stock}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(
                        p.status
                      )}`}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {p.lastUpdatedBy ? p.lastUpdatedBy.name : "System"}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      disabled={!canWrite}
                      placeholder={String(p.stock)}
                      value={edits[p._id] ?? ""}
                      onChange={(e) =>
                        handleStockChange(p._id, e.target.value)
                      }
                      className="w-24 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-red-500 disabled:opacity-50"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminInventory;
