import { useState, useRef, useEffect } from "react";
import { User, ShoppingBag, Lock, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import { getSingleDetail } from "@/store/auth-slice/user";
import { useDispatch, useSelector } from "react-redux";
import ActivityLogs from "./ActivityLogs";
import { motion } from "framer-motion";
import MetaData from "../extras/MetaData";

const MyProfile = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeSubTab, setActiveSubTab] = useState("info");

  // eslint-disable-next-line no-unused-vars
  const [profileImage, setProfileImage] = useState(
    user ? user.avatar : 'https://placehold.co/150x150'
  );

  useEffect(() => {
    dispatch(getSingleDetail());
  }, [dispatch]);

  useEffect(() => {
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user]);

  const displayFields = ['name', 'email', 'mobile'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  console.log('User data from Redux:', user);

  return (
    <motion.div
      className="min-h-screen p-4 transition-all bg-white dark:bg-gray-900 text-white dark:text-black"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MetaData title="My Profile" />
      <div className="mx-auto max-w-6xl rounded-lg shadow-lg bg-white dark:bg-black p-6 text-black dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <motion.h1 className="text-2xl font-bold" variants={itemVariants}>
            Account Settings
          </motion.h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <nav className="space-y-2">
              <motion.div variants={itemVariants}>
                <NavLink
                  to="/my-profile"
                  className="block px-4 py-2 rounded-lg bg-yellow-500 text-white dark:bg-red-600"
                >
                  <User size={16} className="inline-block mr-2" /> Profile Info
                </NavLink>
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavLink
                  to="/my-orders"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ShoppingBag size={16} className="inline-block mr-2" /> My
                  Orders
                </NavLink>
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavLink
                  to="/update-password"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Lock size={16} className="inline-block mr-2" /> Update
                  Password
                </NavLink>
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavLink
                  to="/saved-address"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MapPin size={16} className="inline-block mr-2" /> Saved
                  Address
                </NavLink>
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavLink
                  to="/update-profile"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaUserEdit size={16} className="inline-block mr-2" /> Update
                  Profile
                </NavLink>
              </motion.div>
            </nav>
          </div>

          <div className="md:w-3/4">
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 mb-6"
              variants={itemVariants}
            >
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <img
                      src={user?.avatar || 'https://placehold.co/150x150'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold capitalize">
                  {loading ? 'Loading...' : user?.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {loading ? 'Loading...' : user?.role}
                </p>
              </div>
            </motion.div>

            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveSubTab("info")}
                className={`pb-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeSubTab === "info"
                    ? "border-yellow-500 text-yellow-600 dark:border-red-600 dark:text-red-500"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setActiveSubTab("logs")}
                className={`pb-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeSubTab === "logs"
                    ? "border-yellow-500 text-yellow-600 dark:border-red-600 dark:text-red-500"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Activity Logs
              </button>
            </div>

            {activeSubTab === "info" ? (
              <motion.div className="grid gap-4" variants={containerVariants}>
                {displayFields.map((field) => (
                  <motion.div
                    key={field}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900"
                    variants={itemVariants}
                  >
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                    <p className="font-medium ">
                      {user ? user[field] : "Loading..."}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <ActivityLogs />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
