import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DollarSign, ToggleLeft, Layers } from "lucide-react";
import axiosInstance from "@/api";

const AdminBulkUpload = () => {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [percentageChange, setPercentageChange] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/product/get");
      if (data.success) {
        // Handle standard product array format
        setProducts(data.products || data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }
    if (!percentageChange) {
      toast.error("Please enter a percentage value.");
      return;
    }
    try {
      const { data } = await axiosInstance.post("/api/bulk-product/update-prices", {
        productIds: selectedIds,
        percentageChange: Number(percentageChange),
      });
      if (data.success) {
        toast.success(data.message);
        setPercentageChange("");
        setSelectedIds([]);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Price adjustment failed");
    }
  };

  const handleBulkStatusChange = async (publishStatus) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }
    try {
      const { data } = await axiosInstance.post("/api/bulk-product/toggle-status", {
        productIds: selectedIds,
        publishStatus,
      });
      if (data.success) {
        toast.success(data.message);
        setSelectedIds([]);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status toggle failed");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 text-gray-900 dark:text-gray-100">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers className="text-yellow-500" /> Bulk Product Operations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Perform batch updates on prices and publishing statuses of multiple products.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
        <div className="space-y-3">
          <label className="block font-semibold text-sm">Adjust Prices (Percentage %)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                %
              </span>
              <input
                type="number"
                value={percentageChange}
                onChange={(e) => setPercentageChange(e.target.value)}
                placeholder="e.g. 10 for price increase, -5 for discount"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleBulkPriceUpdate}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg text-sm transition"
            >
              Update Prices
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block font-semibold text-sm">Toggle Publish/Visibility</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusChange(true)}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition"
            >
              Unpublish Selected
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === products.length && products.length > 0}
                  className="rounded"
                />
              </th>
              <th className="p-3">Product Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onChange={() => handleToggleSelect(p._id)}
                    className="rounded"
                  />
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.publish
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {p.publish ? "Published" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBulkUpload;
