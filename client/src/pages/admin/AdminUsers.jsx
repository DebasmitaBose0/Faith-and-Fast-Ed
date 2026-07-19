import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllUsers } from "@/store/auth-slice/user";
import { InvoiceSpinner as Spinner } from "../extras/InvoiceSpinner.jsx";
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import MetaData from "../extras/MetaData.jsx";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const {
    users = [],
    loading,
    error,
    totalPages,
  } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAllUsers({ page, search }));
  }, [dispatch, page, search]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  const handleStatus = (status) => {
    if (status === "Active") {
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
    } else if (status === "Inactive") {
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
    } else {
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8"
    >
      <MetaData title="Admin Users | Faith AND Fast" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 text-yellow-500 dark:text-red-600 hover:text-yellow-700 dark:hover:text-red-300 transition-colors"
          >
            <ArrowLeft className="text-xl" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white text-center"
          >
            User Management
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-red-600 transition-all"
          />
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" className="text-yellow-600 dark:text-red-600" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg"
          >
            {toast.error(error)}
          </motion.div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Actions"].map(
                      (header, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <motion.tr
                        key={user._id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === "ADMIN" ? (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100">
                              {user.role}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-red-900 text-yellow-800 dark:text-red-100">
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${handleStatus(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                          >
                            View Details
                          </Link>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <ArrowLeftCircle className="text-lg" />
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Next
                  <ArrowRightCircle className="text-lg" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsers;
