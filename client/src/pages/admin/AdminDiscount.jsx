import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  TextField,
  Button,
  Box,
  Typography,
  Modal,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  fetchDiscounts,
  clearMessages,
} from "@/store/extra-slice/discount";
import { getAllUsers } from "@/store/auth-slice/user";
import { hasPermission } from "@/utils/permissions";

const EMPTY_FORM = {
  name: "",
  discountType: "FIXED",
  discountValue: "",
  totalUsersAllowed: "",
  startDate: "",
  endDate: "",
  isActive: "true",
};

// Format an ISO date string to yyyy-mm-dd for a <input type="date">.
const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// Human-readable date for the list rows.
const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Derive a display status: explicitly inactive, expired, scheduled, or live.
const deriveStatus = (discount) => {
  const now = new Date();
  const start = discount.startDate ? new Date(discount.startDate) : null;
  const end = discount.endDate ? new Date(discount.endDate) : null;

  if (!discount.isActive) return { label: "Inactive", color: "default" };
  if (end && end < now) return { label: "Expired", color: "error" };
  if (start && start > now) return { label: "Scheduled", color: "warning" };
  return { label: "Active", color: "success" };
};

const AdminDiscount = () => {
  const dispatch = useDispatch();
  const { discounts, loading, error, successMessage } = useSelector(
    (state) => state.discount
  );
  const { totalUsers, user } = useSelector((state) => state.auth);
  const canWrite = hasPermission(user, "discounts:write");

  const [discountData, setDiscountData] = useState(EMPTY_FORM);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tracks which discount is being edited; null means "create new".
  const [editingId, setEditingId] = useState(null);
  // Tracks which discount is pending delete confirmation.
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchDiscounts());
  }, [dispatch]);

  // Auto-clear success/error banners after a short delay so they don't linger.
  useEffect(() => {
    if (successMessage || error) {
      const t = setTimeout(() => dispatch(clearMessages()), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (e) => {
    setDiscountData({
      ...discountData,
      [e.target.name]: e.target.value,
    });
  };

  // Open the modal in "create" mode with a blank form.
  const openCreateModal = () => {
    setEditingId(null);
    setDiscountData(EMPTY_FORM);
    // Fetch the latest user count so the "All Users" button is accurate.
    dispatch(getAllUsers({ page: 1, limit: 1 }));
    setOpenModal(true);
  };

  // Open the modal in "edit" mode, pre-filled from the chosen discount.
  const openEditModal = (discount) => {
    setEditingId(discount._id);
    setDiscountData({
      name: discount.name || "",
      discountType: discount.discountType || "FIXED",
      discountValue: discount.discountValue ?? "",
      totalUsersAllowed: discount.totalUsersAllowed ?? "",
      startDate: toDateInput(discount.startDate),
      endDate: toDateInput(discount.endDate),
      isActive: discount.isActive ? "true" : "false",
    });
    setOpenModal(true);
  };

  // Create or update depending on whether editingId is set.
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      ...discountData,
      discountValue: Number(discountData.discountValue),
      totalUsersAllowed: Number(discountData.totalUsersAllowed),
      isActive: discountData.isActive === "true",
    };

    if (editingId) {
      await dispatch(
        updateDiscount({ discountId: editingId, discountData: payload })
      );
    } else {
      await dispatch(createDiscount(payload));
    }

    setIsSubmitting(false);
    setDiscountData(EMPTY_FORM);
    setEditingId(null);
    setOpenModal(false);
  };

  const handleConfirmDelete = (id) => {
    dispatch(deleteDiscount(id));
    setConfirmDeleteId(null);
  };

  return (
    <motion.div
      className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography
        variant="h4"
        className="text-center text-gray-800 dark:text-white font-bold"
      >
        Admin Coupon &amp; Discount Management
      </Typography>

      {canWrite && (
        <Button
          onClick={openCreateModal}
          variant="contained"
          fullWidth
          className="bg-blue-500 text-white hover:bg-blue-600 mt-4"
        >
          Create New Discount
        </Button>
      )}

      {successMessage && (
        <Typography variant="body1" className="text-green-500 text-center">
          {successMessage}
        </Typography>
      )}
      {error && (
        <Typography variant="body1" className="text-red-500 text-center">
          {typeof error === "string" ? error : error?.message || "Error"}
        </Typography>
      )}

      {/* Discount List */}
      <Box className="space-y-4 mt-6">
        {loading && discounts.length === 0 ? (
          <Typography variant="body1" className="text-center">
            Loading Discounts...
          </Typography>
        ) : discounts.length === 0 ? (
          <Typography
            variant="body1"
            className="text-center text-gray-500 dark:text-gray-400"
          >
            No discounts yet. Create one to get started.
          </Typography>
        ) : (
          discounts.map((discount) => {
            const status = deriveStatus(discount);
            const usedCount = discount.usedBy?.length || 0;
            return (
              <motion.div
                key={discount._id}
                className="p-4 bg-gray-100 rounded-lg shadow-sm dark:bg-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Typography className="text-gray-800 dark:text-white font-semibold">
                        {discount.name}
                      </Typography>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                      <Chip
                        label={
                          discount.discountType === "FIXED"
                            ? `₹${discount.discountValue} off`
                            : `${discount.discountValue}% off`
                        }
                        size="small"
                        variant="outlined"
                      />
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
                      <p>
                        <span className="font-medium">Valid:</span>{" "}
                        {formatDate(discount.startDate)} —{" "}
                        {formatDate(discount.endDate)}
                      </p>
                      <p>
                        <span className="font-medium">Usage:</span> {usedCount} /{" "}
                        {discount.totalUsersAllowed} redeemed
                      </p>
                      <p>
                        <span className="font-medium">Updated By:</span>{" "}
                        {discount.lastUpdatedBy ? discount.lastUpdatedBy.name : "System"}
                      </p>
                    </div>
                  </div>

                  {canWrite ? (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => openEditModal(discount)}
                        variant="outlined"
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => setConfirmDeleteId(discount._id)}
                        variant="contained"
                        color="error"
                        size="small"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm shrink-0 self-center">—</span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </Box>

      {/* Create / Edit Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        className="flex justify-center items-center p-4"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Typography
            variant="h5"
            className="text-center text-gray-800 dark:text-white mb-4"
          >
            {editingId ? "Edit Discount" : "Create New Discount"}
          </Typography>
          <Box className="space-y-4">
            <TextField
              label="Discount Name / Coupon Code"
              variant="outlined"
              fullWidth
              name="name"
              value={discountData.name}
              onChange={handleChange}
              className="dark:bg-gray-700"
            />
            <TextField
              select
              label="Discount Type"
              variant="outlined"
              fullWidth
              name="discountType"
              value={discountData.discountType}
              onChange={handleChange}
              className="dark:bg-gray-700"
            >
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="PERCENTAGE">Percentage</MenuItem>
            </TextField>
            <TextField
              label="Discount Value"
              variant="outlined"
              fullWidth
              name="discountValue"
              value={discountData.discountValue}
              onChange={handleChange}
              type="number"
              className="dark:bg-gray-700"
            />
            {/* Total Users Allowed — with "All Users" quick-fill button */}
            <Box className="flex items-center gap-2">
              <TextField
                label="Total Users Allowed"
                variant="outlined"
                fullWidth
                name="totalUsersAllowed"
                value={discountData.totalUsersAllowed}
                onChange={handleChange}
                type="number"
                className="dark:bg-gray-700"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setDiscountData((prev) => ({
                    ...prev,
                    totalUsersAllowed: totalUsers ?? "",
                  }))
                }
                disabled={!totalUsers}
                title={
                  totalUsers
                    ? `Fill with total registered users (${totalUsers})`
                    : "Loading user count…"
                }
                className="shrink-0 whitespace-nowrap"
                sx={{ minWidth: "max-content" }}
              >
                {totalUsers ? `All Users (${totalUsers})` : "All Users"}
              </Button>
            </Box>
            <TextField
              label="Start Date"
              variant="outlined"
              fullWidth
              name="startDate"
              value={discountData.startDate}
              onChange={handleChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              className="dark:bg-gray-700"
            />
            <TextField
              label="End Date"
              variant="outlined"
              fullWidth
              name="endDate"
              value={discountData.endDate}
              onChange={handleChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              className="dark:bg-gray-700"
            />
            {/* Active toggle — shown in both modes so a discount can be created
                as inactive, or toggled active/inactive while editing. */}
            <TextField
              select
              label="Status"
              variant="outlined"
              fullWidth
              name="isActive"
              value={discountData.isActive}
              onChange={handleChange}
              className="dark:bg-gray-700"
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="contained"
              fullWidth
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSubmitting
                ? editingId
                  ? "Saving..."
                  : "Creating..."
                : editingId
                ? "Save Changes"
                : "Create Discount"}
            </Button>
          </Box>
        </motion.div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        className="flex justify-center items-center p-4"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Typography
            variant="h6"
            className="text-gray-800 dark:text-white mb-2"
          >
            Delete this discount?
          </Typography>
          <Typography
            variant="body2"
            className="text-gray-600 dark:text-gray-300 mb-6"
          >
            This action cannot be undone. The discount will be permanently
            removed.
          </Typography>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setConfirmDeleteId(null)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmDelete(confirmDeleteId)}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </div>
        </motion.div>
      </Modal>
    </motion.div>
  );
};

export default AdminDiscount;
