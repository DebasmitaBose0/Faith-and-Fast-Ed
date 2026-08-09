import { useState, useRef, useEffect } from 'react';
import { User, Camera, Mail, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  updateProfile,
  getSingleDetail,
  uploadAvatar,
  logoutUser,
} from '@/store/auth-slice/user';
import { useNavigate } from 'react-router-dom';
import MetaData from '../extras/MetaData';

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(
    user?.avatar || 'https://placehold.co/150x150'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  useEffect(() => {
    dispatch(getSingleDetail());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        avatar: user.avatar || null,
      });

      if (user.avatar) {
        setProfileImage(user.avatar);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      dispatch(uploadAvatar(file))
        .unwrap()
        .then(() => {
          toast.success('Avatar updated successfully!');
          navigate('/my-profile');
        })
        .catch((error) => {
          toast.error(error || 'Failed to update avatar');
        });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    if (!formData.name || !formData.email || !formData.mobile) {
      toast.error('All fields are required');
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error('mobile number must be 10 digits');
      return;
    }

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (formData.avatar) {
      formDataToSend.append('avatar', formData.avatar);
    }

    dispatch(updateProfile(formDataToSend))
      .unwrap()
      .then(() => {
        toast.success(
          'Profile updated successfully. Please re-login to apply the changes.'
        );
        dispatch(logoutUser());
        navigate('/login');
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to update profile');
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white text-black dark:bg-gray-900 dark:text-white">
      <MetaData title="Update Profile" />
      <div className="mx-auto max-w-6xl rounded-lg shadow-lg dark:bg-gray-900 bg-white text-black dark:text-white p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>

        <div className="flex justify-center">
          <div className="md:w-3/4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-32 h-32 rounded-full overflow-hidden relative bg-gray-200">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={handleImageClick}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-lg"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg dark:bg-gray-900 bg-white">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white text-black"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    loading
                      ? 'bg-yellow-500 dark:bg-red-600 cursor-not-allowed'
                      : 'bg-yellow-500 dark:bg-red-600'
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
