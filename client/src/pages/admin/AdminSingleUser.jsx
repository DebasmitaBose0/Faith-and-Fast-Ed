import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import {
  deleteUser,
  getSingleUser,
  updateUserRole,
  updateUserStatus,
} from "@/store/auth-slice/user";
import ConfirmationModal from "../extras/ConfirmationModal";
import { toast } from "react-toastify";
import { ArrowLeft, Delete, Edit, Loader } from "lucide-react";
import { Update } from "@mui/icons-material";
import PropTypes from "prop-types";

const SingleUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { singleUser, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getSingleUser(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (singleUser) {
      setSelectedStatus(singleUser.status);
      setSelectedRole(singleUser.role);
    }
  }, [singleUser]);

  const handleStatusChange = async () => {
    try {
      await dispatch(updateUserStatus({ userId: id, status: selectedStatus }));
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  const handleRoleChange = async () => {
    try {
      await dispatch(
        updateUserRole({ email: singleUser.email, role: selectedRole })
      );
      toast.success("Role updated successfully");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error || "Failed to update role");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log("Deleting user...");
      await dispatch(deleteUser(id));

      toast.success("User deleted successfully");

      navigate("/admin/users");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error(error?.message || "Failed to delete user");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" className="text-yellow-600 dark:text-red-600" />
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8"
    >
      <Helmet>
        <title>{singleUser?.name || "User"} - Admin Dashboard</title>
        <meta
          name="description"
          content={`Manage ${singleUser?.name}'s account details and permissions`}
        />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-yellow-700 dark:text-red-600 mb-8"
        >
          <ArrowLeft className="text-xl" />
          Back to Users
        </button>

        {singleUser && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold dark:text-white">
                    {singleUser.name}
                  </h1>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="relative px-4 py-2 rounded-lg bg-red-500 text-white font-medium flex items-center gap-2 transition-all duration-300 ease-in-out hover:bg-red-600 hover:shadow-lg active:scale-95"
                  >
                    <span className="tracking-wide">Delete User</span>
                    <Delete
                      size={20}
                      className="transition-transform duration-300 group-hover:rotate-12"
                    />
                  </button>
                </div>

                <DetailItem label="Email" value={singleUser.email} />
                <DetailItem label="User ID" value={singleUser._id} copyable />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Warning">Warning</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                      <button
                        onClick={handleStatusChange}
                        className="relative flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-white font-semibold shadow-md transition-all duration-300 ease-in-out hover:bg-yellow-600 dark:bg-red-600 dark:hover:bg-red-700 hover:shadow-lg active:scale-95"
                      >
                        <span className="tracking-wide">Update Status</span>
                        <Update className="transition-transform duration-300 group-hover:rotate-6" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Role
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={handleRoleChange}
                        className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-500 text-white font-medium shadow-md transition-all duration-300 ease-in-out dark:bg-red-600 hover:shadow-lg active:scale-95"
                      >
                        <span className="tracking-wide">Update</span>
                        <Edit className="transition-transform duration-300 group-hover:rotate-6" />
                      </button>
                    </div>
                  </div>
                </div>

                <DetailItem label="Mobile" value={singleUser.mobile || "N/A"} />
                <DetailItem
                  label="Address"
                  value={
                    singleUser.addressDetails?.length
                      ? singleUser.addressDetails.join(", ")
                      : "N/A"
                  }
                />
                <DetailItem
                  label="Registered At"
                  value={new Date(singleUser.createdAt).toLocaleDateString()}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </motion.div>
  );
};

const DetailItem = ({ label, value, copyable = false }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="py-2 border-b border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="text-yellow-800 dark:text-red-400 hover:text-gray-500 text-sm"
          >
            Copy
          </button>
        )}
      </div>
      <p className="text-gray-900 dark:text-white font-medium break-all">
        {value}
      </p>
    </div>
  );
};

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  copyable: PropTypes.bool,
};

export default SingleUser;
