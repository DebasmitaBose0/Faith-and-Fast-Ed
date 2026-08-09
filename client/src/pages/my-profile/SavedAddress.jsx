import { useEffect, useState } from 'react';
import { MapPin, PlusCircle, Trash2, Edit2, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  userAddress,
  updateUserAddress,
  deleteUserAddress,
  addUserAddress,
} from '@/store/address-slice/addressSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Country, State, City } from 'country-state-city';
import MetaData from '../extras/MetaData';
import EmptyState from '../components/EmptyState';

const SavedAddress = () => {
  const dispatch = useDispatch();
  const { address, loading, error } = useSelector((state) => state.address);

  const [editData, setEditData] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    mobile: '',
    country: '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    dispatch(userAddress());
    setCountries(Country.getAllCountries());
  }, [dispatch]);

  useEffect(() => {
    if (formData.country) {
      setStates(State.getStatesOfCountry(formData.country));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      setCities(City.getCitiesOfState(formData.country, formData.state));
    }
  }, [formData.state, formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openEditModal = (item) => {
    setEditData(item);
    setFormData({
      address_line: item.address_line,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      mobile: item.mobile,
      country: item.country,
    });
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setFormData({
      address_line: '',
      city: '',
      state: '',
      pincode: '',
      mobile: '',
      country: '',
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!editData?._id) {
      toast.error('Address ID is missing. Cannot update.');
      return;
    }

    if (
      !formData.address_line ||
      !formData.city ||
      !formData.state ||
      !formData.pincode ||
      !formData.mobile ||
      !formData.country
    ) {
      toast.error('All fields are required');
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    if (formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return;
    }
    const updatedData = { ...formData, _id: editData._id };
    dispatch(updateUserAddress(updatedData))
      .unwrap()
      .then(() => {
        toast.success('Address updated successfully!');
        closeEditModal();
      })
      .catch((err) => toast.error(err.message || 'Failed to update address'));
  };

  const handleDelete = (id) => {
    if (!id) {
      toast.error('Address ID is missing. Cannot delete.');
      return;
    }

    dispatch(deleteUserAddress(id))
      .unwrap()
      .then(() => {
        toast.success('Address deleted successfully!');
        // Refresh the address list from state instead of reloading the page.
        dispatch(userAddress());
      })
      .catch((err) => toast.error(err.message || 'Failed to delete address'));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    dispatch(addUserAddress(formData))
      .unwrap()
      .then(() => {
        toast.success('Address added successfully!');
        setIsAdding(false);
        setFormData({
          address_line: '',
          city: '',
          state: '',
          pincode: '',
          mobile: '',
          country: '',
        });
      })
      .catch((err) => toast.error(err.message || 'Failed to add address'));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="min-h-screen p-4 bg-gray-100 text-black dark:bg-gray-900 dark:text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MetaData title="Saved Addresses | Faith AND Fast" />
      <div className="mx-auto max-w-4xl rounded-lg shadow-lg bg-white p-6 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Saved Addresses</h1>
          <motion.button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500
            dark:bg-red-600  text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle size={18} />
            <span>Add New Address</span>
          </motion.button>
        </div>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error.message}</p>}

        <div className="space-y-4">
          {address?.length > 0 ? (
            address.map((item) => (
              <motion.div
                key={item._id}
                className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                variants={itemVariants}
              >
                <div>
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <MapPin
                      size={18}
                      className="text-yellow-500 dark:text-red-600"
                    />
                    <span>
                      {item.address_line}, {item.mobile}
                    </span>
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {item.city}, {item.state}, {item.pincode}, {item.country}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg bg-black dark:bg-white text-white  dark:text-black transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-lg bg-black dark:bg-white text-white  dark:text-black transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <EmptyState
              icon={MapPin}
              title="No addresses saved"
              message="Add a delivery address to make checkout faster next time."
              actionLabel="Add Address"
              onAction={() => setIsAdding(true)}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-96 mt-20"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Address</h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address_line"
                    value={formData.address_line}
                    onChange={handleChange}
                    placeholder="Enter Address"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Pincode
                  </label>
                  <input
                    type="number"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter Pincode"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Mobile
                  </label>
                  <input
                    type="number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter Mobile Number"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-yellow-500 dark:bg-red-600 text-white rounded-lg"
                >
                  Add Address
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-96 mt-20"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Address</h2>
                <button
                  onClick={() => closeEditModal()}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option
                        key={country.isoCode}
                        value={country.isoCode}
                        defaultValue={country.isoCode}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address_line"
                    value={formData.address_line}
                    onChange={handleChange}
                    placeholder="Enter Address"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Pincode
                  </label>
                  <input
                    type="number"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter Pincode"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Mobile
                  </label>
                  <input
                    type="number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter Mobile Number"
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-yellow-500 dark:bg-red-600 text-white rounded-lg"
                >
                  Update Address
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SavedAddress;
